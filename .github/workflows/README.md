# GitHub Actions — Secrets requis

## Secrets à configurer dans Settings → Secrets and variables → Actions

### Turborepo Remote Cache (optionnel, accélère le CI)
| Secret | Description |
|--------|-------------|
| `TURBO_TOKEN` | Token Vercel Remote Cache |
| `TURBO_TEAM` | Slug de l'équipe Vercel (ex: `merkure`) |

### Clerk
| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk (dashboard → API Keys) |

### Base de données (Neon.tech)
| Secret | Description |
|--------|-------------|
| `STAGING_DATABASE_URL` | Connection string Neon staging |
| `PROD_DATABASE_URL` | Connection string Neon production |

### Railway (API Fastify)
| Secret | Description |
|--------|-------------|
| `RAILWAY_TOKEN` | Token Railway (dashboard → Account → Tokens) |
| `RAILWAY_STAGING_SERVICE` | Nom du service Railway staging (ex: `api`) |
| `RAILWAY_PROD_SERVICE` | Nom du service Railway production (ex: `api`) |

### Vercel (Frontend Next.js)
| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Token Vercel (dashboard → Settings → Tokens) |
| `VERCEL_ORG_ID` | ID de l'organisation Vercel |
| `VERCEL_PROJECT_ID` | ID du projet Vercel pour `apps/web` |

### URLs
| Secret | Description |
|--------|-------------|
| `STAGING_API_URL` | URL API staging (ex: `https://api-staging.merkure.app`) |
| `PROD_API_URL` | URL API prod (ex: `https://api.merkure.app`) |

## Environments GitHub à créer

Dans Settings → Environments :
- **staging** — pas de protection requise
- **production** — ajouter une règle "Required reviewers" (1 reviewer minimum recommandé)

## Workflows

### `ci.yml` — Pull Requests
Déclenché sur PR vers `develop` ou `main`, et push sur `develop`.
```
quality (lint + typecheck)
  └── test (postgres + redis services)
        └── build
```

### `deploy.yml` — Déploiements
| Trigger | Job | Cible |
|---------|-----|-------|
| Push `main` | `deploy-staging` | Railway staging + Vercel preview |
| Tag `v*.*.*` | `deploy-production` | Railway prod + Vercel prod + prisma migrate |
