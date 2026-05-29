import type { FastifyInstance } from 'fastify'
import { Webhook } from 'svix'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

interface ClerkUserData {
  id: string
  email_addresses: Array<{ email_address: string; id: string }>
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserData
}

export async function clerkWebhookRoutes(app: FastifyInstance) {
  app.post(
    '/api/webhooks/clerk',
    {
      config: { rawBody: true },
    },
    async (request, reply) => {
      const secret = env.CLERK_WEBHOOK_SECRET
      if (!secret) {
        return reply.code(500).send({ error: 'webhook_not_configured' })
      }

      const svixId = request.headers['svix-id'] as string
      const svixTimestamp = request.headers['svix-timestamp'] as string
      const svixSignature = request.headers['svix-signature'] as string

      if (!svixId || !svixTimestamp || !svixSignature) {
        return reply.code(400).send({ error: 'missing_svix_headers' })
      }

      let event: ClerkWebhookEvent
      try {
        const wh = new Webhook(secret)
        const rawBody =
          typeof request.rawBody === 'string'
            ? request.rawBody
            : (request.rawBody as Buffer).toString('utf8')

        event = wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as ClerkWebhookEvent
      } catch {
        return reply.code(400).send({ error: 'invalid_signature' })
      }

      try {
        await handleClerkEvent(event)
      } catch (err) {
        app.log.error({ err, eventType: event.type }, 'clerk webhook handler error')
        return reply.code(500).send({ error: 'handler_error' })
      }

      return reply.code(200).send({ received: true })
    },
  )
}

async function handleClerkEvent(event: ClerkWebhookEvent) {
  const { type, data } = event

  if (type === 'user.created') {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    )
    if (!primaryEmail) return

    await prisma.user.create({
      data: {
        clerkId: data.id,
        email: primaryEmail.email_address,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
      },
    })
    return
  }

  if (type === 'user.updated') {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    )

    await prisma.user.update({
      where: { clerkId: data.id },
      data: {
        ...(primaryEmail ? { email: primaryEmail.email_address } : {}),
        ...(data.first_name !== undefined ? { firstName: data.first_name } : {}),
        ...(data.last_name !== undefined ? { lastName: data.last_name } : {}),
      },
    })
    return
  }

  if (type === 'user.deleted') {
    await prisma.user.delete({ where: { clerkId: data.id } })
    return
  }
}
