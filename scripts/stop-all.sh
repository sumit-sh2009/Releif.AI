#!/usr/bin/env bash
# Stop ReliefAI services (ports 3000, 8000, 7860)
set -euo pipefail

echo "Stopping ReliefAI services..."

for PORT in 3000 8000 7860; do
  PIDS=$(ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' || true)
  if [ -n "$PIDS" ]; then
    echo "  Stopping :$PORT (pid $PIDS)"
    echo "$PIDS" | xargs -r kill 2>/dev/null || true
  else
    echo "  :$PORT — free"
  fi
done

sleep 1
echo "Done. Restart with: ./scripts/start-all.sh"
