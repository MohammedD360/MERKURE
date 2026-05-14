import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Standalone output pour le déploiement Docker/Railway :
  // génère .next/standalone avec un server.js autonome + node_modules minimaux
  output: 'standalone',

  // Remonte le répertoire racine du monorepo pour que le build standalone
  // inclue les packages workspace (ex: @merkure/shared-types)
  outputFileTracingRoot: rootDir,

  turbopack: {
    root: rootDir,
  },

  // Variables d'environnement exposées côté client (navigateur)
  // Ces valeurs sont figées au moment du build ; utiliser NEXT_PUBLIC_* pour les injecter
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001',
  },
}

export default nextConfig
