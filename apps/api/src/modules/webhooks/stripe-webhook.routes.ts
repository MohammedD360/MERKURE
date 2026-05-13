import type { FastifyInstance } from 'fastify'
import type Stripe from 'stripe'
import { getStripe } from '../billing/stripe.client.js'
import { priceIdToPlan } from '../billing/billing.config.js'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

export async function stripeWebhookRoutes(app: FastifyInstance) {
  app.post(
    '/api/webhooks/stripe',
    { config: { rawBody: true } },
    async (request, reply) => {
      if (!env.STRIPE_WEBHOOK_SECRET) {
        return reply.code(500).send({ error: 'webhook_not_configured' })
      }

      const sig = request.headers['stripe-signature'] as string
      if (!sig) return reply.code(400).send({ error: 'missing_signature' })

      let event: Stripe.Event
      try {
        const stripe = getStripe()
        const rawBody =
          typeof request.rawBody === 'string'
            ? request.rawBody
            : (request.rawBody as Buffer).toString('utf8')

        event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
      } catch {
        return reply.code(400).send({ error: 'invalid_signature' })
      }

      try {
        await handleStripeEvent(event)
      } catch (err) {
        app.log.error({ err, eventType: event.type }, 'stripe webhook handler error')
        return reply.code(500).send({ error: 'handler_error' })
      }

      return reply.code(200).send({ received: true })
    },
  )
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.['userId']
      const planMeta = session.metadata?.['plan']
      if (!userId || !planMeta) break

      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['latest_invoice'],
      })

      const priceId = sub.items.data[0]?.price.id
      const resolvedPlan = (priceId ? priceIdToPlan(priceId) : null) ?? (planMeta as 'STARTER' | 'PRO' | 'ELITE')
      const latestInvoice = sub.latest_invoice as Stripe.Invoice | null
      const periodEnd = latestInvoice?.period_end ? new Date(latestInvoice.period_end * 1000) : null

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer as string,
          plan: resolvedPlan,
          status: mapStripeStatus(sub.status),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer as string,
          plan: resolvedPlan,
          status: mapStripeStatus(sub.status),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata['userId']
      if (!userId) break

      const priceId = sub.items.data[0]?.price.id
      const plan = priceId ? priceIdToPlan(priceId) : null
      const stripe = getStripe()
      const fullSub = await stripe.subscriptions.retrieve(sub.id, { expand: ['latest_invoice'] })
      const latestInvoice = fullSub.latest_invoice as Stripe.Invoice | null
      const periodEnd = latestInvoice?.period_end ? new Date(latestInvoice.period_end * 1000) : null

      await prisma.subscription.update({
        where: { userId },
        data: {
          ...(plan ? { plan } : {}),
          status: mapStripeStatus(sub.status),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata['userId']
      if (!userId) break

      await prisma.subscription.update({
        where: { userId },
        data: { plan: 'FREE', status: 'CANCELED', cancelAtPeriodEnd: false },
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subRef = invoice.parent?.type === 'subscription_details'
        ? invoice.parent.subscription_details?.subscription
        : null
      if (!subRef) break

      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(
        typeof subRef === 'string' ? subRef : subRef.id,
      )
      const userId = sub.metadata['userId']
      if (!userId) break

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          ...(invoice.period_end ? { currentPeriodEnd: new Date(invoice.period_end * 1000) } : {}),
        },
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subRef = invoice.parent?.type === 'subscription_details'
        ? invoice.parent.subscription_details?.subscription
        : null
      if (!subRef) break

      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(
        typeof subRef === 'string' ? subRef : subRef.id,
      )
      const userId = sub.metadata['userId']
      if (!userId) break

      await prisma.subscription.update({
        where: { userId },
        data: { status: 'PAST_DUE' },
      })
      break
    }
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' {
  switch (status) {
    case 'active': return 'ACTIVE'
    case 'trialing': return 'TRIALING'
    case 'past_due': return 'PAST_DUE'
    case 'canceled': return 'CANCELED'
    case 'unpaid': return 'UNPAID'
    default: return 'ACTIVE'
  }
}
