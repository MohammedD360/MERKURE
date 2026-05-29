import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../../middleware/auth.js'
import { prisma } from '../../infrastructure/database/client.js'

const ProfileSchema = z.object({
  style: z.enum(['SCALPER', 'DAYTRADER', 'SWINGTRADER', 'INVESTOR']).optional(),
  riskAppetite: z.enum(['LOW', 'MEDIUM', 'HIGH', 'AGGRESSIVE']).optional(),
  markets: z.array(z.string()).max(10).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  timezone: z.string().max(60).optional(),
  currency: z.string().length(3).optional(),
  riskPerTrade: z.number().min(0.1).max(100).optional(),
})

export async function onboardingRoutes(app: FastifyInstance) {
  // GET /api/v1/onboarding/status
  app.get(
    '/status',
    { preHandler: authenticate },
    async (request) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          onboarded: true,
          profile: {
            select: { style: true, riskAppetite: true, markets: true, experienceYears: true },
          },
        },
      })
      return user ?? { onboarded: false, profile: null }
    },
  )

  // POST /api/v1/onboarding/profile — sauvegarde étape 1
  app.post(
    '/profile',
    { preHandler: authenticate },
    async (request, reply) => {
      const body = ProfileSchema.safeParse(request.body)
      if (!body.success) return reply.code(400).send({ error: 'validation_error', issues: body.error.issues })

      const { style, riskAppetite, markets, experienceYears, timezone, currency, riskPerTrade } = body.data

      await prisma.$transaction([
        prisma.user.update({
          where: { id: request.user.id },
          data: {
            ...(timezone ? { timezone } : {}),
            ...(currency ? { currency } : {}),
            ...(riskPerTrade !== undefined ? { riskPerTrade } : {}),
          },
        }),
        prisma.traderProfile.upsert({
          where: { userId: request.user.id },
          create: {
            userId: request.user.id,
            style: style ?? null,
            riskAppetite: riskAppetite ?? null,
            markets: markets ?? [],
            experienceYears: experienceYears ?? null,
          },
          update: {
            ...(style !== undefined ? { style } : {}),
            ...(riskAppetite !== undefined ? { riskAppetite } : {}),
            ...(markets !== undefined ? { markets } : {}),
            ...(experienceYears !== undefined ? { experienceYears } : {}),
          },
        }),
      ])

      return { ok: true }
    },
  )

  // POST /api/v1/onboarding/complete — marque l'onboarding comme terminé
  app.post(
    '/complete',
    { preHandler: authenticate },
    async (request) => {
      await prisma.user.update({
        where: { id: request.user.id },
        data: { onboarded: true },
      })
      return { ok: true }
    },
  )
}
