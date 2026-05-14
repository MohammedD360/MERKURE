# ─────────────────────────────────────────────
# Stage 1 — deps : installation des dépendances de production
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifestes du workspace pnpm
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copier les package.json de chaque package nécessaire
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Installer uniquement les dépendances de production
RUN pnpm install --frozen-lockfile --prod --filter @merkure/api...

# ─────────────────────────────────────────────
# Stage 2 — build : compilation TypeScript
# ─────────────────────────────────────────────
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifestes
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copier les package.json de chaque package
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Installer toutes les dépendances (dev inclus pour la compilation)
RUN pnpm install --frozen-lockfile --filter @merkure/api...

# Copier les sources
COPY apps/api/ ./apps/api/
COPY packages/shared-types/ ./packages/shared-types/

# Générer le client Prisma
RUN pnpm --filter @merkure/api db:generate

# Compiler TypeScript
RUN pnpm --filter @merkure/api build

# ─────────────────────────────────────────────
# Stage 3 — runtime : image de production minimale
# ─────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 merkure

WORKDIR /app

# Copier les node_modules de production depuis le stage deps
COPY --from=deps --chown=merkure:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=merkure:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copier le code compilé
COPY --from=build --chown=merkure:nodejs /app/apps/api/dist ./apps/api/dist

# Copier le schema Prisma et les migrations (nécessaires pour prisma migrate deploy)
COPY --from=build --chown=merkure:nodejs /app/apps/api/prisma ./apps/api/prisma

# Copier le client Prisma généré
COPY --from=build --chown=merkure:nodejs /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

# Copier le package.json pour la résolution des modules
COPY --from=build --chown=merkure:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=merkure:nodejs /app/package.json ./package.json

USER merkure

WORKDIR /app/apps/api

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
