#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

port_open() {
  ss -tlnp 2>/dev/null | grep -q ":$1 "
}

service_up() {
  curl -sf --max-time 2 "$1" >/dev/null 2>&1
}

if [ ! -d ".venv" ]; then
  echo "❌ Python venv not found. Run: ./scripts/setup.sh"
  exit 1
fi

VPY="$ROOT/.venv/bin/python"
VUVICORN="$ROOT/.venv/bin/uvicorn"

# Load env but do NOT export PORT (Next.js would steal it)
AI_ENGINE_URL="http://localhost:8000"
AI_CENTRE_URL="http://localhost:7860"
AI_ENGINE_PORT=8000
if [ -f .env ]; then
  set -a; source .env; set +a
  AI_ENGINE_URL="${AI_ENGINE_URL:-http://localhost:8000}"
  AI_CENTRE_URL="${AI_CENTRE_URL:-http://localhost:7860}"
  AI_ENGINE_PORT="${AI_ENGINE_PORT:-8000}"
fi
unset PORT

DATABASE_URL="${DATABASE_URL:-postgresql://reliefai:reliefai@localhost:5432/reliefai}"
if [ -f .env ]; then
  set -a; source .env; set +a
  DATABASE_URL="${DATABASE_URL:-postgresql://reliefai:reliefai@localhost:5432/reliefai}"
fi

# Ensure PostgreSQL is available (local install or Docker)
if ss -tlnp 2>/dev/null | grep -q ':5432 '; then
  echo "✓ PostgreSQL running on :5432"
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if ! docker compose exec -T postgres pg_isready -U reliefai -d reliefai >/dev/null 2>&1; then
    echo "[0/3] Starting PostgreSQL via Docker..."
    docker compose up -d postgres
    sleep 3
  else
    echo "✓ PostgreSQL running (Docker)"
  fi
else
  echo "⚠  PostgreSQL not detected on :5432 — API/database features will fail"
fi
ENGINE_PID=""
CENTRE_PID=""
WEB_PID=""

echo "╔══════════════════════════════════════════╗"
echo "║         ReliefAI — Starting All          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

if port_open 11434; then
  echo "✓ Ollama running on :11434"
else
  echo "⚠  Ollama not running. Start: ollama serve && ollama pull llama3.2"
fi

# AI Engine on :8000
if service_up "$AI_ENGINE_URL/"; then
  echo "✓ AI Engine already running at $AI_ENGINE_URL"
elif port_open "$AI_ENGINE_PORT"; then
  echo "⚠  Port $AI_ENGINE_PORT busy — not AI Engine. Run: ./scripts/stop-all.sh"
else
  echo "[1/3] Starting AI Engine on :$AI_ENGINE_PORT..."
  (cd ai-engine && PORT="$AI_ENGINE_PORT" "$VPY" api_server.py) &
  ENGINE_PID=$!
  sleep 2
fi

# AI Centre on :7860
if service_up "$AI_CENTRE_URL/"; then
  echo "✓ AI Centre already running at $AI_CENTRE_URL"
elif port_open 7860; then
  echo "⚠  Port 7860 busy"
else
  echo "[2/3] Starting AI Centre on :7860..."
  (cd ai-centre && "$VUVICORN" ai_api:app --host 0.0.0.0 --port 7860) &
  CENTRE_PID=$!
  sleep 1
fi

# Webapp on :3000 — always explicit, never inherit PORT
if port_open 3000; then
  echo "✓ Webapp already running at http://localhost:3000"
else
  echo "[3/3] Starting Webapp on :3000..."
  (
    cd webapp
    PORT=3000 DATABASE_URL="$DATABASE_URL" AI_ENGINE_URL="$AI_ENGINE_URL" AI_CENTRE_URL="$AI_CENTRE_URL" npm run dev
  ) &
  WEB_PID=$!
fi

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$ENGINE_PID" ] && kill "$ENGINE_PID" 2>/dev/null || true
  [ -n "$CENTRE_PID" ] && kill "$CENTRE_PID" 2>/dev/null || true
  [ -n "$WEB_PID" ]    && kill "$WEB_PID" 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo "────────────────────────────────────────────"
echo "  Website     → http://localhost:3000"
echo "  Get Help    → http://localhost:3000/get-help"
echo "  AI Engine   → $AI_ENGINE_URL"
echo "  AI Centre   → $AI_CENTRE_URL"
echo "────────────────────────────────────────────"
echo "Press Ctrl+C to stop."
echo ""

if [ -n "$ENGINE_PID" ] || [ -n "$CENTRE_PID" ] || [ -n "$WEB_PID" ]; then
  wait
fi
