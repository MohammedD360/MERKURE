import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../../middleware/auth.js'
import { prisma } from '../../../infrastructure/database/client.js'
import { cache } from '../../../infrastructure/cache/redis.js'
import { parseCsvTrades } from './csv-parser.js'
import { recalculateKpiSnapshots } from '../../kpis/kpi-snapshots.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5 MB
const ALLOWED_TYPES = new Set(['text/csv', 'text/plain', 'application/csv', 'application/octet-stream'])

// Le contrôle MIME est contournable par un simple renommage en .csv — un CSV
// n'a pas de signature binaire propre (c'est du texte brut), mais on peut au
// moins rejeter les formats binaires connus qu'on ne veut jamais faire
// transiter par ce endpoint (xlsx/docx/zip, xls/doc legacy, PDF, exécutables).
const BINARY_SIGNATURES: { bytes: number[]; label: string }[] = [
  { bytes: [0x50, 0x4b, 0x03, 0x04], label: 'ZIP/Office (xlsx, docx…)' },
  { bytes: [0xd0, 0xcf, 0x11, 0xe0], label: 'OLE (xls, doc legacy)' },
  { bytes: [0x25, 0x50, 0x44, 0x46], label: 'PDF' },
  { bytes: [0x4d, 0x5a],             label: 'exécutable Windows' },
]

function hasKnownBinarySignature(buf: Buffer): string | null {
  for (const sig of BINARY_SIGNATURES) {
    if (buf.length >= sig.bytes.length && sig.bytes.every((b, i) => buf[i] === b)) {
      return sig.label
    }
  }
  return null
}

export async function csvImportRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/trades/import/csv
   * Body: multipart/form-data
   *   - file     : fichier CSV (obligatoire)
   *   - accountId: string UUID (obligatoire — rattache les trades à un compte broker précis ;
   *                pas de repli implicite sur "le premier compte" pour éviter de relier
   *                silencieusement des trades au mauvais compte)
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
          const buffer = Buffer.concat(chunks)
          const binarySignature = hasKnownBinarySignature(buffer)
          if (binarySignature) {
            return reply.code(400).send({
              error:  'invalid_file_type',
              detail: `Fichier détecté comme ${binarySignature}, pas un CSV — vérifiez l'extension.`,
            })
          }
          csvContent = buffer.toString('utf-8')
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

    // ── Résout le compte broker ───────────────────────────────────────────
    // Obligatoire : un import CSV sans compte explicite atterrirait autrefois
    // sur "le premier compte créé" — un trader avec plusieurs comptes se
    // retrouvait avec des trades reliés au mauvais challenge/broker sans le
    // savoir. Mieux vaut échouer clairement que deviner.
    if (!accountId) {
      return reply.code(400).send({
        error:  'account_required',
        detail: 'Sélectionnez le compte auquel rattacher ces trades.',
      })
    }

    const account = await prisma.brokerAccount.findFirst({
      where:  { id: accountId, userId: req.user.id, deletedAt: null },
      select: { id: true },
    })
    if (!account) {
      return reply.code(404).send({ error: 'account_not_found' })
    }

    // ── Parse le CSV ──────────────────────────────────────────────────────
    const { trades, skipped, errors } = parseCsvTrades(csvContent, delimiter ? { delimiter } : {})

    if (trades.length === 0) {
      return reply.code(422).send({ error: 'no_valid_trades', skipped, errors })
    }

    // ── Upsert idempotent (même logique que le sync broker) ───────────────
    // Lots de 100 exécutés en parallèle plutôt qu'un aller-retour DB séquentiel
    // par ligne : un import de plusieurs milliers de trades ne doit pas tenir
    // une connexion pendant toute la durée de la requête et dégrader la latence
    // des autres requêtes concurrentes sur un VPS à CPU limité. Chaque ligne
    // reste individuellement catchée (Promise.allSettled) pour ne pas faire
    // échouer tout un lot à cause d'une seule ligne invalide.
    const BATCH_SIZE = 100
    let imported = 0
    let dbSkipped = 0
    const importErrors: string[] = [...errors]

    for (let i = 0; i < trades.length; i += BATCH_SIZE) {
      const batch = trades.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map(trade => prisma.trade.upsert({
          where: {
            brokerAccountId_externalId: {
              brokerAccountId: accountId,
              externalId:      trade.externalId,
            },
          },
          create: {
            userId:          req.user.id,
            brokerAccountId: accountId,
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
        })),
      )
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          imported++
        } else {
          importErrors.push(`Impossible d'importer le trade ${batch[idx]!.externalId}`)
          dbSkipped++
        }
      })
    }

    // Recalcule les KPI snapshots et invalide le cache Redis avant de répondre
    if (imported > 0) {
      const oldest = trades.reduce(
        (d, t) => (t.openTime < d ? t.openTime : d),
        trades[0]!.openTime,
      )
      await recalculateKpiSnapshots(req.user.id, oldest)
      await Promise.all([
        cache.delPattern(`kpis:${req.user.id}:*`),
        cache.delPattern(`trades:${req.user.id}:*`),
        cache.delPattern(`stats:*:${req.user.id}:*`),
        cache.delPattern(`propfirm:compliance:${req.user.id}:*`),
        cache.del(`portfolio:summary:${req.user.id}`),
        cache.del(`portfolio:breakdown:${req.user.id}`),
        cache.del(`portfolio:equity:${req.user.id}`),
      ])
    }

    return reply.code(201).send({
      imported,
      skipped: skipped + dbSkipped,
      errors:  importErrors,
    })
  })
}
