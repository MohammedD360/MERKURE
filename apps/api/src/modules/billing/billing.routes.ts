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
    async (request, reply) => {
      const sub = await prisma.subscription.findUnique({
        where: { userId: request.user.id },
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      })
      return sub ?? { plan: 'FREE', status: 'ACTIVE', currentPeriodEnd: null, cancelAtPeriodEnd: false }
    },
  )

  // POST /api/v1/billing/checkout — crée une session Stripe Checkout
  app.post(
    '/checkout',
    { preHandler: authenticate },
    async (request, reply) => {
      const body = CheckoutSchema.safeParse(request.body)
      if (!body.success) return reply.code(400).send({ error: 'invalid_plan' })

      const planConfig = PLANS[body.data.plan]
      if (!planConfig.stripePriceId) {
        return reply.code(400).send({ error: 'plan_not_available' })
      }

      const stripe = getStripe()

      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { email: true, stripeCustomerId: true },
      })
      if (!user) return reply.code(404).send({ error: 'user_not_found' })

      let customerId = user.stripeCustomerId
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: request.user.id },
        })
        customerId = customer.id
        await prisma.user.update({
          where: { id: request.user.id },
          data: { stripeCustomerId: customerId },
        })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
        success_url: `${env.FRONTEND_URL}/app/dashboard?checkout=success`,
        cancel_url: `${env.FRONTEND_URL}/pricing?checkout=cancelled`,
        metadata: { userId: request.user.id, plan: body.data.plan },
        subscription_data: {
          metadata: { userId: request.user.id, plan: body.data.plan },
        },
      })

      return { url: session.url }
    },
  )

  // POST /api/v1/billing/portal — crée une session Customer Portal
  app.post(
    '/portal',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { stripeCustomerId: true },
      })

      if (!user?.stripeCustomerId) {
        return reply.code(400).send({ error: 'no_stripe_customer' })
      }

      const stripe = getStripe()
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${env.FRONTEND_URL}/dashboard/billing`,
      })

      return { url: session.url }
    },
  )
}
