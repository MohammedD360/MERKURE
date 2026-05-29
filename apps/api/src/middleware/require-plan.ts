import type { FastifyRequest, FastifyReply } from 'fastify'

const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, ELITE: 3, INSTITUTIONAL: 4 }

export function requirePlan(minPlan: 'STARTER' | 'PRO' | 'ELITE') {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userRank = PLAN_RANK[request.user?.plan ?? 'FREE'] ?? 0
    const required  = PLAN_RANK[minPlan] ?? 1
    if (userRank < required) {
      return reply.code(403).send({ error: 'plan_required', requiredPlan: minPlan })
    }
  }
}
