# MERKURE — Document Technique de Projet

> Version 1.0 · Avril 2026 · Confidentiel

---

## Jalon 1 — Fondations MERKURE

Objectif immédiat : disposer d'une base locale stable, brandée MERKURE, avec Next.js App Router côté web, Fastify côté API, Prisma aligné, et une authentification local-first.

Décisions actives :
- Le chemin de repo reste `tradeedge-pro`, l'identité produit devient `MERKURE`.
- `AUTH_MODE=demo` est le mode local par défaut et ne nécessite aucune clé externe.
- `AUTH_MODE=clerk` active Clerk uniquement si les variables Clerk sont fournies.
- Brokers réels, Stripe complet, IA opérationnelle, staging et déploiement sont reportés aux jalons suivants.

Commandes locales :

```bash
pnpm install
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d postgres redis
pnpm --filter @merkure/api db:generate
pnpm dev
```

Commandes ciblées :

```bash
pnpm --filter @merkure/web dev
pnpm --filter @merkure/api dev
pnpm typecheck
pnpm lint
pnpm --filter @merkure/web build
pnpm --filter @merkure/api typecheck
pnpm test
```

Smoke local attendu :
- Web : `http://localhost:3000/`, `/app/dashboard`, `/app/accounts`
- API : `http://localhost:3001/health`, `/api/health`, `/api/v1/me`

---

## Table des matières

