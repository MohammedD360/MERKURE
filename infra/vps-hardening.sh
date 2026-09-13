#!/usr/bin/env bash
# Durcissement de base d'un VPS OVH neuf (Debian/Ubuntu) avant d'y installer
# Docker et l'application MERKURE. À exécuter une fois, en root, juste après
# la première connexion SSH.
#
# Usage : scp ce fichier sur le VPS puis `sudo bash vps-hardening.sh`
#
# IMPORTANT — avant de lancer ce script :
#   1. Créer un utilisateur non-root et lui copier ta clé publique SSH
#      (ssh-copy-id <user>@<vps-ip>) — sinon tu perds l'accès au serveur une
#      fois PermitRootLogin/PasswordAuthentication désactivés plus bas.
#   2. Vérifier que cette clé fonctionne AVANT de fermer la session root.
set -euo pipefail

echo "→ Mise à jour du système…"
apt-get update && apt-get upgrade -y

echo "→ Installation ufw, fail2ban, unattended-upgrades…"
apt-get install -y ufw fail2ban unattended-upgrades

echo "→ Pare-feu : deny incoming par défaut, seuls SSH/HTTP/HTTPS ouverts…"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP (redirection Let's Encrypt)
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo "→ Durcissement SSH (clé uniquement, pas de root)…"
SSHD_CONFIG=/etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/'            "$SSHD_CONFIG"
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' "$SSHD_CONFIG"
systemctl restart sshd

echo "→ fail2ban sur sshd…"
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
maxretry = 5
bantime = 1h
findtime = 10m
EOF
systemctl enable --now fail2ban

echo "→ Mises à jour de sécurité automatiques…"
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "→ Installation de Docker Engine + Compose plugin…"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "→ Installation de ufw-docker (Docker manipule iptables directement et"
echo "  contourne sinon les règles ufw sur les ports publiés)…"
curl -fsSL https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker -o /usr/local/bin/ufw-docker
chmod +x /usr/local/bin/ufw-docker
ufw-docker install
systemctl restart ufw

cat <<'EOF'

✓ Durcissement terminé.

Rappels avant d'aller plus loin :
  - Docker Compose ne doit publier AUCUN port pour postgres/redis/ai-service
    (voir infra/docker-compose.prod.yml) — seul Caddy publie 80/443.
  - Vérifie l'accès SSH par clé dans une AUTRE session avant de fermer celle-ci.
  - Ajoute l'utilisateur de déploiement au groupe docker :
      usermod -aG docker <user> && newgrp docker
EOF
