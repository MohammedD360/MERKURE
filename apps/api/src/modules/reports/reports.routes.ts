import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/auth.js'
import { generateWeeklyReport, currentWeekStart } from './weekly-report.service.js'

export async function reportsRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/reports/weekly?weekStart=YYYY-MM-DD
   * Génère et télécharge le rapport PDF hebdomadaire.
   */
  app.get<{ Querystring: { weekStart?: string } }>(
    '/weekly',
    { preHandler: [authenticate] },
    async (req, reply) => {
      let weekStart: Date

      if (req.query.weekStart) {
        weekStart = new Date(req.query.weekStart)
        if (isNaN(weekStart.getTime())) {
          return reply.code(400).send({ error: 'invalid_week_start' })
        }
      } else {
        weekStart = currentWeekStart()
      }

      const year = weekStart.getUTCFullYear()
      // Numéro ISO de semaine (simplifié — déjà calculé dans le service)
      const dayNum    = weekStart.getUTCDay() || 7
      const tmp       = new Date(Date.UTC(year, weekStart.getUTCMonth(), weekStart.getUTCDate() + 4 - dayNum))
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
      const week      = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
      const weekStr   = String(week).padStart(2, '0')

      const buffer = await generateWeeklyReport(req.user.id, weekStart)

      void reply.header('Content-Type', 'application/pdf')
      void reply.header('Content-Disposition', `attachment; filename="rapport-MERKURE-${year}-${weekStr}.pdf"`)
      return reply.send(buffer)
    },
  )
}