1. [Vision & Objectifs](#1-vision--objectifs)
2. [Architecture Globale](#2-architecture-globale)
3. [Stack Technologique](#3-stack-technologique)
4. [Structure du Monorepo](#4-structure-du-monorepo)
5. [Base de Données — Modèle de Données](#5-base-de-données--modèle-de-données)
6. [Backend API — Fastify](#6-backend-api--fastify)
7. [Frontend React](#7-frontend-react)
8. [Service IA Python](#8-service-ia-python)
9. [Intégrations Brokers](#9-intégrations-brokers)
10. [Sécurité](#10-sécurité)
11. [Infrastructure & Déploiement](#11-infrastructure--déploiement)
12. [Roadmap de Développement](#12-roadmap-de-développement)
13. [Variables d'Environnement](#13-variables-denvironnement)
14. [Conventions de Code](#14-conventions-de-code)

---

## 1. Vision & Objectifs

### 1.1 Problème résolu

70 à 80 % des traders retail perdent de l'argent. Les raisons sont structurelles :
- Aucun outil de suivi de performance en temps réel
- Gestion du risque inexistante ou manuelle
- Absence de feedback objectif sur les décisions de trading
- Accès limité aux stratégies de qualité institutionnelle

### 1.2 Solution

**MERKURE** est une plateforme SaaS B2C construite en React.js, connectée aux principales plateformes de trading (MetaTrader 4/5, Binance, Interactive Brokers, cTrader). Elle offre :

| Module | Description |
|--------|-------------|
| **Dashboard Analytics** | KPIs temps réel : Solde, Drawdown, Sharpe, Win Rate, Profit Factor |
| **Gestion des Risques** | Alertes drawdown, calcul lot size optimal, score de risque |
| **Performance par Stratégie** | Backtesting, comparaison, détection sous-performance |
| **Matching IA** | Recommandation de stratégies compatibles avec le profil trader |
| **Assistant IA** | Coaching personnalisé, journal de trading, score 0-100 |

### 1.3 Modèle économique

```
Plan Starter   →  19 €/mois  (1 compte, stats essentielles)
Plan Pro       →  49 €/mois  (3 comptes, Assistant IA, Matching basique)
Plan Elite     → 129 €/mois  (illimité, IA avancée, API access)
Institutionnel →  Sur devis  (white-label, multi-traders)
```

---

## 2. Architecture Globale

### 2.1 Décision architecturale : Monolithe Modulaire

**Choix retenu** : Monolithe modulaire Node.js + sidecar Python IA.

**Rejeté** : Microservices — trop de DevOps pour une équipe early-stage (3-5 devs), coût infrastructure 3-4x supérieur, time-to-market +3 mois.

**Exception** : Le service IA Python tourne en sidecar indépendant (contrainte technique Python/Node, pas architecturale). Communication HTTP interne sur réseau privé.

### 2.2 Schéma des composants

```
┌──────────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR (Browser)                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTPS / WSS
                    ┌────────▼─────────┐
                    │  Cloudflare CDN  │  (WAF, DDoS, cache assets)
                    └────────┬─────────┘
                             │
              ┌──────────────▼───────────────┐
              │     Next.js App Router (Vercel)        │
              │  Next.js App Router + TypeScript + Tailwind │
              │  TanStack Query + Zustand     │
              │  Recharts + shadcn/ui         │
              └──────────────┬───────────────┘
                             │ REST + WebSocket
              ┌──────────────▼───────────────┐
              │    API Gateway (Fastify)       │
              │    Node.js 20 + TypeScript    │
              │                               │
              │  ┌─────────────────────────┐  │
              │  │  Auth · Trades · KPIs   │  │
              │  │  Risk · Brokers · AI    │  │
              │  └───────────┬─────────────┘  │
              │              │                │
              │  ┌───────────▼──────────────┐ │
              │  │   BullMQ Workers          │ │
              │  │ (sync, alerts, emails)    │ │
              │  └───────────────────────────┘ │
              └──────┬─────────────┬───────────┘
                     │             │
           ┌─────────▼───┐   ┌─────▼──────┐
           │ PostgreSQL   │   │   Redis     │
           │ (Neon.tech)  │   │ (Upstash)   │
           │ données métier│  │ cache+queues│
           └─────────────┘   └────────────┘
                     │
        ┌────────────▼────────────┐
        │  Service IA (FastAPI)   │
        │  Python 3.11            │
        │                         │
        │  ┌────────────────────┐ │
        │  │  /score  → Pandas  │ │
        │  │  /coaching → Claude│ │
        │  │  /match → sklearn  │ │
        │  └────────────────────┘ │
        └─────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │    Broker Adapters       │
        │  MT4/MT5 · Binance       │
        │  IB · cTrader            │
        └─────────────────────────┘
```

### 2.3 Flux de données principal

```
1. Utilisateur ouvre le Dashboard
2. React Query → GET /api/v1/kpis?period=1M
3. API vérifie cache Redis (TTL 5 min)
4. Si miss → Prisma query PostgreSQL → calcul KPIs → set cache
5. Retour JSON → rendu des composants React

6. BullMQ Worker tourne en parallèle :
   - Toutes les 15 min (Starter) / 5 min (Pro) / 1 min (Elite)
   - Appel BrokerAdapter.getTradeHistory()
   - Insert/Update trades en BDD
   - Recalcul KpiSnapshot journalier
   - Invalidation cache Redis
   - Évaluation règles alertes
   - Emission WebSocket si changement de position
```

---

## 3. Stack Technologique

### 3.1 Frontend

| Outil | Version | Rôle |
|-------|---------|------|
| Next.js | 16.x | App Router, build et routing web |
| React | 18.3 | UI principale |
| TypeScript | 5.6 | Typage strict |
| TanStack Query | 5.x | Server state, cache, invalidation |
| Zustand | 5.x | Client state léger |
| Tailwind CSS | 3.4 | Utility-first CSS |
| shadcn/ui | latest | Composants Radix accessibles |
| Recharts | 2.x | Graphiques financiers (AreaChart, PieChart) |
| Lucide React | 0.460 | Icônes |
| Socket.io-client | 4.x | WebSocket temps réel |
| Zod | 3.x | Validation côté client |
| date-fns | 4.x | Manipulation de dates |

**Justification Next.js App Router** : routing fichier, rendu serveur possible, intégration Clerk native, et cible de déploiement Vercel directe.

**Justification Recharts** : Bibliothèque React-native, composable, pas de dépendance D3 directe.

### 3.2 Backend (Node.js)

| Outil | Version | Rôle |
|-------|---------|------|
| Node.js | 20 LTS | Runtime |
| Fastify | 5.x | Framework HTTP (2x plus rapide qu'Express) |
| Prisma | 5.x | ORM type-safe, migrations automatiques |
| BullMQ | 5.x | Job queues (sync broker, alertes, emails) |
| ioredis | 5.x | Client Redis |
| @fastify/jwt | 9.x | JWT access tokens |
| @fastify/websocket | 11.x | WebSocket via Socket.io |
| bcryptjs | 2.x | Hash des mots de passe (12 rounds) |
| Zod | 3.x | Validation des requêtes entrantes |

**Justification Fastify vs Express** :
- 2x plus rapide en req/s benchmarks
- Schema validation JSON natif
- TypeScript first-class avec décoration de routes
- Plugin ecosystem mature (@fastify/*)

**Justification Prisma vs Drizzle/TypeORM** :
- DX supérieure (Prisma Studio, migrations visuelles)
- Type inference automatique depuis le schema
- Support natif Row Level Security via raw queries
- `prisma generate` = types synchronisés avec la BDD

### 3.3 Service IA (Python)

| Outil | Version | Rôle |
|-------|---------|------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.115 | Framework HTTP async |
| Pandas | 2.2 | Calculs sur DataFrames de trades |
| NumPy | 2.1 | Calculs mathématiques bas niveau |
| scikit-learn | 1.5 | ML classique (scoring, matching, clustering) |
| Anthropic SDK | 0.37 | Intégration Claude API (coaching IA) |
| Pydantic v2 | 2.9 | Validation des modèles de données |
| Celery + Redis | 5.4 | Tâches IA asynchrones |

### 3.4 Infrastructure

| Service | MVP (Railway) | Scale (AWS) |
|---------|--------------|-------------|
| Frontend | Vercel | CloudFront + S3 |
| API Node.js | Railway (~25€/mois) | ECS Fargate |
| AI Service | Railway (~25€/mois) | ECS Fargate |
| PostgreSQL | Neon.tech (~19€/mois) | RDS Aurora |
| Redis | Upstash (~10€/mois) | ElastiCache |
| Emails | Resend (~10€/mois) | SES |
| Monitoring | Axiom (free tier) | CloudWatch |
| **TOTAL MVP** | **~120€/mois** | — |

---

## 4. Structure du Monorepo

### 4.1 Organisation (Turborepo + pnpm workspaces)

```
tradeedge-pro/
│
├── apps/
│   ├── web/                          ← Next.js Frontend (App Router)
│   │   └── src/
│   │       ├── features/             ← Feature-based (pas layer-based)
│   │       │   ├── dashboard/        ← Module 1 — Analytics
│   │       │   │   ├── DashboardPage.tsx
│   │       │   │   └── components/
│   │       │   │       ├── KpiCards.tsx
│   │       │   │       ├── EquityChart.tsx
│   │       │   │       ├── AssetBreakdown.tsx
│   │       │   │       ├── StatsAndStrategy.tsx
│   │       │   │       ├── EconomicCalendar.tsx
│   │       │   │       ├── AiAnalysisBanner.tsx
│   │       │   │       ├── RightPanel.tsx
│   │       │   │       └── TradesTable.tsx
│   │       │   ├── comptes/          ← Module Gestion des Comptes
│   │       │   │   ├── ComptesPage.tsx
│   │       │   │   └── components/
│   │       │   │       ├── CompteCard.tsx
│   │       │   │       └── ConnectBrokerModal.tsx
│   │       │   ├── risk/             ← Module 2 — Risques (à venir)
│   │       │   ├── strategies/       ← Module 3 — Stratégies (à venir)
│   │       │   ├── matching/         ← Module 4 — Matching IA (à venir)
│   │       │   └── assistant/        ← Module 5 — Assistant IA (à venir)
│   │       ├── shared/
│   │       │   └── components/
│   │       │       ├── Sidebar.tsx
│   │       │       ├── Header.tsx
│   │       │       ├── KpiCard.tsx
│   │       │       └── ErrorBoundary.tsx
│   │       ├── lib/
│   │       │   ├── mock-data.ts      ← Données mock Dashboard
│   │       │   ├── mock-comptes.ts   ← Données mock Comptes
│   │       │   └── navigation.ts     ← Type Page (routing interne)
│   │       ├── store/                ← Zustand stores (à venir)
│   │       ├── App.tsx               ← Router principal (switch page)
│   │       └── main.tsx              ← Entry point + QueryClientProvider
│   │
│   ├── api/                          ← Node.js Fastify Backend
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── env.ts            ← Validation Zod des variables d'env
│   │   │   ├── modules/              ← Domain modules (à créer)
│   │   │   │   ├── auth/             ← Login, register, refresh token
│   │   │   │   ├── trades/           ← CRUD trades, filtres, pagination
│   │   │   │   ├── kpis/             ← Calcul et cache des KPIs
│   │   │   │   ├── risk/             ← Alertes, lot size calculator
│   │   │   │   ├── brokers/
│   │   │   │   │   ├── adapters/     ← Interface + implémentations
│   │   │   │   │   └── workers/      ← BullMQ sync workers
│   │   │   │   ├── ai/               ← Proxy vers service Python
│   │   │   │   └── alerts/           ← Gestion des alertes
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/client.ts ← Instance Prisma singleton
│   │   │   │   ├── cache/redis.ts    ← Client Redis + helpers cache
│   │   │   │   └── queue/queues.ts   ← BullMQ queues + workers
│   │   │   ├── middleware/           ← Auth, tenant, rate-limit
│   │   │   ├── websocket/            ← Socket.io handlers
│   │   │   └── index.ts              ← Point d'entrée Fastify
│   │   └── prisma/
│   │       ├── schema.prisma         ← Source de vérité BDD
│   │       ├── seed.ts               ← Données de démo
│   │       └── migrations/           ← Migrations auto-générées
│   │
│   └── ai-service/                   ← Python FastAPI
│       └── app/
│           ├── core/
│           │   ├── config.py         ← Settings Pydantic
│           │   └── security.py       ← Vérification shared secret
│           ├── routes/               ← Endpoints REST (à créer)
│           ├── services/
│           │   ├── quant.py          ← Calculs financiers déterministes
│           │   └── coaching.py       ← Intégration Claude API
│           ├── models/               ← Schémas Pydantic
│           └── main.py               ← Entry point FastAPI
│
├── packages/
│   └── shared-types/                 ← Types TypeScript partagés
│       └── src/
│           ├── trades.ts             ← Trade, TradeFilters, Period
│           ├── kpis.ts               ← KpiSnapshot, KpiSummary, DashboardData
│           ├── user.ts               ← User, TraderProfile, AuthUser
│           ├── broker.ts             ← BrokerAccount, AccountInfo
│           ├── api.ts                ← ApiResponse, WsEvent, pagination
│           └── index.ts              ← Re-exports centralisés
│
├── infra/
│   ├── docker-compose.yml            ← PostgreSQL 16 + Redis 7 (dev local)
│   └── init-db.sql                   ← Extensions pgcrypto, uuid-ossp, pg_trgm
│
├── turbo.json                        ← Turborepo pipeline
├── pnpm-workspace.yaml               ← Workspaces
├── tsconfig.base.json                ← Config TypeScript partagée (strict)
├── .prettierrc                       ← Formatage uniforme
├── .env.example                      ← Template variables d'env
└── .gitignore                        ← .env exclu du VCS
```

### 4.2 Philosophie Feature-Based

Le frontend est organisé par **feature** (fonctionnalité produit), pas par layer technique. Cela signifie que tout ce qui concerne les "Comptes" (composants, hooks, types locaux) est dans `features/comptes/`, pas dispersé entre `components/`, `hooks/`, `services/`.

**Avantages** :
- Un développeur peut travailler sur une feature sans toucher les autres
- Cohésion haute, couplage bas
- Suppression d'une feature = suppression d'un dossier

---

## 5. Base de Données — Modèle de Données

### 5.1 Choix de base de données

| BDD | Usage | Justification |
|-----|-------|---------------|
| **PostgreSQL 16** | Données métier principales | ACID, JSON natif, extensions financières, Row Level Security |
| **Redis 7** | Cache, sessions, queues BullMQ | Sub-milliseconde, TTL natif, Pub/Sub pour WebSocket |
| **TimescaleDB** *(Phase 2)* | Historique prices time-series | Extension PostgreSQL (pas de nouvelle BDD à opérer) |

**Pas de MongoDB** : Le schéma est structuré et relationnel. PostgreSQL avec JSONB couvre tous les cas dynamiques sans ajouter une BDD supplémentaire.

### 5.2 Stratégie Multi-Tenant

**Row Level Security (RLS) PostgreSQL** — chaque requête Prisma est automatiquement filtrée par `user_id` grâce à une politique RLS activée sur toutes les tables sensibles. Aucune donnée d'un utilisateur ne peut fuiter vers un autre.

```sql
-- Exemple sur la table trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY trades_isolation ON trades
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

Le middleware Node.js injecte le contexte utilisateur avant chaque requête :
```typescript
await db.$executeRaw`SELECT set_config('app.current_user_id', ${req.user.id}, true)`;
```

### 5.3 Modèles Prisma (résumé)

```
Organization     → tenant principal (plan, stripe_customer_id)
  └── User        → trader, admin, manager (email, password_hash)
       ├── TraderProfile    → style, marchés, expérience, embedding IA
       ├── RefreshToken     → hash token + fingerprint navigateur
       ├── BrokerAccount    → broker connecté, credentials chiffrés
       │    └── Trade       → historique de trades (OHLC, P&L, lot size)
       ├── KpiSnapshot      → P&L, Sharpe, Drawdown — 1 ligne/jour/user
       ├── Strategy         → stratégie taggée (marketplace Phase 3)
       ├── Alert            → alertes déclenchées (drawdown, lot size...)
       └── AiJournalEntry   → entrées journal IA (coaching, score, insights)

Subscription     → lien Organization ↔ Stripe
```

### 5.4 Index critiques pour les performances

```sql
-- Requêtes KPIs par période = les plus fréquentes
CREATE INDEX idx_trades_user_time ON trades(user_id, close_time DESC);
-- Filtres par symbole pour statistiques
CREATE INDEX idx_trades_symbol ON trades(user_id, symbol);
-- Snapshots KPIs journaliers
UNIQUE INDEX ON kpi_snapshots(user_id, date);
-- Refresh tokens
UNIQUE INDEX ON refresh_tokens(token_hash);
```

### 5.5 Stratégie Cache Redis

```
kpis:{user_id}:{period}         TTL 5 min   — KPIs calculés (le plus appelé)
trades:live:{account_id}        TTL 30 sec  — Positions ouvertes
session:{token}                 TTL 7 jours — Session utilisateur
ratelimit:{ip}:{endpoint}       TTL 1 min   — Rate limiting par IP
broker:sync:{account_id}        TTL 30 sec  — Lock anti-double-sync
ai:score:{user_id}:{date}       TTL 1 heure — Score IA journalier

BullMQ Queues Redis :
  broker-sync    — Sync périodique des comptes (toutes les 15/5/1 min)
  alert-process  — Détection et envoi d'alertes
  ai-request     — Requêtes Claude API (batch non-urgent)
  email-send     — Emails transactionnels
```

---

## 6. Backend API — Fastify

### 6.1 Architecture des modules

Chaque module suit la même structure :

```
modules/trades/
├── trades.routes.ts      ← Définition des routes + schemas Zod
├── trades.service.ts     ← Business logic (pas de BDD directe ici)
├── trades.repository.ts  ← Accès Prisma uniquement ici
└── trades.types.ts       ← Types locaux au module
```

### 6.2 Endpoints API prévus (Phase 1 MVP)

#### Auth
```
POST   /api/v1/auth/register          Création de compte
POST   /api/v1/auth/login             Connexion (→ cookies HttpOnly)
POST   /api/v1/auth/logout            Révocation token
POST   /api/v1/auth/refresh           Renouvellement access token
GET    /api/v1/auth/me                Profil utilisateur courant
```

#### Trades
```
GET    /api/v1/trades                 Liste avec filtres (symbol, période, direction)
GET    /api/v1/trades/:id             Détail d'un trade
GET    /api/v1/trades/open            Positions ouvertes
POST   /api/v1/trades/import          Import manuel CSV/XLSX
```

#### KPIs
```
GET    /api/v1/kpis?period=1M         KPIs + courbe equity + répartition actifs
GET    /api/v1/kpis/snapshot/:date    Snapshot d'une date précise
POST   /api/v1/kpis/recalculate       Recalcul forcé (admin)
```

#### Brokers
```
GET    /api/v1/brokers                Liste des comptes connectés
POST   /api/v1/brokers                Connecter un nouveau compte
PATCH  /api/v1/brokers/:id            Modifier label/paramètres
DELETE /api/v1/brokers/:id            Déconnecter un compte
POST   /api/v1/brokers/:id/sync       Sync manuelle immédiate
GET    /api/v1/brokers/:id/status     Statut de sync en cours
```

#### Risques
```
POST   /api/v1/risk/lotsize           Calcul lot size optimal
GET    /api/v1/risk/score             Score de risque global du jour
GET    /api/v1/alerts                 Liste des alertes
PATCH  /api/v1/alerts/:id/read        Marquer comme lue
POST   /api/v1/alerts/settings        Configurer les seuils d'alerte
```

#### IA (proxy vers service Python)
```
GET    /api/v1/ai/score               Score de performance 0-100
POST   /api/v1/ai/coaching            Analyse coaching personnalisée
POST   /api/v1/ai/journal             Entrée journal du jour
GET    /api/v1/ai/matches             Stratégies recommandées
```
  
### 6.3 Middleware chain

```
Request
  │
  ├── Helmet (sécurité headers)
  ├── CORS (origins whitelistées)
  ├── Rate Limiter (100 req/min global, 5/min auth)
  ├── JWT Verify (→ req.user)
  ├── Tenant Resolver (→ set_config PostgreSQL)
  ├── Plan Check (features gating par plan)
  └── Route Handler
```

### 6.4 WebSocket — Événements temps réel

```typescript
// Côté serveur (Socket.io)
type WsEventType =
  | 'position:update'   // Position ouverte modifiée (prix, P&L flottant)
  | 'position:close'    // Position fermée → refresh KPIs
  | 'alert:triggered'   // Alerte déclenchée (drawdown, etc.)
  | 'sync:complete'     // Sync broker terminée
  | 'sync:error'        // Erreur de sync broker

// Authentification WebSocket : JWT dans le handshake
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  // verify JWT → next() ou next(new Error('Unauthorized'))
})
```

---

## 7. Frontend Next.js

### 7.1 Navigation App Router

La navigation web du jalon 1 utilise Next.js App Router :
- `/` : landing MERKURE
- `/app/dashboard` : dashboard en mode démo ou Clerk
- `/app/accounts` : comptes mockés
- `/sign-in` et `/sign-up` : Clerk si configuré, fallback démo sinon

Le shell applicatif réutilise les composants existants `Sidebar`, `Header`, dashboard et comptes.

```typescript
// lib/navigation.ts — type union de toutes les pages
export type Page =
  | 'dashboard' | 'comptes' | 'portefeuille' | 'positions' | 'transactions'
  | 'performance' | 'statistiques' | 'rapports'
  | 'assistant' | 'strategies' | 'backtesting' | 'scanner'
  | 'conseils' | 'journal'
```

### 7.2 Gestion du state

| Type de state | Solution | Raison |
|---------------|----------|--------|
| Server state (API data) | TanStack Query | Cache, invalidation, refetch automatique |
| Navigation | useState local | Simple, suffit pour MVP sans URL |
| User session | Zustand store | Persisté en mémoire, accessible partout |
| Formulaires | React Hook Form + Zod | Validation client side-by-side avec le schéma API |
| UI ephémère (modales, tabs) | useState local | Pas besoin de global pour l'UI locale |

### 7.3 Composants clés existants

#### KpiCards (`features/dashboard/components/KpiCards.tsx`)
- 6 cartes avec sparklines Recharts miniatures
- Cercles de progression SVG pour Sharpe et Win Rate
- Delta vs période précédente avec icône TrendingUp/Down

#### EquityChart (`features/dashboard/components/EquityChart.tsx`)
- AreaChart Recharts avec gradient indigo
- Sélecteur de période 1J/7J/1M/3M/6M/YTD/1Y/ALL
- Toggle "En pourcentage"
- Tooltip custom avec date + valeur + delta depuis départ

#### CompteCard (`features/comptes/components/CompteCard.tsx`)
- Badge SyncStatus (Synchronisé / Synchronisation... / Erreur / En attente)
- Métriques : Solde, Equity, P&L Total, Marge libre
- Barre Win Rate avec dégradé indigo
- Bannière d'erreur rouge avec message technique + bouton "Reconnecter"

#### ConnectBrokerModal (`features/comptes/components/ConnectBrokerModal.tsx`)
- 3 étapes : Choix broker → Formulaire → Succès
- Formulaire adapté par broker (MT4/MT5 = MetaAPI, Binance = API Key, IB = TWS...)
- Simulation de connexion avec état de chargement

### 7.4 Convention de nommage CSS

```
.card               → bg-[#111827] border border-gray-800/60 rounded-xl p-4-6
.kpi-value          → font-mono text-2xl font-semibold tabular-nums
.text-profit        → text-green-400
.text-loss          → text-red-400
.badge-profit       → bg-green-500/10 text-green-400 border-green-500/20
.badge-loss         → bg-red-500/10 text-red-400 border-red-500/20
```

**Palette principale** :
```
Background app      → #0d1117
Background card     → #111827
Border              → gray-800/60
Accent              → indigo-600 (#4f46e5)
Profit              → green-400 (#4ade80)
Loss                → red-400 (#f87171)
Neutral             → gray-400
```

---

## 8. Service IA Python

### 8.1 Architecture en 3 couches

```
┌─────────────────────────────────────────────────────────────────┐
│  COUCHE 1 — CALCULS DÉTERMINISTES (Pandas + NumPy)              │
│  Sharpe Ratio · Drawdown Max · Win Rate · Profit Factor · R/R   │
│  → Microseconde · Coût 0 · 100% reproductible                   │
├─────────────────────────────────────────────────────────────────┤
│  COUCHE 2 — ML CLASSIQUE (scikit-learn)                         │
│  Score 0-100 · Matching stratégies · Clustering profils         │
│  → Millisecondes · Coût négligeable · Training offline          │
├─────────────────────────────────────────────────────────────────┤
│  COUCHE 3 — LLM GÉNÉRATIF (Claude API via Anthropic SDK)        │
│  Coaching personnalisé · Journal IA · Recommandations texte     │
│  → Secondes · ~0.02-0.05€/user/mois · Prompt Caching activé    │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Formules financières implémentées (`services/quant.py`)

```python
# Sharpe Ratio annualisé
sharpe = (excess_returns.mean() / excess_returns.std()) * sqrt(252)

# Drawdown Maximum
rolling_max = equity.expanding().max()
drawdown = (equity - rolling_max) / rolling_max
max_dd = drawdown.min()  # valeur négative

# Profit Factor
PF = gross_profit / abs(gross_loss)  # > 1.5 = bon, > 2 = excellent

# Lot Size Optimal (Kelly simplifié)
risk_amount = balance * risk_percent        # ex: 10000 * 0.02 = 200€
lot_size = risk_amount / (sl_pips * pip_value)
```

### 8.3 Intégration Claude API

```python
# Prompt Caching activé → économie ~90% sur les tokens input
response = client.messages.create(
    model="claude-sonnet-4-6",
    system=[{
        "type": "text",
        "text": SYSTEM_PROMPT,
        "cache_control": {"type": "ephemeral"}  # ← cache le system prompt
    }],
    messages=[{"role": "user", "content": build_prompt(trader_context)}]
)
```

**Coût estimé** : 0.02 à 0.05€ par utilisateur actif par mois (1 appel coaching/jour).

### 8.4 Sécurité inter-services

Le service Python n'est **jamais exposé directement à internet**. Il écoute uniquement en localhost / réseau privé. Chaque requête est authentifiée par un `X-AI-Service-Secret` partagé (256 bits aléatoires).

```python
# core/security.py
def verify_service_secret(api_key: str = Security(api_key_header)) -> str:
    if api_key != settings.AI_SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Invalid service secret")
    return api_key
```

---

## 9. Intégrations Brokers

### 9.1 Abstraction commune

```typescript
interface BrokerAdapter {
  connect(credentials: BrokerCredentials): Promise<void>
  getAccountInfo(): Promise<AccountInfo>
  getOpenPositions(): Promise<Position[]>
  getTradeHistory(from: Date, to: Date): Promise<Trade[]>
  subscribeToUpdates(callback: (update: BrokerUpdate) => void): void
  disconnect(): void
}
```

Tous les brokers implémentent cette interface. Le code métier ne connaît que `BrokerAdapter`, jamais les implémentations spécifiques.

### 9.2 MT4/MT5 — Stratégie

**Problème** : MT4/MT5 n'ont pas d'API REST native.

| Approche | MVP (Phase 1) | Production (Phase 3) |
|----------|---------------|---------------------|
| Solution | **MetaAPI** (SaaS) | **Expert Advisor MQL** propriétaire |
| Coût | ~50$/mois pour 50 comptes | 0€ (développement initial uniquement) |
| Avantage | 0 DevOps, WebSocket live inclus | Indépendance, coût maîtrisé à l'échelle |
| Inconvénient | Dépendance tiers | Utilisateur doit installer l'EA |

### 9.3 Fréquences de synchronisation par plan

```
Starter   → 1 fois toutes les 15 minutes (BullMQ cron)
Pro       → 1 fois toutes les 5 minutes
Elite     → Sync temps réel via WebSocket broker (1 min max)
```

### 9.4 Sécurité des credentials broker

Les API keys et mots de passe MT4 sont des données **ultra-sensibles** :

```
1. Chiffrement AES-256-GCM via pgcrypto (PostgreSQL)
2. Clé de chiffrement stockée en variable d'env (pas en BDD)
3. Scope API Binance : lecture seule OBLIGATOIRE (trading jamais autorisé)
4. Jamais loggés, jamais transmis en clair
5. Audit trail : chaque accès aux credentials est loggé (user, timestamp, action)
6. RGPD : droit à l'effacement → cascade delete + anonymisation
```

---

## 10. Sécurité

### 10.1 Authentification

```
Stratégie    : JWT access token (15 min) + Refresh token opaque (7 jours)
Stockage     : HttpOnly cookies Secure SameSite=Strict (jamais localStorage)
Refresh token: Stocké en BDD avec fingerprint navigateur (IP + User-Agent hash)
MFA          : TOTP optionnel via otplib (Phase 2)
```

### 10.2 Checklist OWASP Top 10

| Vulnérabilité | Protection |
|---------------|-----------|
| SQL Injection | Prisma uniquement (requêtes paramétrées) |
| XSS | CSP headers, React escape natif, DOMPurify sur inputs libres |
| CSRF | SameSite=Strict cookies + token CSRF sur mutations sensibles |
| Rate Limiting | Fastify-rate-limit : 100/min général, 5/min endpoints auth |
| CORS | Origins whitelistées uniquement |
| Secrets | Variables d'env exclusivement, git-secrets en pre-commit hook |
| HTTPS | TLS 1.3 minimum, HSTS preload |
| Dépendances | Dependabot + `npm audit` en CI |

### 10.3 Multi-tenancy

Isolation au niveau base de données via Row Level Security PostgreSQL. Même si un bug applicatif existait, la BDD refuserait de retourner les données d'un autre tenant.

---

## 11. Infrastructure & Déploiement

### 11.1 Environnements

| Env | Trigger | Destination |
|-----|---------|-------------|
| `preview` | Chaque PR | Vercel Preview + Railway preview |
| `staging` | Push sur `main` | Deploy automatique |
| `production` | Tag `v*.*.*` | Deploy manuel avec approbation |

### 11.2 Pipeline CI/CD (GitHub Actions)

```yaml
Étapes sur chaque PR :
  1. pnpm install (cache turbo)
  2. TypeScript strict check (tsc --noEmit)
  3. ESLint
  4. Tests unitaires (Vitest)
  5. Build production (turbo build)
  6. Deploy preview (Vercel + Railway)
  7. Smoke tests post-deploy
```

### 11.3 Docker Compose (dev local)

```yaml
services:
  postgres:  PostgreSQL 16-alpine  port 5432
  redis:     Redis 7-alpine        port 6379
  redis-ui:  Redis Commander       port 8081  (--profile tools)
  mailhog:   MailHog               port 8025  (--profile tools)
```

**Démarrage local** :
```bash
cd infra && docker compose up -d        # BDD + Redis
pnpm install                            # Toutes les dépendances
pnpm --filter api db:migrate            # Appliquer les migrations
pnpm --filter api db:seed               # Données de démo
pnpm dev                                # Tous les services en parallèle
```

---

## 12. Roadmap de Développement

### Phase 1 — MVP (T1-T2 2026) — EN COURS

| Statut | Tâche |
|--------|-------|
| ✅ | Monorepo Turborepo + pnpm workspaces |
| ✅ | Schema Prisma complet (12 modèles) |
| ✅ | Docker Compose PostgreSQL + Redis |
| ✅ | Dashboard Analytics (KPIs, graphiques, répartition actifs) |
| ✅ | Page Comptes (liste, cartes, modal connexion broker) |
| ✅ | Module Auth local-first (`AUTH_MODE=demo`) + fallback Clerk minimal |
| 🔄 | Connexion MT4/MT5 via MetaAPI |
| 🔄 | Synchronisation trades depuis broker |
| 🔄 | Calcul KPIs réels depuis trades BDD |
| 🔄 | Alertes drawdown (email + notification in-app) |
| 🔄 | Calculateur lot size (Module Risques) |
| 🔄 | Stripe Checkout (3 plans) |
| ✅ | Landing page marketing MERKURE |

### Phase 2 — IA v1 (T2-T3 2026)

- Assistant IA (Claude API) — coaching + analyse performance
- Journal de trading IA
- Score de performance 0-100 (ML scikit-learn)
- Connexion Binance + Interactive Brokers
- Onboarding guidé en 3 étapes
- Routes métier avancées (trades, stratégies, rapports)
- App mobile (React Native ou PWA)

### Phase 3 — Growth (T3-T4 2026)

- Connexion cTrader
- Marketplace stratégies (commission 15%)
- Backtesting sur données historiques
- Expert Advisor MQL propriétaire (remplace MetaAPI)
- Migration Railway → AWS ECS/RDS
- White-label B2B
- Expansion Europe

### Phase 4 — Global (2027)

- Expansion USA/Asie
- API publique pour développeurs
- Fonds gérés MERKURE
- TimescaleDB pour données time-series haute fréquence

---

## 13. Variables d'Environnement

### 13.1 Fichier `.env` (jamais commité)

```bash
# App
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://merkure:password@localhost:5432/merkure_db

# Redis
REDIS_URL=redis://localhost:6379

# Auth local-first
AUTH_MODE=demo
# AUTH_MODE=clerk
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...

# Auth JWT — générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64 bytes hex>
JWT_REFRESH_SECRET=<64 bytes hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Service IA — générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=<32 bytes hex>

# APIs tierces
ANTHROPIC_API_KEY=sk-ant-...          # console.anthropic.com
META_API_TOKEN=...                     # metaapi.cloud
STRIPE_SECRET_KEY=sk_test_...          # dashboard.stripe.com
STRIPE_WEBHOOK_SECRET=whsec_...

# Chiffrement credentials broker
ENCRYPTION_KEY=<32 bytes hex>
```

### 13.2 Validation

Toutes les variables d'environnement sont validées **au démarrage** via Zod (`apps/api/src/config/env.ts`). Si une variable est manquante ou invalide, le serveur refuse de démarrer avec un message d'erreur explicite.

---

## 14. Conventions de Code

### 14.1 TypeScript

```typescript
// ✅ Types stricts — pas de any, pas de as
const user: User = await findUserById(id)

// ✅ Types partagés via @merkure/shared-types
import type { Trade, KpiSummary } from '@merkure/shared-types'

// ✅ Validation Zod au boundary d'entrée (routes API)
const body = CreateTradeSchema.parse(req.body)

// ❌ Jamais
const data = response.json() as any
```

### 14.2 Composants React

```tsx
// ✅ Props typées explicitement
interface Props {
  compte: MockCompte
  onRefresh?: () => void
}

// ✅ Pas de default export sauf App.tsx et pages
export function CompteCard({ compte, onRefresh }: Props) { ... }

// ✅ Hooks custom pour la logique complexe
function useKpis(period: Period) {
  return useQuery({ queryKey: ['kpis', period], queryFn: () => api.getKpis(period) })
}
```

### 14.3 Commits (Conventional Commits)

```
feat(comptes): add broker connection modal with 3-step flow
fix(dashboard): resolve USDT invalid currency code crash
refactor(api): extract broker adapter interface
chore(infra): upgrade PostgreSQL to 16-alpine
```

### 14.4 Nommage des fichiers

```
PascalCase    → Composants React         (CompteCard.tsx, DashboardPage.tsx)
camelCase     → Services, utils, hooks   (quant.py, mock-data.ts)
kebab-case    → Config, infra            (docker-compose.yml, init-db.sql)
SCREAMING     → Constants globales       (pas encore utilisé)
```

---

*Document généré le 24 avril 2026 — MERKURE v0.1.0*
*Confidentiel — Ne pas distribuer*
