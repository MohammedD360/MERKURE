#!/usr/bin/env bash
set -euo pipefail

PORT="${EXPO_PORT:-8083}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Metro déjà actif sur le port $PORT — ouverture du simulateur iOS…"
  xcrun simctl openurl booted "exp://127.0.0.1:$PORT" 2>/dev/null || true
  exit 0
fi

echo "Démarrage Metro + simulateur iOS (port $PORT)…"
exec npx expo start --ios --port "$PORT"