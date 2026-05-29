/**
 * Seed de données réalistes pour le compte lau.laborde@icloud.com
 * — Plan ELITE, 6 mois de trades, KPI snapshots, alertes
 */
import { PrismaClient, Direction, TradeStatus, Plan } from '@prisma/client'

const prisma = new PrismaClient()

const USER_ID      = '5e985c81-5d5d-426b-a013-84824c0e544a'
const ACCOUNT_ID   = '196bae0e-a343-4d9f-b935-edfcd324c05c'
const INITIAL_BAL  = 10_000

// ── Instruments ────────────────────────────────────────────────────────────
const INSTRUMENTS = [
  { symbol: 'EURUSD',  pip: 0.0001, pipVal: 10,  minLot: 0.1, maxLot: 1.0  },
  { symbol: 'GBPUSD',  pip: 0.0001, pipVal: 10,  minLot: 0.1, maxLot: 0.8  },
  { symbol: 'USDJPY',  pip: 0.01,   pipVal: 9.1, minLot: 0.1, maxLot: 0.5  },
  { symbol: 'GBPJPY',  pip: 0.01,   pipVal: 9.1, minLot: 0.1, maxLot: 0.5  },
  { symbol: 'XAUUSD',  pip: 0.1,    pipVal: 1,   minLot: 0.05,maxLot: 0.3  },
  { symbol: 'US30',    pip: 1,      pipVal: 1,   minLot: 0.1, maxLot: 0.5  },
  { symbol: 'NAS100',  pip: 1,      pipVal: 1,   minLot: 0.1, maxLot: 0.3  },
  { symbol: 'BTCUSD',  pip: 1,      pipVal: 1,   minLot: 0.05,maxLot: 0.2  },
]

const STRATEGIES = ['Breakout', 'Trend Following', 'Mean Reversion', 'ICT Setup', 'Supply/Demand']

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

// Génère une date de trading (lun-ven, heures de marché EU/US)
function tradingDate(daysAgo: number, sessionHour: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  // Skip weekends
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1)
  d.setHours(sessionHour, randInt(0, 59), randInt(0, 59), 0)
  return d
}

interface TradeSpec {
  daysAgo: number
  isWin:   boolean
  instr:   typeof INSTRUMENTS[0]
  strategy: string
}

