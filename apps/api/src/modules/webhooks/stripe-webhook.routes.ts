import type { FastifyInstance } from 'fastify'
import type Stripe from 'stripe'
import { getStripe } from '../billing/stripe.client.js'
import { priceIdToPlan } from '../billing/billing.config.js'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'
import { emailService } from '../../infrastructure/email/email.service.js'

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
        const stripe  = getStripe()
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

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {

    // Checkout réussi → création initiale de la subscription
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId   = session.metadata?.['userId']
      const planMeta = session.metadata?.['plan']
      if (!userId || !planMeta) break

      const stripe = getStripe()
      const sub    = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['latest_invoice'],
      })

      const priceId      = sub.items.data[0]?.price.id
      const resolvedPlan = (priceId ? priceIdToPlan(priceId) : null) ?? (planMeta as 'STARTER' | 'PRO' | 'ELITE')

      // Dans l'API Stripe 2026-04-22, period_end vient de latest_invoice (current_period_end supprimé)
      const latestInvoice = sub.latest_invoice as Stripe.Invoice | null
      const periodEnd     = latestInvoice?.period_end ? new Date(latestInvoice.period_end * 1000) : null

      await prisma.subscription.upsert({
        where:  { userId },
        create: {
          userId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId:     sub.customer as string,
          plan:                 resolvedPlan,
          status:               mapStripeStatus(sub.status),
          currentPeriodEnd:     periodEnd,
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
        },
        update: {
          stripeSubscriptionId: sub.id,
          stripeCustomerId:     sub.customer as string,
          plan:                 resolvedPlan,
          status:               mapStripeStatus(sub.status),
          currentPeriodEnd:     periodEnd,
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
        },
      })
      break
    }

    // Mise à jour de la subscription (changement de plan, annulation programmée, etc.)
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata['userId']
      if (!userId) break

      const priceId = sub.items.data[0]?.price.id
      const plan    = priceId ? priceIdToPlan(priceId) : null

      // period_end mis à jour uniquement par invoice.payment_succeeded — pas d'appel Stripe ici
      await prisma.subscription.upsert({
        where:  { userId },
        create: {
          userId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId:     sub.customer as string,
          plan:                 plan ?? 'FREE',
          status:               mapStripeStatus(sub.status),
          cancelAtPeriodEnd:    sub.cancel_at_period_end,
        },
        update: {
          ...(plan ? { plan } : {}),
          status:            mapStripeStatus(sub.status),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      })
      break
    }

    // Résiliation de la subscription
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata['userId']
      if (!userId) break

      try {
        await prisma.subscription.update({
          where: { userId },
          data:  { plan: 'FREE', status: 'CANCELED', cancelAtPeriodEnd: false },
        })
      } catch (err) {
        if (isPrismaNotFound(err)) break
        throw err
      }

      // Email de notification d'annulation — fire & forget
      const canceledUser = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true },
      }).catch(() => null)
      if (canceledUser?.email) {
        emailService.sendSubscriptionCanceled(canceledUser.email).catch(() => {})
      }
      break
    }

    // Renouvellement réussi → rafraîchir period_end et confirmer paiement
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subRef  = invoice.parent?.type === 'subscription_details'
        ? invoice.parent.subscription_details?.subscription
        : null
      if (!subRef) break

      const stripe = getStripe()
      const sub    = await stripe.subscriptions.retrieve(
        typeof subRef === 'string' ? subRef : subRef.id,
      )
      const userId = sub.metadata['userId']
      if (!userId) break

      try {
        const updatedSub = await prisma.subscription.update({
          where: { userId },
          data:  {
            status: 'ACTIVE',
            ...(invoice.period_end ? { currentPeriodEnd: new Date(invoice.period_end * 1000) } : {}),
          },
        })

        // Email de confirmation de paiement — fire & forget
        const paidUser = await prisma.user.findUnique({
          where:  { id: userId },
          select: { email: true },
        }).catch(() => null)
        if (paidUser?.email) {
          const amountEuros = (invoice.amount_paid ?? 0) / 100
          emailService.sendPaymentConfirmation(paidUser.email, updatedSub.plan, amountEuros).catch(() => {})
        }
      } catch (err) {
        if (isPrismaNotFound(err)) break
        throw err
      }
      break
    }

    // Échec de paiement → passer en PAST_DUE + notifier l'utilisateur
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subRef  = invoice.parent?.type === 'subscription_details'
        ? invoice.parent.subscription_details?.subscription
        : null
      if (!subRef) break

      const stripe = getStripe()
      const sub    = await stripe.subscriptions.retrieve(
        typeof subRef === 'string' ? subRef : subRef.id,
      )
      const userId = sub.metadata['userId']
      if (!userId) break

      try {
        await prisma.subscription.update({
          where: { userId },
          data:  { status: 'PAST_DUE' },
        })
      } catch (err) {
        if (isPrismaNotFound(err)) break
        throw err
      }

      // Email de notification d'échec de paiement — fire & forget
      const failedUser = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true },
      }).catch(() => null)
      if (failedUser?.email) {
        emailService.sendPaymentFailed(failedUser.email).catch(() => {})
      }
      break
    }
  }
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
): 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' {
  switch (status) {
    case 'active':   return 'ACTIVE'
    case 'trialing': return 'TRIALING'
    case 'past_due': return 'PAST_DUE'
    case 'canceled': return 'CANCELED'
    case 'unpaid':   return 'UNPAID'
    default:         return 'ACTIVE'
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
