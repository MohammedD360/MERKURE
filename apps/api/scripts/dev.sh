#!/usr/bin/env bash
# Démarre l'API MERKURE — ne plante pas si le port est déjà pris.
set -euo pipefail

PORT="${PORT:-3002}"
API_URL="http://localhost:${PORT}"

if curl -sf "${API_URL}/health" -o /dev/null 2>/dev/null; then
  echo "✓ API MERKURE déjà active sur ${API_URL}"
  echo "  Login : laura@merkure.app / Merkure2026!"
  exit 0
fi

if lsof -i ":${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠ Port ${PORT} occupé par un autre processus."
  echo "  Libère-le : kill \$(lsof -i :${PORT} -sTCP:LISTEN -t)"
  exit 1
fi

echo "→ Démarrage API MERKURE sur le port ${PORT}…"
cd "$(dirname "$0")/.."
exec pnpm exec tsx --env-file .env src/index.ts