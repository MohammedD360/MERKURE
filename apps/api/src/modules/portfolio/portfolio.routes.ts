import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { cache } from '../../infrastructure/cache/redis.js'
import { portfolioRepository } from './portfolio.repository.js'

export async function portfolioRoutes(app: FastifyInstance) {
  app.get('/summary', { preHandler: [authenticate] }, async (req) => {
    const key    = `portfolio:summary:${req.user.id}`
    const cached = await cache.get<object>(key)
    if (cached) return cached
    const data = await portfolioRepository.getSummary(req.user.id)
    await cache.set(key, data, 60)
    return data
  })

  app.get('/positions', { preHandler: [authenticate] }, async (req) => {
    return portfolioRepository.getOpenPositions(req.user.id)
  })

  app.get('/breakdown', { preHandler: [authenticate] }, async (req) => {
    const key    = `portfolio:breakdown:${req.user.id}`
    const cached = await cache.get<object>(key)
    if (cached) return cached
    const data = await portfolioRepository.getBreakdown(req.user.id)
    await cache.set(key, data, 60)
    return data
  })

  app.get('/equity-curve', { preHandler: [authenticate] }, async (req) => {
    const key    = `portfolio:equity:${req.user.id}`
    const cached = await cache.get<object[]>(key)
    if (cached) return cached
    const data = await portfolioRepository.getEquityCurve(req.user.id)
    await cache.set(key, data, 300)
    return data
  })
}
