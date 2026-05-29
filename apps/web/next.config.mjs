import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSentryConfig } from '@sentry/nextjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: rootDir,
  turbopack: { root: rootDir },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL:  process.env.NEXT_PUBLIC_WS_URL  ?? 'ws://localhost:3001',
  },
}

export default withSentryConfig(nextConfig, {
  // Source maps uploadées à Sentry à chaque build de prod
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Si pas de DSN configuré, Sentry est silencieux (pas de crash au build)
  silent:  !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Pas de tree-shaking Sentry en dev pour avoir les erreurs complètes
  disableLogger: true,
  // Upload des source maps uniquement si SENTRY_AUTH_TOKEN est défini
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
})
