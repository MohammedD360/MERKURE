import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      AUTH_MODE: 'demo',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/merkure_test',
      REDIS_URL: 'redis://localhost:6379',
      ENCRYPTION_KEY: '0000000000000000000000000000000000000000000000000000000000000001',
      JWT_SECRET: 'test_jwt_secret_at_least_32_characters_long_for_testing',
      JWT_REFRESH_SECRET: 'test_refresh_secret_at_least_32_characters_long_test',
      FRONTEND_URL: 'http://localhost:3000',
      AI_SERVICE_URL: 'http://localhost:8000',
      AI_SERVICE_SECRET: 'test_ai_secret_16ch',
      CLERK_WEBHOOK_SECRET: 'whsec_test_clerk_secret_for_unit_tests',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_stripe_secret_for_unit_tests',
    },
  },
})