async function main() {
  console.log('Seeding Laura — données complètes dashboard...')

  // ── 1. Plan ELITE ──────────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where:  { userId: USER_ID },
    update: { plan: Plan.ELITE, status: 'ACTIVE' },
    create: { userId: USER_ID, plan: Plan.ELITE, status: 'ACTIVE' },
  })
  console.log('✓ Plan ELITE activé')

  // ── 2. Supprimer les anciens trades seed (garder les vrais MetaAPI) ───
  await prisma.trade.deleteMany({
    where: { userId: USER_ID, externalId: { startsWith: 'laura-seed-' } },
  })

  // ── 3. Générer 180 jours de trades (lun-ven, 1-4 trades/jour) ─────────
  const specs: TradeSpec[] = []
  let winCount = 0

  for (let daysAgo = 180; daysAgo >= 1; daysAgo--) {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    if (d.getDay() === 0 || d.getDay() === 6) continue   // no weekend

    const tradesThisDay = randInt(1, 4)
    for (let t = 0; t < tradesThisDay; t++) {
      // Win rate 58% avec biais légèrement négatif en début, positif en fin
      const baseWr = 0.52 + (180 - daysAgo) / 180 * 0.12  // 52% → 64% sur 6 mois
      const isWin = Math.random() < baseWr
      if (isWin) winCount++
      specs.push({
        daysAgo,
        isWin,
        instr:    pick(INSTRUMENTS),
        strategy: pick(STRATEGIES),
      })
    }
  }

  console.log(`  Génération de ${specs.length} trades (winCount=${winCount}, wr=${(winCount/specs.length*100).toFixed(1)}%)`)

  const sessions = [8, 9, 10, 13, 14, 15, 16]
  let tradeIdx = 0

  for (const spec of specs) {
    const hour = pick(sessions)
    const openTime = tradingDate(spec.daysAgo, hour)
    const duration  = randInt(15, 240)                 // 15 min à 4h
    const closeTime = new Date(openTime.getTime() + duration * 60_000)

    const lot       = parseFloat(rand(spec.instr.minLot, spec.instr.maxLot).toFixed(2))
    const isLong    = Math.random() > 0.5

    // P&L réaliste
    let pnl: number
    if (spec.isWin) {
      pnl = parseFloat(rand(30, 250).toFixed(2))
    } else {
      pnl = parseFloat((-rand(20, 150)).toFixed(2))
    }

    const openPrice  = parseFloat(rand(1.05, 1.15).toFixed(5))
    const closePrice = parseFloat((openPrice + (isLong ? 1 : -1) * rand(0.0001, 0.005)).toFixed(5))

    await prisma.trade.create({
      data: {
        brokerAccountId: ACCOUNT_ID,
        userId:          USER_ID,
        externalId:      `laura-seed-${tradeIdx++}`,
        symbol:          spec.instr.symbol,
        direction:       isLong ? Direction.LONG : Direction.SHORT,
        openTime,
        closeTime,
        openPrice,
        closePrice,
        lotSize:         lot,
        pnl,
        pnlPct:          pnl / INITIAL_BAL,
        swap:            parseFloat((-rand(0, 3)).toFixed(2)),
        commission:      parseFloat((-rand(0.5, 3)).toFixed(2)),
        strategyTag:     spec.strategy,
        status:          TradeStatus.CLOSED,
      },
    })
  }

  console.log(`✓ ${tradeIdx} trades insérés`)

  // ── 4. KPI Snapshots ──────────────────────────────────────────────────
  await prisma.kpiSnapshot.deleteMany({
    where: { userId: USER_ID, date: { lt: new Date() } },
  })

  const allTrades = await prisma.trade.findMany({
    where:   { userId: USER_ID, status: 'CLOSED', closeTime: { not: null } },
    orderBy: { closeTime: 'asc' },
  })

  // Regrouper par jour
  const byDate = new Map<string, typeof allTrades>()
  for (const t of allTrades) {
    if (!t.closeTime) continue
    const key = t.closeTime.toISOString().slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(t)
  }

  // Calcul cumulatif pour l'equity curve et le drawdown
  let balance     = INITIAL_BAL
  let peakBalance = INITIAL_BAL
  const snapshots: Parameters<typeof prisma.kpiSnapshot.upsert>[0]['create'][] = []

  for (const [dateStr, dayTrades] of byDate) {
    const winners      = dayTrades.filter(t => Number(t.pnl ?? 0) > 0)
    const losers       = dayTrades.filter(t => Number(t.pnl ?? 0) < 0)
    const totalPnl     = dayTrades.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
    const grossProfit  = winners.reduce((s, t) => s + Number(t.pnl), 0)
    const grossLoss    = Math.abs(losers.reduce((s, t) => s + Number(t.pnl), 0))
    const winRate      = dayTrades.length > 0 ? winners.length / dayTrades.length : 0
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null

    balance += totalPnl
    if (balance > peakBalance) peakBalance = balance
    const drawdown = peakBalance > 0 ? (balance - peakBalance) / peakBalance : 0

    // Sharpe simplifié (sur la journée)
    const pnls  = dayTrades.map(t => Number(t.pnl ?? 0))
    const mean  = pnls.reduce((a, b) => a + b, 0) / pnls.length
    const std   = Math.sqrt(pnls.map(p => (p - mean) ** 2).reduce((a, b) => a + b, 0) / pnls.length)
    const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : null

    const avgRr = grossLoss > 0 && winners.length > 0
      ? (grossProfit / winners.length) / (grossLoss / Math.max(losers.length, 1))
      : null

    snapshots.push({
      userId:      USER_ID,
      date:        new Date(dateStr),
      balance:     parseFloat(balance.toFixed(2)),
      equity:      parseFloat((balance + rand(-50, 50)).toFixed(2)),
      totalPnl:    parseFloat(totalPnl.toFixed(2)),
      winRate:     parseFloat(winRate.toFixed(4)),
      profitFactor: profitFactor ? parseFloat(profitFactor.toFixed(4)) : null,
      sharpeRatio: sharpe ? parseFloat(Math.min(Math.max(sharpe, -3), 3).toFixed(4)) : null,
      maxDrawdown: parseFloat(drawdown.toFixed(6)),
      nbTrades:    dayTrades.length,
      avgRr:       avgRr ? parseFloat(avgRr.toFixed(4)) : null,
    })
  }

  for (const snap of snapshots) {
    await prisma.kpiSnapshot.upsert({
      where:  { userId_date: { userId: USER_ID, date: snap.date } },
      create: snap,
      update: snap,
    })
  }

  console.log(`✓ ${snapshots.length} KPI snapshots créés — Balance finale : ${balance.toFixed(2)} EUR`)

  // ── 5. Alertes ────────────────────────────────────────────────────────
  await prisma.alert.deleteMany({ where: { userId: USER_ID } })

  await prisma.alert.createMany({
    data: [
      {
        userId:    USER_ID,
        type:      'DRAWDOWN',
        severity:  'WARNING',
        title:     'Drawdown élevé détecté',
        body:      'Votre drawdown a dépassé 8% cette semaine. Réduisez la taille de vos positions.',
        isRead:    false,
        triggeredAt: new Date(Date.now() - 2 * 86400_000),
      },
      {
        userId:    USER_ID,
        type:      'AI_RECOMMENDATION',
        severity:  'INFO',
        title:     'Analyse IA — Performance hebdomadaire',
        body:      'Vos meilleures performances sont sur EURUSD le matin (session London). Envisagez de concentrer vos trades entre 8h et 12h.',
        isRead:    false,
        triggeredAt: new Date(Date.now() - 1 * 86400_000),
      },
      {
        userId:    USER_ID,
        type:      'PNL_LIMIT',
        severity:  'INFO',
        title:     'Objectif mensuel atteint à 80%',
        body:      'Vous avez réalisé 80% de votre objectif de P&L mensuel. Continuez sur cette lancée.',
        isRead:    true,
        triggeredAt: new Date(Date.now() - 3 * 86400_000),
      },
      {
        userId:    USER_ID,
        type:      'LOTSIZE',
        severity:  'WARNING',
        title:     'Taille de position trop élevée',
        body:      'Le trade XAUUSD du 20/05 représentait 3.2% de risque — au-dessus de votre limite de 2%.',
        isRead:    true,
        triggeredAt: new Date(Date.now() - 5 * 86400_000),
      },
    ],
  })

  console.log('✓ 4 alertes créées')

  // ── 6. Résumé ──────────────────────────────────────────────────────────
  const totalTrades = await prisma.trade.count({ where: { userId: USER_ID } })
  console.log('\n══ SEED LAURA TERMINÉ ══')
  console.log(`  Email       : lau.laborde@icloud.com`)
  console.log(`  Plan        : ELITE`)
  console.log(`  Trades total: ${totalTrades}`)
  console.log(`  Balance     : ${INITIAL_BAL.toFixed(2)} → ${balance.toFixed(2)} EUR`)
  console.log(`  P&L net     : ${(balance - INITIAL_BAL).toFixed(2)} EUR`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
