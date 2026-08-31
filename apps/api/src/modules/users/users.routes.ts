import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createClerkClient } from '@clerk/backend'
import { prisma } from '../../infrastructure/database/client.js'
import { authenticate, revokeAllSessions, invalidateSessionCache } from '../../middleware/auth.js'
import { env } from '../../config/env.js'
import { demoUser } from '../auth/demo-user.js'

function isPrismaNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025'
}

const UpdateProfileSchema = z.object({
  firstName: z.string().trim().max(50).nullable().optional(),
  lastName:  z.string().trim().max(50).nullable().optional(),
  avatarUrl: z.string().max(400_000).refine(
    value => value.startsWith('data:image/jpeg;base64,')
      || value.startsWith('data:image/png;base64,')
      || value.startsWith('data:image/webp;base64,')
      || value.startsWith('https://'),
    'invalid_avatar_url',
  ).nullable().optional(),
  timezone:  z.string().optional(),
  currency:  z.string().length(3).optional(),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
})

export async function usersRoutes(app: FastifyInstance) {
  const nullableText = (value: string | null | undefined) => {
    if (value === undefined) return undefined
    if (value === null) return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  /**
   * GET /api/v1/users/me — profil complet
   */
  app.get('/me', { preHandler: [authenticate] }, async (req) => {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
        timezone: true, currency: true, createdAt: true,
        subscription: { select: { plan: true, status: true } },
      },
    })
    return user
  })

  /**
   * PATCH /api/v1/users/me — mise à jour du profil
   */
  app.patch('/me', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = UpdateProfileSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

    const { firstName, lastName, avatarUrl, timezone, currency } = parsed.data
    const normalizedFirstName = nullableText(firstName)
    const normalizedLastName  = nullableText(lastName)
    const updateData = {
      ...(normalizedFirstName !== undefined ? { firstName: normalizedFirstName } : {}),
      ...(normalizedLastName  !== undefined ? { lastName:  normalizedLastName  } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(timezone  !== undefined ? { timezone  } : {}),
      ...(currency  !== undefined ? { currency  } : {}),
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data:  updateData,
      select: {
        id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
        timezone: true, currency: true,
      },
    })
    return updated
  })

  /**
   * POST /api/v1/users/me/change-password
   */
  app.post('/me/change-password', { preHandler: [authenticate] }, async (req, reply) => {
    const parsed = ChangePasswordSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body' })

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { passwordHash: true },
    })

    if (!user?.passwordHash) {
      return reply.code(400).send({ error: 'no_password_set' })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ error: 'wrong_password' })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { passwordHash: newHash },
    })

    // Un mot de passe changé invalide les autres sessions (vol d'appareil,
    // compte partagé) — y compris celle-ci : le prochain appel authentifié
    // renverra session_revoked et le front redirigera vers /sign-in.
    await revokeAllSessions(req.user.id)

    return { ok: true }
  })

  /**
   * GET /api/v1/users/me/export — droit à la portabilité (RGPD art. 20).
   * Export JSON complet des données personnelles de l'utilisateur.
   */
  app.get(
    '/me/export',
    { preHandler: [authenticate], config: { rateLimit: { max: 3, timeWindow: '10 minutes' } } },
    async (req) => {
      const userId = req.user.id

      const [
        user, brokerAccounts, trades, kpiSnapshots, alerts, journalEntries,
        aiJournalEntries, strategyAnalyses, tradingPlan, subscription, tradingBots,
      ] = await Promise.all([
        prisma.user.findUnique({
          where:  { id: userId },
          select: {
            id: true, email: true, firstName: true, lastName: true, avatarUrl: true,
            timezone: true, currency: true, riskPerTrade: true, onboarded: true,
            createdAt: true, updatedAt: true,
            profile: true,
          },
        }),
        // credentialsEnc volontairement exclu : c'est un blob chiffré, aucune valeur
        // à l'export et on évite de faire sortir du chiffré de son contexte de clé.
        prisma.brokerAccount.findMany({
          where: { userId }, select: {
            id: true, brokerType: true, accountType: true, accountId: true, label: true,
            isActive: true, lastSyncAt: true, syncStatus: true, createdAt: true, deletedAt: true,
          },
        }),
        prisma.trade.findMany({ where: { userId } }),
        prisma.kpiSnapshot.findMany({ where: { userId } }),
        prisma.alert.findMany({ where: { userId } }),
        prisma.journalEntry.findMany({ where: { userId } }),
        prisma.aiJournalEntry.findMany({ where: { userId } }),
        prisma.strategyAnalysis.findMany({ where: { userId } }),
        prisma.tradingPlan.findUnique({ where: { userId } }),
        prisma.subscription.findUnique({ where: { userId } }),
        prisma.tradingBot.findMany({ where: { userId }, include: { decisions: true, events: true } }),
      ])

      return {
        exportedAt: new Date().toISOString(),
        format: 'MERKURE personal data export v1',
        user, brokerAccounts, trades, kpiSnapshots, alerts, journalEntries,
        aiJournalEntries, strategyAnalyses, tradingPlan, subscription, tradingBots,
      }
    },
  )

  /**
   * DELETE /api/v1/users/me — droit à l'effacement (RGPD art. 17).
   * Suppression définitive : la cascade Prisma (onDelete: Cascade) efface
   * trades, comptes broker, journal, abonnement, tokens, etc. dans la foulée.
   */
  app.delete(
    '/me',
    { preHandler: [authenticate], config: { rateLimit: { max: 3, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      // Le compte démo est une fixture partagée (données de démonstration) —
      // jamais de suppression réelle, sinon n'importe quel visiteur non
      // authentifié pourrait effacer les données montrées à tout le monde.
      if (req.user.id === demoUser.id) {
        return reply.code(403).send({ error: 'demo_account_protected' })
      }

      const existing = await prisma.user.findUnique({
        where:  { id: req.user.id },
        select: { clerkId: true },
      })

      try {
        await prisma.user.delete({ where: { id: req.user.id } })
      } catch (err) {
        if (!isPrismaNotFound(err)) throw err
        // Déjà supprimé (ex. webhook Clerk arrivé en premier) — idempotent.
      }

      // Sans ça, un résultat "exists: true" mis en cache par un appel juste
      // avant cette suppression resterait valable jusqu'à expiration du cache
      // (30s) : le JWT du compte qu'on vient d'effacer continuerait de passer
      // authenticate() pendant cette fenêtre.
      await invalidateSessionCache(req.user.id)

      // Best-effort : supprime aussi l'identité Clerk pour qu'il ne reste pas de
      // compte "fantôme" utilisable sans données derrière. L'effacement des
      // données (l'obligation RGPD) est déjà acquis à ce stade quoi qu'il arrive.
      if (env.AUTH_MODE === 'clerk' && env.CLERK_SECRET_KEY && existing?.clerkId && !existing.clerkId.startsWith('local_')) {
        try {
          const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
          await clerkClient.users.deleteUser(existing.clerkId)
        } catch (err) {
          req.log.warn({ err }, '[users] Échec suppression identité Clerk après effacement des données')
        }
      }

      return { ok: true }
    },
  )
}
