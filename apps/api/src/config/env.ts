import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url().default('postgresql://merkure:merkure_dev_password@localhost:5432/merkure_db'),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  AUTH_MODE: z.enum(['demo', 'clerk']).default('demo'),
  CLERK_SECRET_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(32).default('merkure_dev_jwt_secret_change_me_64_bytes_minimum'),
  JWT_REFRESH_SECRET: z.string().min(32).default('merkure_dev_refresh_secret_change_me_64_bytes_minimum'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // AI Service
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  AI_SERVICE_SECRET: z.string().min(16).default('merkure_dev_ai_secret'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  // MetaAPI (broker MT4/MT5)
  META_API_TOKEN: z.string().optional(),
  METAAPI_TOKEN:  z.string().optional(),

  // MTConnectAPI (MT4 broker sync)
  MTCONNECT_API_KEY: z.string().optional(),
  MTCONNECT_UID:     z.string().optional(),

  // Clerk Webhook
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_ELITE: z.string().optional(),

  // Encryption (for broker credentials)
  ENCRYPTION_KEY: z.string().length(64).default('0000000000000000000000000000000000000000000000000000000000000000'), // 32 bytes hex
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
