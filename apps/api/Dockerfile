# ─────────────────────────────────────────────
# Stage 1 — build : compilation TypeScript + assemblage prod
# ─────────────────────────────────────────────
FROM node:20-alpine@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb AS build

# Sans openssl installé, Prisma ne peut pas interroger la version réelle et devine
# à tort "1.1.x" (visible dans le warning "Prisma failed to detect the libssl/
# openssl version") — les deux moteurs sont bien générés (voir binaryTargets dans
# schema.prisma) mais la sélection au runtime se trompait quand même de fichier.
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copier les manifestes
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copier le package.json de CHAQUE membre du workspace (pas seulement @merkure/api) :
# pnpm-workspace.yaml déclare apps/* et packages/* — avec --frozen-lockfile, pnpm
# doit voir tout le graphe pour résoudre correctement les devDependencies (ex.
# le binaire prisma, jamais importé en TS, seulement invoqué en CLI, qui finissait
# mal lié quand seul un sous-ensemble du workspace était visible dans le contexte).
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
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
# Stage 2 — runtime : image de production minimale
# ─────────────────────────────────────────────
FROM node:20-alpine@sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb AS runtime

# Nécessaire pour que le client Prisma détecte correctement OpenSSL 3.x au
# démarrage et charge le bon moteur (voir le commentaire équivalent au stage build).
RUN apk add --no-cache openssl

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 merkure

WORKDIR /app

# `pnpm deploy` a été essayé ici et abandonné : il reconstruit node_modules depuis
# le lockfile et perd les fichiers que `prisma generate` écrit après coup dans le
# store pnpm. On recopie donc directement l'arborescence du stage build telle
# quelle (devDependencies incluses — image plus grosse, mais fiable).
COPY --from=build --chown=merkure:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=merkure:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=merkure:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=merkure:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=merkure:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=merkure:nodejs /app/package.json ./package.json

USER merkure

WORKDIR /app/apps/api

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
