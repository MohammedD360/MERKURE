# Guide de déploiement MERKURE — Bêta Railway (50 testeurs)

> Version 1.0 · Mai 2026 · Confidentiel

---

## Sommaire

1. [Pré-requis](#1-pré-requis)
2. [Variables d'environnement Railway](#2-variables-denvironnement-railway)
3. [Déploiement Railway CLI](#3-déploiement-railway-cli)
4. [Migration base de données](#4-migration-base-de-données)
5. [Inviter les 50 testeurs](#5-inviter-les-50-testeurs)
6. [Smoke tests post-déploiement](#6-smoke-tests-post-déploiement)
7. [Procédure de rollback](#7-procédure-de-rollback)

---

## 1. Pré-requis

### Comptes à créer avant de démarrer

| Service | URL | Usage | Coût estimé |
|---------|-----|-------|-------------|
| **Railway** | https://railway.app | Hébergement API + Web | ~25 €/mois |
| **Neon.tech** | https://neon.tech | PostgreSQL managé | ~19 €/mois |
| **Upstash** | https://upstash.com | Redis managé | ~10 €/mois |
| **Clerk** | https://clerk.com | Authentification | Gratuit jusqu'à 10 000 MAU |
| **Anthropic** | https://console.anthropic.com | Claude API (service IA) | Pay-as-you-go ~0,05 €/user/mois |

### Outils locaux requis

```bash
# Node.js 20+
node --version   # >= 20.0.0

# pnpm
pnpm --version   # >= 9.0.0

# Railway CLI
npm install -g @railway/cli
railway --version

# Git
git --version
```

### Configuration Neon.tech

1. Créer une base de données : `merkure_prod`
2. Récupérer la connection string dans **Settings → Connection string** (format `postgresql://...?sslmode=require`)
3. Activer l'extension `pgcrypto` via l'éditeur SQL Neon :
   ```sql
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

### Configuration Upstash Redis

1. Créer une base Redis dans la région la plus proche de Railway (ex: `eu-west-1`)
2. Récupérer l'URL dans **Data → REST API → Redis URL** (format `rediss://...`)
3. Activer **TLS** (activé par défaut sur Upstash)

### Configuration Clerk

1. Créer une application Clerk nommée `MERKURE`
2. Dans **Settings → API Keys** : noter la **Publishable Key** (`pk_live_...`) et la **Secret Key** (`sk_live_...`)
3. Dans **Webhooks** : créer un webhook pointant vers `https://merkure-api.up.railway.app/api/v1/webhooks/clerk`
   - Événements à écouter : `user.created`, `user.updated`, `user.deleted`
   - Noter le **Signing Secret** (`whsec_...`)

---

## 2. Variables d'environnement Railway

### Service `api`

Configurer les variables suivantes dans Railway → service `api` → **Variables** :

```
NODE_ENV                          = production
PORT                              = 3001
DATABASE_URL                      = postgresql://...?sslmode=require
REDIS_URL                         = rediss://...
AUTH_MODE                         = clerk
CLERK_SECRET_KEY                  = sk_live_...
CLERK_WEBHOOK_SECRET              = whsec_...
JWT_SECRET                        = <64 bytes hex — générer ci-dessous>
JWT_REFRESH_SECRET                = <64 bytes hex — générer ci-dessous>
JWT_ACCESS_EXPIRES_IN             = 15m
JWT_REFRESH_EXPIRES_IN            = 7d
FRONTEND_URL                      = https://merkure-web.up.railway.app
AI_SERVICE_URL                    = http://ai-service.railway.internal:8000
AI_SERVICE_SECRET                 = <32 bytes hex — générer ci-dessous>
ANTHROPIC_API_KEY                 = sk-ant-...
STRIPE_SECRET_KEY                 = sk_live_...
STRIPE_WEBHOOK_SECRET             = whsec_...
STRIPE_PRICE_STARTER              = price_...
STRIPE_PRICE_PRO                  = price_...
STRIPE_PRICE_ELITE                = price_...
ENCRYPTION_KEY                    = <64 hex chars — générer ci-dessous>
```

### Service `web`

```
NODE_ENV                          = production
NEXT_PUBLIC_API_URL               = https://merkure-api.up.railway.app
NEXT_PUBLIC_WS_URL                = wss://merkure-api.up.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY                  = sk_live_...
```

### Génération des secrets

Exécuter localement pour générer les valeurs aléatoires :

```bash
# JWT_SECRET et JWT_REFRESH_SECRET (64 bytes = 128 hex chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# AI_SERVICE_SECRET (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Important** : stocker ces valeurs dans un gestionnaire de secrets (1Password, Bitwarden) avant de les saisir dans Railway. Elles ne peuvent pas être récupérées une fois injectées.

---

## 3. Déploiement Railway CLI

### 3.1 Authentification et initialisation

```bash
# Se connecter à Railway
railway login

# Se placer à la racine du monorepo
cd /path/to/tradeedge-pro

# Initialiser le projet (si première fois)
railway init
# → Sélectionner "Create new project"
# → Nommer le projet : merkure-beta
```

### 3.2 Lier les services existants (si déjà créés via l'UI Railway)

```bash
# Lier le projet existant
railway link
```

### 3.3 Déploiement des deux services

```bash
# Déployer le service API
railway up --service api

# Déployer le service Web
railway up --service web
```

### 3.4 Vérifier les domaines publics

Après le déploiement, aller dans **Railway → service → Settings → Networking** et générer les domaines publics :
- API : `https://merkure-api.up.railway.app`
- Web : `https://merkure-web.up.railway.app`

Mettre à jour la variable `FRONTEND_URL` du service `api` avec l'URL finale du web.

### 3.5 Build arguments pour le service web

Dans Railway → service `web` → **Settings → Build** → **Build Arguments** :

```
NEXT_PUBLIC_API_URL = https://merkure-api.up.railway.app
NEXT_PUBLIC_WS_URL  = wss://merkure-api.up.railway.app
```

> Ces variables doivent être des **Build Args** (pas seulement des variables d'env) car Next.js les injecte au moment de la compilation, pas à l'exécution.

---

## 4. Migration base de données

### 4.1 Migration initiale (première mise en production)

```bash
# Appliquer toutes les migrations Prisma sur la BDD de production
railway run --service api pnpm --filter @merkure/api db:migrate:prod
```

Cette commande exécute `prisma migrate deploy` qui applique les migrations en attente sans les recréer.

### 4.2 Seeding de données de démonstration (optionnel pour la bêta)

```bash
# Injecter des données de démo pour faciliter les tests
railway run --service api pnpm --filter @merkure/api db:seed
```

### 4.3 Migrations futures

À chaque nouveau déploiement contenant des changements de schéma Prisma :

```bash
# 1. Générer la migration en local (jamais directement en prod)
pnpm --filter @merkure/api db:migrate

# 2. Commiter la migration générée dans prisma/migrations/
git add apps/api/prisma/migrations/
git commit -m "chore(db): add migration <description>"

# 3. Déployer puis appliquer la migration
railway up --service api
railway run --service api pnpm --filter @merkure/api db:migrate:prod
```

---

## 5. Inviter les 50 testeurs

### Option A — Authentification Clerk (AUTH_MODE=clerk, recommandé)

1. Dans le **Dashboard Clerk → Users**, cliquer sur **Invite users**
2. Entrer les adresses email des testeurs (50 max)
3. Clerk envoie automatiquement un email d'invitation avec lien d'inscription
4. Les testeurs créent leur compte via `https://merkure-web.up.railway.app/sign-up`

Pour créer les comptes en masse via l'API Clerk :

```bash
# Exemple avec curl (répéter pour chaque testeur ou scripter)
curl -X POST https://api.clerk.com/v1/invitations \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"email_address": "testeur@exemple.com"}'
```

### Option B — Mode démo (AUTH_MODE=demo)

Si `AUTH_MODE=demo`, l'application utilise l'authentification JWT interne sans Clerk :

1. Partager l'URL de l'application : `https://merkure-web.up.railway.app`
2. Les testeurs peuvent s'inscrire directement via `POST /api/v1/auth/register`
3. Ou utiliser les comptes de démo créés via `db:seed`

### Gestion des accès testeurs

- Tous les testeurs bêta peuvent être assignés au plan `Starter` par défaut
- Pour upgrader un testeur en `Pro` ou `Elite` : créer un coupon Stripe à 100% de réduction
- Surveiller les inscriptions dans Railway → Logs ou dans le Dashboard Clerk

---

## 6. Smoke tests post-déploiement

Vérifier que tous les endpoints critiques répondent correctement après chaque déploiement.

### API

```bash
API_URL=https://merkure-api.up.railway.app

# Health check
curl -s "$API_URL/health" | jq .
# Attendu : { "status": "ok", "uptime": <number>, "db": "connected", "redis": "connected" }

# API health
curl -s "$API_URL/api/health" | jq .
# Attendu : { "status": "ok" }

# Endpoint authentifié (doit retourner 401 sans token)
curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/me"
# Attendu : 401
```

### Web

```bash
WEB_URL=https://merkure-web.up.railway.app

# Page d'accueil
curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/"
# Attendu : 200

# Dashboard (doit rediriger vers sign-in)
curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/app/dashboard"
# Attendu : 200 ou 307 (redirect vers /sign-in)
```

### Test de connexion complète

1. Ouvrir `https://merkure-web.up.railway.app` dans un navigateur
2. S'inscrire avec un compte de test
3. Vérifier que le dashboard se charge (même avec données mockées)
4. Vérifier que le WebSocket se connecte (aucune erreur dans la console navigateur)
5. Vérifier que les appels API apparaissent dans les logs Railway

---

## 7. Procédure de rollback

### Rollback rapide via Railway (recommandé)

Railway conserve l'historique des déploiements. En cas de problème :

1. Aller dans **Railway → service → Deployments**
2. Identifier le dernier déploiement stable
3. Cliquer sur **Redeploy** pour remettre en production la version précédente
4. Le rollback est effectif en ~2 minutes

### Rollback via Git + Railway CLI

```bash
# Identifier le commit stable
git log --oneline -10

# Revenir au commit stable
git checkout <commit-sha>

# Redéployer
railway up --service api
railway up --service web

# Revenir sur la branche principale
git checkout main
```

### Rollback de migration BDD

En cas de migration défaillante, Prisma ne supporte pas le rollback automatique. Procédure manuelle :

```bash
# 1. Identifier la migration problématique
railway run --service api pnpm exec prisma migrate status

# 2. Se connecter à la BDD Neon via psql
psql "$DATABASE_URL"

# 3. Appliquer manuellement le SQL inverse (down migration)
# Les fichiers SQL sont dans apps/api/prisma/migrations/<timestamp>_<name>/

# 4. Marquer la migration comme non-appliquée dans _prisma_migrations
DELETE FROM _prisma_migrations WHERE migration_name = '<nom_migration>';
```

> **Prévention** : Toujours écrire des migrations réversibles (éviter DROP COLUMN, préférer nullable → NOT NULL en deux étapes).

### Contacts d'urgence

En cas d'incident majeur en production, contacter l'équipe technique via le canal d'urgence.

---

*Guide rédigé pour MERKURE v0.1.0 — Bêta Mai 2026*
