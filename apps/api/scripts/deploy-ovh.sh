#!/usr/bin/env bash
# Déploie le worker Bot Trading (Polymarket) sur un VPS OVH via rsync + Docker Compose.
#
# Prérequis sur le VPS : Docker + Docker Compose installés, accès SSH par clé,
# et un fichier infra/.env.bot-worker déjà présent (voir .env.bot-worker.example).
#
# Usage :
#   OVH_HOST=1.2.3.4 OVH_USER=deploy ./scripts/deploy-ovh.sh
set -euo pipefail

OVH_HOST="${OVH_HOST:?Renseigner OVH_HOST (IP ou nom d'hôte du VPS)}"
OVH_USER="${OVH_USER:-deploy}"
REMOTE_DIR="${REMOTE_DIR:-/opt/merkure-bot-worker}"

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"

echo "→ Synchronisation du code vers ${OVH_USER}@${OVH_HOST}:${REMOTE_DIR}..."
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.next' \
  --exclude 'apps/api/.env' \
  --exclude 'infra/.env.bot-worker' \
  "${ROOT_DIR}/" "${OVH_USER}@${OVH_HOST}:${REMOTE_DIR}/"

echo "→ (Re)construction et démarrage du worker sur le VPS..."
ssh "${OVH_USER}@${OVH_HOST}" "cd ${REMOTE_DIR}/infra && docker compose -f docker-compose.bot-worker.yml up -d --build"

echo "→ Statut du conteneur :"
ssh "${OVH_USER}@${OVH_HOST}" "cd ${REMOTE_DIR}/infra && docker compose -f docker-compose.bot-worker.yml ps"

echo "✓ Déploiement terminé. Logs : ssh ${OVH_USER}@${OVH_HOST} 'docker logs -f merkure_bot_worker'"
