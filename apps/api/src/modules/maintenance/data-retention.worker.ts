import { createWorker, dataRetentionQueue } from '../../infrastructure/queue/queues.js'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

// Tables opérationnelles à croissance illimitée sur un Postgres à disque fixe
// (VPS) — contrairement au stockage élastique Neon. audit_logs et
// refresh_tokens sont volontairement absents : le premier est une trace RGPD
// dont la rétention est une décision légale/produit, pas un choix technique
// par défaut ; le second n'est en réalité jamais écrit (aucun flux ne
// consomme JWT_REFRESH_SECRET), donc rien à y purger.
async function purgeExpiredData(): Promise<{ botEvents: number; resetTokens: number }> {
  const botEventCutoff = new Date(Date.now() - env.BOT_EVENT_RETENTION_DAYS * 86_400_000)

  const [botEvents, resetTokens] = await Promise.all([
    prisma.botEvent.deleteMany({ where: { createdAt: { lt: botEventCutoff } } }),
    // Les tokens de reset déjà expirés n'ont plus aucune utilité, quelle que
    // soit la fenêtre de rétention — purgés inconditionnellement.
    prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ])

  return { botEvents: botEvents.count, resetTokens: resetTokens.count }
}

export function startDataRetentionWorker() {
  return createWorker(
    'data-retention',
    async () => {
      const result = await purgeExpiredData()
      console.log(
        `[data-retention] Purgé : ${result.botEvents} bot_events, ${result.resetTokens} password_reset_tokens`,
      )
    },
    1,
  )
}

// Idempotent — safe à appeler à chaque redémarrage (upsertJobScheduler
// remplace le scheduler existant plutôt que d'en empiler un nouveau).
export async function scheduleDataRetentionCron(): Promise<void> {
  await dataRetentionQueue.upsertJobScheduler(
    'purge-expired-data-cron',
    { every: 24 * 60 * 60 * 1_000 }, // une fois par jour suffit pour du ménage
    { name: 'purge-expired-data', data: {} },
  )
}
