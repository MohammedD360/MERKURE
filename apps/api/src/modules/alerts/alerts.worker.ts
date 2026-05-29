import { createWorker } from '../../infrastructure/queue/queues.js'
import type { AlertJob } from '../../infrastructure/queue/queues.js'
import { prisma } from '../../infrastructure/database/client.js'
import { wsNotify } from '../../websocket/ws.handler.js'

const DEDUP_WINDOW_MS = 24 * 3_600_000 // one alert per type per day

// ─── Shared helper ────────────────────────────────────────────────────────────

async function createAlertIfNew(
  userId:   string,
  type:     'DRAWDOWN' | 'LOTSIZE' | 'PNL_LIMIT',
  severity: 'INFO' | 'WARNING' | 'CRITICAL',
  title:    string,
  body:     string,
): Promise<void> {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS)
  const existing = await prisma.alert.findFirst({
    where:  { userId, type: type as never, severity: severity as never, triggeredAt: { gte: since } },
    select: { id: true },
  })
  if (existing) return

  await prisma.alert.create({
    data: { userId, type: type as never, severity: severity as never, title, body },
  })

  // Push real-time notification so the bell icon lights up instantly
  wsNotify(userId, {
    type: 'alert:triggered',
    data: { alertType: type, severity, title },
  })
}

// ─── Drawdown check ───────────────────────────────────────────────────────────
// Computes the max peak-to-trough drawdown over the last 90 days from
// cumulative KPI snapshots — no dependency on a potentially stale maxDrawdown field.

async function checkDrawdown(userId: string): Promise<void> {
  const from = new Date(Date.now() - 90 * 24 * 3_600_000)
  const snapshots = await prisma.kpiSnapshot.findMany({
    where:   { userId, date: { gte: from } },
    orderBy: { date: 'asc' },
    select:  { totalPnl: true },
  })
  if (snapshots.length < 2) return

  let cumPnl = 0
  let peak   = 0
  let maxDD  = 0

  for (const snap of snapshots) {
    cumPnl += Number(snap.totalPnl ?? 0)
    if (cumPnl > peak) peak = cumPnl
    if (peak > 0) {
      const dd = (peak - cumPnl) / peak
      if (dd > maxDD) maxDD = dd
    }
  }

  const pct = maxDD * 100
  if (pct >= 20) {
    await createAlertIfNew(
      userId, 'DRAWDOWN', 'CRITICAL',
      'Drawdown critique',
      `Votre drawdown atteint ${pct.toFixed(1)} % sur 90 jours — réduisez votre exposition immédiatement.`,
    )
  } else if (pct >= 10) {
    await createAlertIfNew(
      userId, 'DRAWDOWN', 'WARNING',
      'Drawdown élevé',
      `Votre drawdown est de ${pct.toFixed(1)} % sur 90 jours — surveillez votre gestion du risque.`,
    )
  }
}

// ─── Lot size check ───────────────────────────────────────────────────────────
// Warns if cumulative open exposure or a single position exceeds safe thresholds.

async function checkLotSize(userId: string): Promise<void> {
  const openTrades = await prisma.trade.findMany({
    where:  { userId, status: 'OPEN' },
    select: { symbol: true, lotSize: true, direction: true },
  })
  if (openTrades.length === 0) return

  const totalLots = openTrades.reduce((s, t) => s + Number(t.lotSize), 0)

  if (totalLots >= 10) {
    await createAlertIfNew(
      userId, 'LOTSIZE', 'CRITICAL',
      'Exposition excessive',
      `${totalLots.toFixed(2)} lots ouverts cumulés — risque de surexposition majeur.`,
    )
  } else if (totalLots >= 5) {
    await createAlertIfNew(
      userId, 'LOTSIZE', 'WARNING',
      'Exposition élevée',
      `${totalLots.toFixed(2)} lots ouverts cumulés — surveillez votre exposition.`,
    )
  }

  // Check individual position size (>= 1 lot is significant for retail)
  for (const t of openTrades) {
    if (Number(t.lotSize) >= 1.0) {
      await createAlertIfNew(
        userId, 'LOTSIZE', 'WARNING',
        'Position de taille importante',
        `Position ${t.direction} sur ${t.symbol} : ${Number(t.lotSize).toFixed(2)} lot(s).`,
      )
      break // one per cycle is enough
    }
  }
}

// ─── Daily P&L limit check ────────────────────────────────────────────────────
// Warns if today's cumulative P&L crosses a daily loss threshold.

async function checkPnlLimit(userId: string): Promise<void> {
  const todayUtc = new Date()
  todayUtc.setUTCHours(0, 0, 0, 0)

  const snap = await prisma.kpiSnapshot.findFirst({
    where:   { userId, date: { gte: todayUtc } },
    orderBy: { date: 'desc' },
    select:  { totalPnl: true },
  })
  if (!snap?.totalPnl) return

  const pnl = Number(snap.totalPnl)

  if (pnl <= -500) {
    await createAlertIfNew(
      userId, 'PNL_LIMIT', 'CRITICAL',
      'Perte journalière critique',
      `-${Math.abs(pnl).toFixed(2)} $ aujourd'hui — arrêtez de trader et revenez demain.`,
    )
  } else if (pnl <= -100) {
    await createAlertIfNew(
      userId, 'PNL_LIMIT', 'WARNING',
      'Perte journalière importante',
      `-${Math.abs(pnl).toFixed(2)} $ aujourd'hui — respectez votre stop journalier.`,
    )
  }
}

// ─── Worker entry point ───────────────────────────────────────────────────────

export function startAlertsWorker() {
  return createWorker<AlertJob>(
    'alert-process',
    async (job) => {
      const { userId } = job.data
      // Run all checks concurrently; individual failures don't abort others
      await Promise.allSettled([
        checkDrawdown(userId),
        checkLotSize(userId),
        checkPnlLimit(userId),
      ])
    },
    5,
  )
}
