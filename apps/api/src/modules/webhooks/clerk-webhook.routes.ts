import type { FastifyInstance, FastifyBaseLogger } from 'fastify'
import { Webhook } from 'svix'
import { prisma } from '../../infrastructure/database/client.js'
import { emailService } from '../../infrastructure/email/email.service.js'
import { env } from '../../config/env.js'

// ─── Types (alignés sur le payload réel Clerk) ───────────────────────────────

interface ClerkEmailAddress {
  id: string
  email_address: string
  verification: { status: string } | null
}

interface ClerkUserPayload {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkDeletedPayload {
  id: string
  deleted: true
}

type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserPayload }
  | { type: 'user.updated'; data: ClerkUserPayload }
  | { type: 'user.deleted'; data: ClerkDeletedPayload }

// ─── Route ───────────────────────────────────────────────────────────────────

export async function clerkWebhookRoutes(app: FastifyInstance) {
  app.post(
    '/api/webhooks/clerk',
    { config: { rawBody: true } },
    async (request, reply) => {
      const secret = env.CLERK_WEBHOOK_SECRET
      if (!secret) {
        return reply.code(500).send({ error: 'webhook_not_configured' })
      }

      const svixId        = request.headers['svix-id'] as string
      const svixTimestamp = request.headers['svix-timestamp'] as string
      const svixSignature = request.headers['svix-signature'] as string

      if (!svixId || !svixTimestamp || !svixSignature) {
        return reply.code(400).send({ error: 'missing_svix_headers' })
      }

      let event: ClerkWebhookEvent
      try {
        const wh      = new Webhook(secret)
        const rawBody =
          typeof request.rawBody === 'string'
            ? request.rawBody
            : (request.rawBody as Buffer).toString('utf8')

        event = wh.verify(rawBody, {
          'svix-id':        svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as ClerkWebhookEvent
      } catch {
        return reply.code(400).send({ error: 'invalid_signature' })
      }

      try {
        await handleClerkEvent(event, app.log)
      } catch (err) {
        app.log.error({ err, eventType: event.type }, 'clerk webhook handler error')
        return reply.code(500).send({ error: 'handler_error' })
      }

      return reply.code(200).send({ received: true })
    },
  )
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleClerkEvent(event: ClerkWebhookEvent, log: FastifyBaseLogger) {
  if (event.type === 'user.created') {
    const { data } = event
    const primaryEmail = data.email_addresses.find(e => e.id === data.primary_email_address_id)
    if (!primaryEmail) return

    // Clerk vérifie les emails OAuth immédiatement ; email+password peut être non vérifié
    const emailVerified = primaryEmail.verification?.status === 'verified'

    // Transaction atomique User + Subscription FREE
    // upsert pour l'idempotence : Clerk peut renvoyer le webhook en cas de retry
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.upsert({
        where:  { clerkId: data.id },
        create: {
          clerkId:       data.id,
          email:         primaryEmail.email_address,
          firstName:     data.first_name ?? null,
          lastName:      data.last_name  ?? null,
          avatarUrl:     data.image_url  ?? null,
          emailVerified,
        },
        update: {}, // idempotent : ne pas écraser les champs si déjà créé
      })

      await tx.subscription.upsert({
        where:  { userId: created.id },
        create: { userId: created.id, plan: 'FREE', status: 'ACTIVE' },
        update: {},
      })

      return created
    })

    // Email de bienvenue — fire & forget (échec non bloquant)
    emailService.sendWelcome(user.email!, user.firstName).catch(() => {})
    return
  }

  if (event.type === 'user.updated') {
    const { data } = event
    const primaryEmail = data.email_addresses.find(e => e.id === data.primary_email_address_id)

    try {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          ...(primaryEmail                   ? { email:     primaryEmail.email_address } : {}),
          ...(data.first_name !== undefined  ? { firstName: data.first_name }           : {}),
          ...(data.last_name  !== undefined  ? { lastName:  data.last_name  }           : {}),
          ...(data.image_url  !== undefined  ? { avatarUrl: data.image_url  }           : {}),
        },
      })
    } catch (err) {
      // Race condition : user.updated peut arriver avant que user.created soit traité
      if (isPrismaNotFound(err)) {
        log.warn({ clerkId: data.id }, 'user.updated received for unknown clerkId — skipped')
        return
      }
      throw err
    }
    return
  }

  if (event.type === 'user.deleted') {
    const { data } = event
    try {
      // La cascade Trade.userId → User est gérée par la migration 20260625000000
      await prisma.user.delete({ where: { clerkId: data.id } })
    } catch (err) {
      if (isPrismaNotFound(err)) {
        log.warn({ clerkId: data.id }, 'user.deleted received for unknown clerkId — skipped')
        return
      }
      throw err
    }
    return
  }
}

function isPrismaNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  )
}
