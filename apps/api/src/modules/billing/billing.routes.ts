import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { getStripe } from './stripe.client.js'
import { PLANS } from './billing.config.js'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

const CheckoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'ELITE']),
})

export async function billingRoutes(app: FastifyInstance) {
  // GET /api/v1/billing/plans — liste publique des plans
  app.get('/plans', async () => {
    return Object.values(PLANS).map(({ id, name, priceMonthly, currency, features }) => ({
      id,
      name,
      priceMonthly,
      currency,
      features,
    }))
  })

  // GET /api/v1/billing/subscription — abonnement courant
  app.get(
    '/subscription',
    { preHandler: authenticate },
    async (request) => {
      const sub = await prisma.subscription.findUnique({
        where:  { userId: request.user.id },
        select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
      })
      return sub ?? { plan: 'FREE', status: 'ACTIVE', currentPeriodEnd: null, cancelAtPeriodEnd: false }
    },
  )

  // POST /api/v1/billing/checkout — crée une session Stripe Checkout
  app.post(
    '/checkout',
    { preHandler: authenticate },
    async (request, reply) => {
      if (request.user.id === 'demo_user_merkure') {
        return reply.code(403).send({ error: 'demo_mode', detail: 'Créez un compte pour accéder aux plans payants.' })
      }

      const body = CheckoutSchema.safeParse(request.body)
      if (!body.success) return reply.code(400).send({ error: 'invalid_plan' })

      const planConfig = PLANS[body.data.plan]
      if (!planConfig.stripePriceId) {
        return reply.code(400).send({ error: 'plan_not_available' })
      }

      // Si l'utilisateur a déjà un abonnement payant actif, il doit passer par le portail
      const existingSub = await prisma.subscription.findUnique({
        where:  { userId: request.user.id },
        select: { plan: true, status: true },
      })
      if (existingSub && existingSub.plan !== 'FREE' && existingSub.status === 'ACTIVE') {
        return reply.code(400).send({
          error: 'already_subscribed',
          detail: 'Utilisez le portail client pour modifier votre abonnement.',
        })
      }

      const stripe = getStripe()

      const user = await prisma.user.findUnique({
        where:  { id: request.user.id },
        select: { email: true, stripeCustomerId: true },
      })
      if (!user) return reply.code(404).send({ error: 'user_not_found' })

      let customerId = user.stripeCustomerId
      if (!customerId) {
        const customer = await stripe.customers.create({
          email:    user.email ?? undefined,
          metadata: { userId: request.user.id },
        })
        customerId = customer.id
        await prisma.user.update({
          where: { id: request.user.id },
          data:  { stripeCustomerId: customerId },
        })
      }

      const baseUrl     = env.FRONTEND_URL.replace(/\/$/, '')
      const successUrl  = `${baseUrl}/app/dashboard?checkout=success`
      const cancelUrl   = `${baseUrl}/app/billing?checkout=cancelled`

      request.log.info({ plan: body.data.plan, priceId: planConfig.stripePriceId }, 'creating checkout session')

      try {
        const session = await stripe.checkout.sessions.create({
          mode:       'subscription',
          customer:   customerId,
          line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url:  cancelUrl,
          metadata:    { userId: request.user.id, plan: body.data.plan },
          subscription_data: {
            metadata: { userId: request.user.id, plan: body.data.plan },
          },
        })
        request.log.info({ sessionId: session.id }, 'checkout session created')
        return { url: session.url }
      } catch (err) {
        request.log.error({ err }, 'stripe checkout session creation failed')
        return reply.code(502).send({
          error:  'stripe_error',
          detail: err instanceof Error ? err.message : String(err),
        })
      }
    },
  )

  // POST /api/v1/billing/portal — crée une session Customer Portal
  app.post(
    '/portal',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where:  { id: request.user.id },
        select: { stripeCustomerId: true },
      })

      if (!user?.stripeCustomerId) {
        return reply.code(400).send({ error: 'no_stripe_customer' })
      }

      const stripe   = getStripe()
      const session  = await stripe.billingPortal.sessions.create({
        customer:   user.stripeCustomerId,
        return_url: `${env.FRONTEND_URL}/app/billing`,
      })

      return { url: session.url }
    },
  )
}
