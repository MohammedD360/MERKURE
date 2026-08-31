# ─────────────────────────────────────────────
# Stage 1 — deps : installation des dépendances
# ─────────────────────────────────────────────
FROM node:20-alpine@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifestes du workspace pnpm
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copier les package.json de chaque package nécessaire
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Installer les dépendances
RUN pnpm install --frozen-lockfile --filter @merkure/web...

# ─────────────────────────────────────────────
# Stage 2 — build : compilation Next.js
# ─────────────────────────────────────────────
FROM node:20-alpine@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifestes
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copier les package.json
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Copier les node_modules depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copier les sources
COPY apps/web/ ./apps/web/
COPY packages/shared-types/ ./packages/shared-types/

# Build args injectés au moment du build pour les variables NEXT_PUBLIC_*
# (Next.js les grave dans le bundle client à la compilation, pas à l'exécution)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_AUTH_MODE
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_AUTH_MODE=${NEXT_PUBLIC_AUTH_MODE}
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

# Désactiver la télémétrie Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (standalone output configuré dans next.config)
RUN pnpm --filter @merkure/web build

# ─────────────────────────────────────────────
# Stage 3 — runtime : image de production minimale
# ─────────────────────────────────────────────
FROM node:20-alpine@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb AS runtime

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copier les fichiers publics et le build standalone
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
