import { z } from 'zod'

// Valeurs de secours "dev only" — un déploiement production qui oublie de les
// surcharger ne doit jamais démarrer silencieusement avec ces valeurs connues.
// Voir la vérification de production plus bas, qui compare contre ces mêmes constantes.
const DEV_DEFAULT_JWT_SECRET = 'merkure_dev_jwt_secret_change_me_64_bytes_minimum'
const DEV_DEFAULT_JWT_REFRESH_SECRET = 'merkure_dev_refresh_secret_change_me_64_bytes_minimum'
const DEV_DEFAULT_ENCRYPTION_KEY = '0000000000000000000000000000000000000000000000000000000000000000'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().min(1).default('postgresql://merkure:merkure_dev_password@localhost:5432/merkure_db'),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  AUTH_MODE: z.enum(['demo', 'clerk']).default('demo'),
  CLERK_SECRET_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(32).default(DEV_DEFAULT_JWT_SECRET),
  JWT_REFRESH_SECRET: z.string().min(32).default(DEV_DEFAULT_JWT_REFRESH_SECRET),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().default('noreply@merkure360.com'),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),

  // AI Service
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  AI_SERVICE_SECRET: z.string().min(16).default('merkure_dev_ai_secret'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  // MetaAPI (broker MT4/MT5)
  META_API_TOKEN: z.string().optional(),
  METAAPI_TOKEN:  z.string().optional(),
  // 'regular' suffit pour lire un historique ; 'high' duplique les serveurs
  // (exécution temps réel / copy-trading) et exige un compte MetaAPI crédité.
  METAAPI_RELIABILITY: z.enum(['regular', 'high']).default('regular'),
  // MetaAPI facture les comptes déployés : on éteint le terminal après chaque
  // synchro. À désactiver seulement si on a besoin d'un flux temps réel.
  METAAPI_UNDEPLOY_AFTER_SYNC: z.coerce.boolean().default(true),
  // Cadence de la synchro automatique, en minutes. Voir le commentaire dans
  // broker-sync.worker.ts : ce réglage pilote directement la facture MetaAPI.
  BROKER_SYNC_INTERVAL_MINUTES: z.coerce.number().int().min(5).default(60),
  // La réconciliation signale par défaut les comptes orphelins facturés sans les
  // supprimer : une suppression automatique chez un fournisseur payant doit être
  // un choix explicite, jamais un effet de bord d'un déploiement.
  PROVIDER_RECONCILE_DELETE: z.coerce.boolean().default(false),

  // Clerk Webhook
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_ELITE: z.string().optional(),

  // Encryption (for broker credentials)
  ENCRYPTION_KEY: z.string().length(64).default(DEV_DEFAULT_ENCRYPTION_KEY), // 32 bytes hex

  // Google OAuth
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI:  z.string().url().default('http://localhost:3001/api/v1/auth/google/callback'),

  // Bot Trading — Polymarket (non configuré = mode simulé)
  POLYMARKET_CLOB_URL: z.string().url().optional(),

  // Bot Trading — Dune Analytics (détection wallets baleines, non configuré = mode simulé)
  DUNE_API_KEY:        z.string().optional(),
  DUNE_WHALE_QUERY_ID: z.string().optional(),

  // Bot Trading — fréquence des ticks de l'agent (ms)
  BOT_TRADING_TICK_MS: z.coerce.number().default(120_000),

  // Bot Trading — fréquence de vérification de résolution des marchés (ms) —
  // moins fréquent que le tick de trading, un marché ne se résout pas en 2 min.
  BOT_SETTLEMENT_TICK_MS: z.coerce.number().default(600_000),

  // Market Data — Twelve Data (cotations XAU/USD, indices…), non configuré = feature désactivée
  TWELVE_DATA_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

// Vérifications supplémentaires en production
if (parsed.data.NODE_ENV === 'production') {
  const missing: string[] = []
  if (!parsed.data.RESEND_API_KEY)       missing.push('RESEND_API_KEY')
  if (!parsed.data.STRIPE_SECRET_KEY)    missing.push('STRIPE_SECRET_KEY')
  if (!parsed.data.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET')
  if (!parsed.data.STRIPE_PRICE_STARTER) missing.push('STRIPE_PRICE_STARTER')
  if (!parsed.data.STRIPE_PRICE_PRO)     missing.push('STRIPE_PRICE_PRO')
  if (!parsed.data.STRIPE_PRICE_ELITE)   missing.push('STRIPE_PRICE_ELITE')
  if (missing.length > 0) {
    console.error(`[env] Variables manquantes en production : ${missing.join(', ')}`)
    process.exit(1)
  }

  // Secrets "dev only" : un oubli ici ne doit jamais démarrer silencieusement
  // avec une valeur connue (chiffrement cassable, JWT forgeable par n'importe
  // qui ayant lu ce fichier) — on préfère un crash au boot à une fuite en prod.
  const insecure: string[] = []
  if (parsed.data.ENCRYPTION_KEY === DEV_DEFAULT_ENCRYPTION_KEY)     insecure.push('ENCRYPTION_KEY')
  if (parsed.data.JWT_SECRET === DEV_DEFAULT_JWT_SECRET)             insecure.push('JWT_SECRET')
  if (parsed.data.JWT_REFRESH_SECRET === DEV_DEFAULT_JWT_REFRESH_SECRET) insecure.push('JWT_REFRESH_SECRET')
  if (insecure.length > 0) {
    console.error(`[env] Secrets encore sur leur valeur de développement en production : ${insecure.join(', ')}`)
    process.exit(1)
  }

  // AUTH_MODE=demo authentifie toute requête sans jeton comme le compte démo
  // (plan ELITE) — acceptable en dev, jamais en production.
  if (parsed.data.AUTH_MODE !== 'clerk' || !parsed.data.CLERK_SECRET_KEY) {
    console.error('[env] AUTH_MODE doit être "clerk" avec CLERK_SECRET_KEY renseigné en production.')
    process.exit(1)
  }
}

export const env = parsed.data
export type Env = typeof env
