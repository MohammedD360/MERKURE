#!/usr/bin/env bash
# Sauvegarde logique quotidienne de Postgres, à planifier via cron/systemd timer
# sur le VPS. Neon gérait ça automatiquement en PaaS ; sur un Postgres
# auto-hébergé, RIEN ne le fait sans ce script.
#
# Usage : bash backup-postgres.sh
# Cron (tous les jours à 3h) :
#   0 3 * * * cd /opt/merkure/infra && ./backup-postgres.sh >> /var/log/merkure-backup.log 2>&1
#
# IMPORTANT : ce script écrit sur le DISQUE DU VPS. Ce n'est qu'une moitié de
# la stratégie de sauvegarde — configurer en plus un upload vers un stockage
# externe (OVH Object Storage, Backblaze B2, rclone…) dans la section dédiée
# ci-dessous, sinon une panne disque du VPS emporte aussi les sauvegardes.
set -euo pipefail

cd "$(dirname "$0")"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="merkure_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Charge POSTGRES_USER/POSTGRES_DB depuis le .env à côté de ce script.
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "→ Sauvegarde de ${POSTGRES_DB}…"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "${BACKUP_DIR}/${FILENAME}"

SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "✓ ${FILENAME} (${SIZE})"

echo "→ Purge des sauvegardes locales de plus de ${RETENTION_DAYS} jours…"
find "$BACKUP_DIR" -name 'merkure_*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

# ─── Upload externe (à compléter selon le fournisseur choisi) ────────────────
# Exemple avec rclone déjà configuré (rclone config) vers un remote "ovh" :
#   rclone copy "${BACKUP_DIR}/${FILENAME}" ovh:merkure-backups/
#
# Sans ce type d'étape, cette sauvegarde ne protège que contre une erreur
# applicative (mauvaise migration, DROP accidentel) — pas contre une panne du
# VPS lui-même.
