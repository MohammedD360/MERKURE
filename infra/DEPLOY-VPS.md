# Guide de déploiement MERKURE — VPS OVH auto-géré

> Remplace `infra/DEPLOY.md` (Railway/Vercel) pour la cible VPS. Les deux
> guides peuvent coexister tant que l'ancienne infra n'est pas décommissionnée.

## 0. Avant de commencer — établir la vérité actuelle

Avant de toucher au VPS, vérifier où tourne réellement la production aujourd'hui
(dashboards Railway, Vercel, Render, DNS actuel) : la documentation historique
et le code (`.github/workflows/deploy.yml`) ne sont pas cohérents entre eux au
moment de l'écriture de ce guide. Ne planifier la bascule DNS qu'une fois cette
topologie réelle confirmée.

Décider aussi si Postgres/Redis restent **managés** (Neon/Upstash — recommandé
pour une première itération, ~30 €/mois, élimine la charge de sauvegarde/
sécurité présentée plus bas) ou sont **auto-hébergés** sur le VPS (ce que ce
guide et `docker-compose.prod.yml` couvrent).

## 1. Provisionner et durcir le VPS

1. Créer le VPS OVH (Debian/Ubuntu récent), pointer le DNS de deux domaines
   vers son IP : `merkure360.com` (web) et `api.merkure360.com` (API).
2. Se connecter en root, créer un utilisateur de déploiement avec une clé SSH :
   ```bash
   adduser deploy
   usermod -aG sudo deploy
   rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
   ```
3. Copier `infra/vps-hardening.sh` sur le VPS et l'exécuter en root :
   ```bash
   scp infra/vps-hardening.sh root@<vps-ip>:~
   ssh root@<vps-ip> 'bash vps-hardening.sh'
   ```
   **Vérifier la connexion SSH par clé dans un second terminal avant de fermer
   la session root** — le script désactive ensuite le login root et par mot de
   passe.
4. Ajouter l'utilisateur de déploiement au groupe docker :
   ```bash
   sudo usermod -aG docker deploy && newgrp docker
   ```

## 2. Cloner le dépôt et créer les secrets

```bash
git clone <repo> /opt/merkure
cd /opt/merkure/infra
```

Créer `infra/.env` (jamais commité, permissions restreintes) :

```bash
touch .env && chmod 600 .env
```

Variables requises dans `infra/.env` :

```
# Registre d'images (utilisé par `docker compose pull` lors des déploiements CI,
# voir .github/workflows/deploy-vps.yml) — en minuscules, ex. ghcr.io/mon-org/merkure
GHCR_IMAGE_PREFIX=ghcr.io/<org>/<repo>

# Postgres / Redis (générer des mots de passe forts, jamais ceux du dépôt)
POSTGRES_USER=merkure
POSTGRES_PASSWORD=<généré>
POSTGRES_DB=merkure_db
REDIS_PASSWORD=<généré>

# Domaines (TLS automatique par Caddy)
DOMAIN_WEB=merkure360.com
DOMAIN_API=api.merkure360.com

# Build-time du front (figé dans le bundle, voir next.config.mjs)
NEXT_PUBLIC_API_URL=https://api.merkure360.com
NEXT_PUBLIC_WS_URL=wss://api.merkure360.com
NEXT_PUBLIC_AUTH_MODE=clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# API
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
JWT_SECRET=<openssl rand -hex 64>
ENCRYPTION_KEY=<openssl rand -hex 32>
AI_SERVICE_SECRET=<openssl rand -hex 32>
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ELITE=price_...
FRONTEND_URL=https://merkure360.com
NODE_ENV=production
AUTH_MODE=clerk

# Resend (obligatoire en production — voir config/env.ts, le boot échoue sans elle)
RESEND_API_KEY=re_...
RESEND_FROM=noreply@merkure360.com
```

Génération des secrets aléatoires :
```bash
openssl rand -hex 64   # JWT_SECRET
openssl rand -hex 32   # ENCRYPTION_KEY, AI_SERVICE_SECRET
```

**Ne jamais réutiliser une valeur déjà vue sur Railway** — régénérer chaque
secret pour cet environnement.

## 3. Premier déploiement

```bash
cd /opt/merkure/infra
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres redis
docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @merkure/api db:migrate:prod
docker compose -f docker-compose.prod.yml up -d
```

