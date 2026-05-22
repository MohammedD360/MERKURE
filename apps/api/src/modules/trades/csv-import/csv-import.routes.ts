import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../../middleware/auth.js'
import { prisma } from '../../../infrastructure/database/client.js'
import { parseCsvTrades } from './csv-parser.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5 MB
const ALLOWED_TYPES = new Set(['text/csv', 'text/plain', 'application/csv', 'application/octet-stream'])

export async function csvImportRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/trades/import/csv
   * Body: multipart/form-data
   *   - file     : fichier CSV (obligatoire)
   *   - accountId: string UUID (optionnel — rattache les trades à un compte broker)
   *   - delimiter: ',' | ';' | '\t' (optionnel — auto-détecté si absent)
   */
  app.post('/import/csv', { preHandler: [authenticate] }, async (req, reply) => {
    let csvContent = ''
    let accountId: string | undefined
    let delimiter: string | undefined

    // ── Lit les parties multipart ─────────────────────────────────────────
    try {
      const parts = req.parts({ limits: { fileSize: MAX_FILE_SIZE } })

      for await (const part of parts) {
        if (part.type === 'file') {
          const mimeOk = ALLOWED_TYPES.has(part.mimetype) || part.filename?.endsWith('.csv')
          if (!mimeOk) {
            return reply.code(400).send({ error: 'invalid_file_type', detail: 'Seuls les fichiers .csv sont acceptés' })
          }
          const chunks: Buffer[] = []
          for await (const chunk of part.file) chunks.push(chunk)
          csvContent = Buffer.concat(chunks).toString('utf-8')
        } else {
          // champ texte
          if (part.fieldname === 'accountId') accountId = part.value as string
          if (part.fieldname === 'delimiter')  delimiter  = part.value as string
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Request file too large')) {
        return reply.code(413).send({ error: 'file_too_large', detail: 'Limite : 5 MB' })
      }
      throw err
    }

    if (!csvContent.trim()) {
      return reply.code(400).send({ error: 'empty_file' })
    }

    // ── Vérifie que le compte appartient bien à l'utilisateur ────────────
    if (accountId) {
      const account = await prisma.brokerAccount.findFirst({
        where: { id: accountId, userId: req.user.id },
        select: { id: true },
      })
      if (!account) {
        return reply.code(404).send({ error: 'account_not_found' })
      }
    }

    // ── Parse le CSV ──────────────────────────────────────────────────────
    const { trades, skipped, errors } = parseCsvTrades(csvContent, delimiter ? { delimiter } : {})

    if (trades.length === 0) {
      return reply.code(422).send({ error: 'no_valid_trades', skipped, errors })
    }

    // ── Upsert idempotent (même logique que le sync broker) ───────────────
    let imported = 0
    const importErrors: string[] = [...errors]

    for (const trade of trades) {
      try {
        await prisma.trade.upsert({
          where: {
            brokerAccountId_externalId: {
              brokerAccountId: accountId ?? req.user.id, // fallback = userId si pas de compte
              externalId:      trade.externalId,
            },
          },
          create: {
            userId:          req.user.id,
            brokerAccountId: accountId ?? req.user.id,
            externalId:      trade.externalId,
            symbol:          trade.symbol,
            direction:       trade.direction,
            openTime:        trade.openTime,
            ...(trade.closeTime  ? { closeTime:  trade.closeTime }  : {}),
            openPrice:       trade.openPrice ?? 0,
            ...(trade.closePrice !== null ? { closePrice: trade.closePrice } : {}),
            lotSize:         trade.lotSize,
            ...(trade.pnl !== null ? { pnl: trade.pnl } : {}),
            swap:            trade.swap,
            commission:      trade.commission,
            status:          trade.status,
          },
          update: {
            ...(trade.closeTime  ? { closeTime:  trade.closeTime }  : {}),
            ...(trade.closePrice !== null ? { closePrice: trade.closePrice } : {}),
            ...(trade.pnl !== null ? { pnl: trade.pnl } : {}),
            status:     trade.status,
          },
        })
        imported++
      } catch {
        importErrors.push(`Impossible d'importer le trade ${trade.externalId}`)
        skipped
      }
    }

    return reply.code(201).send({
      imported,
      skipped: skipped + (trades.length - imported),
      errors:  importErrors,
    })
  })
}
