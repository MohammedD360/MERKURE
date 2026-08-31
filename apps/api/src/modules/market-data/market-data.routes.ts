import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { twelveDataClient } from '../../infrastructure/twelve-data/twelve-data-client.js'

export async function marketDataRoutes(app: FastifyInstance) {
  app.get(
    '/quotes',
    { preHandler: [authenticate] },
    async () => {
      if (!twelveDataClient.isLiveConfigured()) {
        return { configured: false, quotes: [] }
      }

      try {
        const quotes = await twelveDataClient.getWatchlistQuotes()
        return { configured: true, quotes }
      } catch {
        return { configured: true, quotes: [], error: 'market_data_unavailable' }
      }
    },
  )
}
