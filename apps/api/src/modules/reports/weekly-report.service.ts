import PDFDocument from 'pdfkit'
import { kpisRepository } from '../kpis/kpis.repository.js'
import { performanceRepository } from '../performance/performance.repository.js'
import { prisma } from '../../infrastructure/database/client.js'

function weekEnd(weekStart: Date): Date {
  return new Date(weekStart.getTime() + 7 * 86_400_000)
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return n.toFixed(decimals)
}

/** Retourne le lundi de la semaine courante (UTC) */
export function currentWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay() // 0=Dim
  const mon0 = day === 0 ? 6 : day - 1
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - mon0))
}

/** Numéro ISO de la semaine */
function isoWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

export async function generateWeeklyReport(userId: string, weekStart: Date): Promise<Buffer> {
  const wEnd   = weekEnd(weekStart)
  const period = '7d' as const

  // Données
  const [summary, sessions, topTrades] = await Promise.all([
    kpisRepository.getSummary(userId, period),
    performanceRepository.getSessionStats(userId, period),
    prisma.trade.findMany({
      where: { userId, status: 'CLOSED', closeTime: { gte: weekStart, lte: wEnd } },
      orderBy: { pnl: 'desc' },
      select: { id: true, symbol: true, direction: true, pnl: true, openTime: true, closeTime: true },
    }),
  ])

  const sorted    = [...topTrades].sort((a, b) => Number(b.pnl ?? 0) - Number(a.pnl ?? 0))
  const top5win   = sorted.filter(t => Number(t.pnl ?? 0) > 0).slice(0, 5)
  const top5loss  = [...sorted].reverse().filter(t => Number(t.pnl ?? 0) < 0).slice(0, 5)

  const year = weekStart.getUTCFullYear()
  const week = isoWeek(weekStart)

  return new Promise<Buffer>((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = 495 // largeur utile (595 - 2×50)

    // ── Titre ──────────────────────────────────────────────────────────────
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Rapport hebdomadaire MERKURE', { align: 'center' })
      .moveDown(0.3)
      .fontSize(12)
      .font('Helvetica')
      .text(`Semaine ${year}-W${String(week).padStart(2, '0')} | ${formatDate(weekStart)} → ${formatDate(wEnd)}`, { align: 'center' })
      .moveDown(1.5)

    // ── KPIs summary ───────────────────────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Résumé de la semaine')
      .moveDown(0.5)

    const kpiRows: [string, string][] = [
      ['PnL total',       `${fmt(summary.totalPnl)} $`],
      ['Win Rate',        pct(summary.winRate)],
      ['Nb trades',       String(summary.nbTrades)],
      ['Profit Factor',   fmt(summary.profitFactor)],
      ['Max Drawdown',    summary.maxDrawdown != null ? pct(summary.maxDrawdown) : '—'],
    ]

    doc.fontSize(11).font('Helvetica')
    for (const [label, value] of kpiRows) {
      const y = doc.y
      doc
        .text(label, 50, y, { width: 200 })
        .text(value, 260, y, { width: 200 })
        .moveDown(0.3)
    }
    doc.moveDown(1)

    // ── Top 5 gagnants ─────────────────────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Top 5 trades gagnants')
      .moveDown(0.5)

    if (top5win.length === 0) {
      doc.fontSize(11).font('Helvetica').text('Aucun trade gagnant cette semaine.').moveDown(1)
    } else {
      renderTradeTable(doc, top5win)
      doc.moveDown(1)
    }

    // ── Top 5 perdants ─────────────────────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Top 5 trades perdants')
      .moveDown(0.5)

    if (top5loss.length === 0) {
      doc.fontSize(11).font('Helvetica').text('Aucun trade perdant cette semaine.').moveDown(1)
    } else {
      renderTradeTable(doc, top5loss)
      doc.moveDown(1)
    }

    // ── Sessions ───────────────────────────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Performance par session')
      .moveDown(0.5)

    const colW = Math.floor(W / 5)
    // Header
    doc.fontSize(10).font('Helvetica-Bold')
    const headers = ['Session', 'Trades', 'Win Rate', 'PnL total', 'PnL moy']
    headers.forEach((h, i) => doc.text(h, 50 + i * colW, doc.y, { width: colW }))
    doc.moveDown(0.4)

    doc.font('Helvetica').fontSize(10)
    for (const s of sessions) {
      const y = doc.y
      const cols = [
        s.session,
        String(s.nbTrades),
        pct(s.winRate),
        `${fmt(s.totalPnl)} $`,
        `${fmt(s.avgPnl)} $`,
      ]
      cols.forEach((c, i) => doc.text(c, 50 + i * colW, y, { width: colW }))
      doc.moveDown(0.4)
    }

    doc.end()
  })
}

type TradeSummary = {
  id: string
  symbol: string
  direction: string
  pnl: { toString(): string } | null
  openTime: Date
  closeTime: Date | null
}

function renderTradeTable(doc: PDFKit.PDFDocument, trades: TradeSummary[]): void {
  const colW = [60, 60, 80, 80, 80]
  const headers = ['Symbole', 'Direction', 'Ouverture', 'Clôture', 'PnL ($)']

  doc.fontSize(10).font('Helvetica-Bold')
  let x = 50
  headers.forEach((h, i) => {
    doc.text(h, x, doc.y, { width: colW[i] })
    x += colW[i]!
  })
  doc.moveDown(0.4)

  doc.font('Helvetica')
  for (const t of trades) {
    const y = doc.y
    x = 50
    const cols = [
      t.symbol,
      t.direction,
      t.openTime.toISOString().slice(0, 10),
      t.closeTime?.toISOString().slice(0, 10) ?? '—',
      fmt(t.pnl != null ? Number(t.pnl.toString()) : null),
    ]
    cols.forEach((c, i) => {
      doc.text(c, x, y, { width: colW[i] })
      x += colW[i]!
    })
    doc.moveDown(0.4)
  }
}
