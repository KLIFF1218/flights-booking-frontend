#!/bin/sh
set -e

shutdown() {
  echo "Received shutdown signal, stopping Next.js..."
  kill -TERM "$child" 2>/dev/null || true
  wait "$child"
}

trap shutdown TERM INT

pnpm install --frozen-lockfile || pnpm install

PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Turbopack on Docker Desktop (Windows bind mounts) often misses nested
# App Router pages under dynamic segments (e.g. /booking/[id]/seats → 404).
pnpm exec next dev --webpack -H "$HOSTNAME" -p "$PORT" &
child=$!
wait "$child"
