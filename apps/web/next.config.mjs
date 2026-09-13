import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSentryConfig } from '@sentry/nextjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

// En prod, un oubli de --build-arg NEXT_PUBLIC_API_URL compilerait silencieusement
// avec un repli sur localhost:3001 — chaque visiteur appellerait alors son PROPRE
// poste au lieu de l'API, un échec réseau muet en prod (même classe de bug que
// l'incident AUTH_MODE déjà rencontré). On préfère un échec de build explicite.
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL est requis pour un build de production (build-arg Docker manquant ?)',
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: rootDir,
  turbopack: { root: rootDir },
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL:  process.env.NEXT_PUBLIC_WS_URL  ?? 'ws://localhost:3001',
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Report-only pour commencer : resserrer vers une CSP bloquante une fois
          // l'inventaire complet des origines tierces (Clerk, Sentry, polices) validé.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; frame-ancestors 'none'",
          },
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ]
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
