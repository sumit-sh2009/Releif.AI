#!/usr/bin/env bash
# One-time setup: Python venv + npm deps + PostgreSQL for ReliefAI
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════╗"
echo "║       ReliefAI — Setup                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Python virtual environment (Arch requires this) ──────────
if [ ! -d ".venv" ]; then
  echo "[1/6] Creating Python virtual environment..."
  python -m venv .venv
else
  echo "[1/6] Python venv already exists."
fi

VPY="$ROOT/.venv/bin/python"
VPIP="$ROOT/.venv/bin/pip"

echo "[2/6] Installing Python dependencies (this may take a few minutes)..."
"$VPIP" install --upgrade pip
"$VPIP" install -r ai-engine/requirements.txt
"$VPIP" install -r ai-centre/requirements.txt

# ── Environment files ─────────────────────────────────────────
echo "[3/6] Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env — add your GROQ_API_KEY if you have one."
fi
if [ ! -f webapp/.env.local ]; then
  cp webapp/.env.local.example webapp/.env.local
  echo "  Created webapp/.env.local"
fi
# Prisma CLI reads webapp/.env (not .env.local)
if [ ! -f webapp/.env ]; then
  echo 'DATABASE_URL=postgresql://reliefai:reliefai@localhost:5432/reliefai' > webapp/.env
  echo "  Created webapp/.env for Prisma"
fi
# Ensure DATABASE_URL is set
if ! grep -q '^DATABASE_URL=' webapp/.env.local 2>/dev/null; then
  echo 'DATABASE_URL=postgresql://reliefai:reliefai@localhost:5432/reliefai' >> webapp/.env.local
fi
if ! grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  echo 'DATABASE_URL=postgresql://reliefai:reliefai@localhost:5432/reliefai' >> .env
fi
# Optional: copy ai-engine/.env from .env.example if missing
if [ ! -f ai-engine/.env ] && [ -f ai-engine/.env.example ]; then
  cp ai-engine/.env.example ai-engine/.env
  echo "  Created ai-engine/.env from example"
fi

# ── PostgreSQL ────────────────────────────────────────────────
echo "[4/6] Checking PostgreSQL..."
if ss -tlnp 2>/dev/null | grep -q ':5432 '; then
  echo "  ✓ PostgreSQL already listening on :5432"
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "  Starting PostgreSQL via Docker..."
  docker compose up -d postgres
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U reliefai -d reliefai >/dev/null 2>&1; then
      echo "  ✓ PostgreSQL is ready."
      break
    fi
    sleep 1
  done
else
  echo "  ⚠ No PostgreSQL on :5432 and Docker unavailable."
  echo "    Use local Postgres or start Docker, then re-run setup."
fi

# ── Node dependencies + database schema ───────────────────────
echo "[5/6] Installing Node.js dependencies..."
cd webapp && npm install && cd ..

echo "[6/6] Applying database schema and seeding..."
cd webapp
export DATABASE_URL="${DATABASE_URL:-postgresql://reliefai:reliefai@localhost:5432/reliefai}"
# Ensure Prisma can find DATABASE_URL even if .env is missing
grep -q '^DATABASE_URL=' .env 2>/dev/null || echo "DATABASE_URL=$DATABASE_URL" > .env
npx prisma db push
npx prisma generate
npm run db:seed
cd ..

echo ""
echo "✓ Setup complete!"
echo ""
echo "  PostgreSQL: docker compose up -d postgres"
echo "  Ollama:     ollama serve && ollama pull llama3.2"
echo "  Start all:  ./scripts/start-all.sh"
echo ""