Vérifier que tout est sain :
```bash
docker compose -f docker-compose.prod.yml ps
curl -s https://api.merkure360.com/health | jq .
curl -s -o /dev/null -w "%{http_code}\n" https://merkure360.com/
```

## 4. Sauvegardes

```bash
chmod +x backup-postgres.sh
crontab -e
# ajouter :
0 3 * * * cd /opt/merkure/infra && ./backup-postgres.sh >> /var/log/merkure-backup.log 2>&1
```

Compléter la section upload externe de `backup-postgres.sh` (rclone vers OVH
Object Storage ou équivalent) — sans ça, les sauvegardes vivent sur le même
disque que la base qu'elles protègent. **Tester une restauration** avant de
considérer cette étape terminée :
```bash
gunzip -c infra/backups/merkure_<date>.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U merkure -d merkure_db
```

## 4bis. Monitoring

Uptime Kuma démarre avec le reste du compose (`docker-compose.prod.yml`), mais
n'est **jamais exposé publiquement** — accès uniquement via tunnel SSH depuis
ton poste, pour ne pas exiger un sous-domaine avant la première mise en prod :

```bash
ssh -L 3011:localhost:3011 deploy@<vps-ip>
# puis ouvrir http://localhost:3011 dans le navigateur
```

Premier accès : créer le compte admin, ajouter un check HTTP(S) sur
`https://<DOMAIN_WEB>/` et `https://<DOMAIN_API>/health`, configurer une
notification (email, Discord…) sur passage en échec.

## 5. CI/CD

`.github/workflows/deploy-vps.yml` build les 3 images, les pousse sur GHCR,
puis se connecte en SSH pour redéployer. Secrets GitHub à configurer
(Settings → Secrets and variables → Actions) :

| Secret | Contenu |
|---|---|
| `VPS_HOST` | IP ou domaine du VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Clé privée SSH dédiée au déploiement (pas ta clé perso) |
| `GHCR_TOKEN` | Personal Access Token avec `write:packages` (ou `GITHUB_TOKEN` suffit si le repo est le même) |

Le workflow ne gère pas la création de `infra/.env` sur le VPS — il reste géré
manuellement (étape 2), volontairement, pour ne jamais faire transiter de
secrets de prod par les logs CI.

## 6. Migrations futures

```bash
# 1. En local : générer la migration
pnpm --filter @merkure/api db:migrate

# 2. Commiter et pousser — le CI build les images
git add apps/api/prisma/migrations/
git commit -m "chore(db): add migration <description>"
git push

# 3. Une fois les images déployées par le CI, appliquer la migration sur le VPS
ssh deploy@<vps-ip> \
  'cd /opt/merkure/infra && docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @merkure/api db:migrate:prod'
```

## 7. Rollback

Pas de bouton "Redeploy" comme sur Railway — le rollback se fait par tag
d'image :
```bash
ssh deploy@<vps-ip>
cd /opt/merkure/infra
docker compose -f docker-compose.prod.yml pull   # ou cibler un tag précédent
docker compose -f docker-compose.prod.yml up -d
```
Pour une migration défaillante : voir la procédure manuelle (SQL inverse +
suppression de la ligne dans `_prisma_migrations`) documentée dans
`infra/DEPLOY.md` section 7 — elle reste valable telle quelle.

## 8. Différences à retenir par rapport à Railway

- **TLS** : géré par Caddy (`infra/Caddyfile`), pas automatique comme sur Railway.
- **Secrets** : fichier `infra/.env` sur le VPS, pas d'injection via une UI.
- **Scaling** : ressources fixes du VPS (voir `deploy.resources.limits` dans
  `docker-compose.prod.yml`) — pas d'autoscaling.
- **Sauvegardes** : à la charge du VPS (`backup-postgres.sh`) si Postgres est
  auto-hébergé — Neon les gérait automatiquement.
- **Monitoring** : rien d'équivalent au dashboard Railway par défaut — prévoir
  un outil léger (Uptime Kuma, netdata) en complément de ce guide.
- **Ports internes** : Postgres/Redis/service IA ne sont **jamais** exposés
  sur l'IP publique du VPS, contrairement à un Postgres managé accessible par
  connection string publique — tout transite par le réseau Docker interne.
