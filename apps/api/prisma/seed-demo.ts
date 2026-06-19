/**
 * Seed complet — compte démo MERKURE
 * Remplit TOUTES les pages avec des données réalistes :
 * dashboard, trades, KPIs, journal, IA, alertes, profil, comptes brokers
 */
import { PrismaClient, Plan, Direction, TradeStatus, BrokerType, AccountType, SyncStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── IDs fixes pour cohérence ────────────────────────────────────────────────
const USER_ID        = 'demo_user_merkure'
const ACCOUNT_LIVE   = 'demo-account-live-001'
const ACCOUNT_PROP   = 'demo-account-prop-001'
const ACCOUNT_DEMO   = 'demo-account-demo-001'
const INITIAL_BAL    = 12_500

// ── Helpers ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]! }
function daysAgo(n: number, h = 10): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(h, randInt(0, 59), randInt(0, 59), 0)
  return d
}

const INSTRUMENTS = [
  { symbol: 'EURUSD', minLot: 0.05, maxLot: 0.5 },
  { symbol: 'GBPUSD', minLot: 0.05, maxLot: 0.4 },
  { symbol: 'USDJPY', minLot: 0.05, maxLot: 0.3 },
  { symbol: 'GBPJPY', minLot: 0.05, maxLot: 0.3 },
  { symbol: 'XAUUSD', minLot: 0.01, maxLot: 0.15 },
  { symbol: 'US30',   minLot: 0.05, maxLot: 0.3 },
  { symbol: 'NAS100', minLot: 0.05, maxLot: 0.2 },
  { symbol: 'BTCUSD', minLot: 0.01, maxLot: 0.1 },
  { symbol: 'USDCAD', minLot: 0.05, maxLot: 0.4 },
  { symbol: 'AUDUSD', minLot: 0.05, maxLot: 0.4 },
]
const STRATEGIES = ['Breakout', 'Trend Following', 'Mean Reversion', 'ICT Setup', 'Supply/Demand', 'Scalping M1', 'Order Block', 'Fair Value Gap']
const SESSIONS = [8, 9, 10, 13, 14, 15, 16, 17]

async function main() {
  console.log('🌱  Seed MERKURE démo complet...\n')

  // ── 1. Utilisateur ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo1234!', 12)
  const user = await prisma.user.upsert({
    where: { id: USER_ID },
    update: {
      firstName: 'Alexandre',
      lastName:  'Moreau',
      email:     'demo@merkure.app',
      onboarded: true,
      emailVerified: true,
      timezone:  'Europe/Paris',
      currency:  'EUR',
      riskPerTrade: 1.5,
    },
    create: {
      id:            USER_ID,
      clerkId:       USER_ID,
      email:         'demo@merkure.app',
      passwordHash,
      firstName:     'Alexandre',
      lastName:      'Moreau',
      onboarded:     true,
      emailVerified: true,
      timezone:      'Europe/Paris',
      currency:      'EUR',
      riskPerTrade:  1.5,
    },
  })
  console.log('✓ Utilisateur créé:', user.email)

  // ── 2. Profil trader ────────────────────────────────────────────────────
  await prisma.traderProfile.upsert({
    where: { userId: USER_ID },
    update: { style: 'DAYTRADER', riskAppetite: 'MEDIUM', markets: ['forex', 'indices', 'crypto'], experienceYears: 4 },
    create: { userId: USER_ID, style: 'DAYTRADER', riskAppetite: 'MEDIUM', markets: ['forex', 'indices', 'crypto'], experienceYears: 4 },
  })
  console.log('✓ Profil trader')

  // ── 3. Abonnement ELITE ──────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { userId: USER_ID },
    update: { plan: Plan.ELITE, status: 'ACTIVE', currentPeriodEnd: new Date('2099-12-31') },
    create: { userId: USER_ID, plan: Plan.ELITE, status: 'ACTIVE', currentPeriodEnd: new Date('2099-12-31') },
  })
  console.log('✓ Abonnement ELITE')

  // ── 4. Comptes brokers ───────────────────────────────────────────────────
  const brokerAccountLive = await prisma.brokerAccount.upsert({
    where:  { userId_brokerType_accountId: { userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'LIVE-78432' } },
    update: { label: 'ICMarkets - Live', syncStatus: SyncStatus.SUCCESS, lastSyncAt: new Date(), accountType: AccountType.LIVE },
    create: { id: ACCOUNT_LIVE, userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'LIVE-78432', label: 'ICMarkets - Live', accountType: AccountType.LIVE, syncStatus: SyncStatus.SUCCESS, lastSyncAt: new Date() },
  })
  const brokerAccountProp = await prisma.brokerAccount.upsert({
    where:  { userId_brokerType_accountId: { userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'PROP-12901' } },
    update: { label: 'FTMO - Challenge 50K', syncStatus: SyncStatus.SUCCESS, lastSyncAt: new Date(), accountType: AccountType.PROP_CHALLENGE },
    create: { id: ACCOUNT_PROP, userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'PROP-12901', label: 'FTMO - Challenge 50K', accountType: AccountType.PROP_CHALLENGE, syncStatus: SyncStatus.SUCCESS, lastSyncAt: new Date() },
  })
  const brokerAccountDemo = await prisma.brokerAccount.upsert({
    where:  { userId_brokerType_accountId: { userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'DEMO-45521' } },
    update: { label: 'XM - Démo', syncStatus: SyncStatus.SUCCESS, lastSyncAt: daysAgo(1), accountType: AccountType.DEMO },
    create: { id: ACCOUNT_DEMO, userId: USER_ID, brokerType: BrokerType.MT5, accountId: 'DEMO-45521', label: 'XM - Démo', accountType: AccountType.DEMO, syncStatus: SyncStatus.SUCCESS, lastSyncAt: daysAgo(1) },
  })
  console.log('✓ 3 comptes brokers (LIVE, PROP_CHALLENGE, DEMO)')

  // ── 5. Trades (180 jours, compte LIVE) ──────────────────────────────────
  await prisma.trade.deleteMany({ where: { userId: USER_ID, externalId: { startsWith: 'demo-seed-' } } })

  const tradeSpecs: Array<{ daysAgo: number; isWin: boolean; instr: typeof INSTRUMENTS[0]; strategy: string; accountId: string }> = []
  let winCount = 0

  for (let d = 180; d >= 1; d--) {
    const date = new Date(); date.setDate(date.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const count = randInt(1, 4)
    for (let t = 0; t < count; t++) {
      const baseWr = 0.50 + (180 - d) / 180 * 0.15
      const isWin = Math.random() < baseWr
      if (isWin) winCount++
      tradeSpecs.push({ daysAgo: d, isWin, instr: pick(INSTRUMENTS), strategy: pick(STRATEGIES), accountId: d <= 30 ? ACCOUNT_LIVE : pick([ACCOUNT_LIVE, ACCOUNT_DEMO]) })
    }
  }

  // Quelques trades sur compte PROP
  for (let d = 30; d >= 1; d--) {
    const date = new Date(); date.setDate(date.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    if (Math.random() > 0.4) continue
    tradeSpecs.push({ daysAgo: d, isWin: Math.random() < 0.62, instr: pick(INSTRUMENTS.slice(0, 5)), strategy: pick(STRATEGIES), accountId: ACCOUNT_PROP })
  }

  console.log(`  Génération de ${tradeSpecs.length} trades...`)
  let idx = 0
  const BATCH = 50
  for (let i = 0; i < tradeSpecs.length; i += BATCH) {
    const batch = tradeSpecs.slice(i, i + BATCH)
    await prisma.trade.createMany({
      data: batch.map(spec => {
        const hour = pick(SESSIONS)
        const openTime = daysAgo(spec.daysAgo, hour)
        const closeTime = new Date(openTime.getTime() + randInt(15, 300) * 60_000)
        const lot = parseFloat(rand(spec.instr.minLot, spec.instr.maxLot).toFixed(2))
        const isLong = Math.random() > 0.5
        const pnl = parseFloat((spec.isWin ? rand(25, 280) : -rand(15, 160)).toFixed(2))
        const openPrice = parseFloat(rand(1.05, 1.20).toFixed(5))
        return {
          brokerAccountId: spec.accountId,
          userId: USER_ID,
          externalId: `demo-seed-${idx++}`,
          symbol: spec.instr.symbol,
          direction: isLong ? Direction.LONG : Direction.SHORT,
          openTime, closeTime, openPrice,
          closePrice: parseFloat((openPrice + (isLong ? 1 : -1) * rand(0.0002, 0.006)).toFixed(5)),
          lotSize: lot,
          pnl,
          pnlPct: pnl / INITIAL_BAL,
          swap: parseFloat((-rand(0, 4)).toFixed(2)),
          commission: parseFloat((-rand(0.5, 3.5)).toFixed(2)),
          strategyTag: spec.strategy,
          note: Math.random() > 0.7 ? pick(['Bon setup, respect du plan', 'Entrée sur OB H1', 'Stop trop serré', 'Sortie prématurée', 'Excellente lecture du marché', 'FOMO — à éviter', 'Confirmation 4H + 1H']) : null,
          status: TradeStatus.CLOSED,
        }
      }),
      skipDuplicates: true,
    })
  }

  // 3 trades OUVERTS pour la page Positions
  const openTrades = [
    { symbol: 'EURUSD', dir: Direction.LONG,  pnl: 127.50, lot: 0.3 },
    { symbol: 'XAUUSD', dir: Direction.SHORT, pnl: -43.20, lot: 0.05 },
    { symbol: 'NAS100', dir: Direction.LONG,  pnl: 89.00,  lot: 0.1 },
  ]
  for (const t of openTrades) {
    await prisma.trade.create({
      data: {
        brokerAccountId: ACCOUNT_LIVE,
        userId: USER_ID,
        externalId: `demo-open-${t.symbol}`,
        symbol: t.symbol,
        direction: t.dir,
        openTime: daysAgo(0, 9),
        openPrice: parseFloat(rand(1.05, 1.20).toFixed(5)),
        lotSize: t.lot,
        pnl: t.pnl,
        pnlPct: t.pnl / INITIAL_BAL,
        swap: 0, commission: -1.5,
        status: TradeStatus.OPEN,
        strategyTag: pick(STRATEGIES),
      },
    }).catch(() => {}) // ignore duplicates
  }

  console.log(`✓ ${idx} trades fermés + 3 ouverts`)

  // ── 6. KPI Snapshots (180 jours) ────────────────────────────────────────
  await prisma.kpiSnapshot.deleteMany({ where: { userId: USER_ID } })

  const allTrades = await prisma.trade.findMany({
    where: { userId: USER_ID, status: TradeStatus.CLOSED },
    orderBy: { closeTime: 'asc' },
    select: { closeTime: true, pnl: true },
  })

  const byDate = new Map<string, number[]>()
  for (const t of allTrades) {
    if (!t.closeTime) continue
    const key = t.closeTime.toISOString().slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(Number(t.pnl ?? 0))
  }

  let balance = INITIAL_BAL, peak = INITIAL_BAL
  const snaps = []
  for (const [dateStr, pnls] of byDate) {
    const totalPnl = pnls.reduce((a, b) => a + b, 0)
    const wins = pnls.filter(p => p > 0)
    const losses = pnls.filter(p => p < 0)
    balance += totalPnl
    if (balance > peak) peak = balance
    const dd = peak > 0 ? (balance - peak) / peak : 0
    const gp = wins.reduce((a, b) => a + b, 0)
    const gl = Math.abs(losses.reduce((a, b) => a + b, 0))
    const mean = pnls.reduce((a, b) => a + b, 0) / pnls.length
    const std  = Math.sqrt(pnls.map(p => (p - mean) ** 2).reduce((a, b) => a + b, 0) / pnls.length)
    snaps.push({
      userId: USER_ID,
      date: new Date(dateStr),
      balance:     parseFloat(balance.toFixed(2)),
      equity:      parseFloat((balance + rand(-80, 80)).toFixed(2)),
      totalPnl:    parseFloat(totalPnl.toFixed(2)),
      winRate:     parseFloat((wins.length / pnls.length).toFixed(4)),
      profitFactor: gl > 0 ? parseFloat((gp / gl).toFixed(4)) : null,
      sharpeRatio: std > 0 ? parseFloat(Math.min(Math.max((mean / std) * Math.sqrt(252), -3), 3).toFixed(4)) : null,
      maxDrawdown: parseFloat(dd.toFixed(6)),
      nbTrades:    pnls.length,
      avgRr:       gl > 0 && wins.length > 0 ? parseFloat(((gp / wins.length) / (gl / Math.max(losses.length, 1))).toFixed(4)) : null,
    })
  }
  for (const snap of snaps) {
    await prisma.kpiSnapshot.upsert({ where: { userId_date: { userId: USER_ID, date: snap.date } }, create: snap, update: snap })
  }
  console.log(`✓ ${snaps.length} KPI snapshots — Balance: ${INITIAL_BAL} → ${balance.toFixed(0)} €`)

  // ── 7. Journal de trading (12 semaines) ─────────────────────────────────
  await prisma.journalEntry.deleteMany({ where: { userId: USER_ID } })
  const MOODS = ['focused', 'calm', 'anxious', 'confident', 'tired', 'motivated']
  const journalEntries = []
  for (let w = 12; w >= 0; w--) {
    for (const dayOffset of [1, 2, 3, 4, 5]) {
      const d = new Date()
      d.setDate(d.getDate() - w * 7 - dayOffset)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      if (Math.random() > 0.65) continue
      journalEntries.push({
        userId: USER_ID,
        date: new Date(d.toISOString().slice(0, 10)),
        mood: pick(MOODS),
        planBefore: pick([
          'Focus sur EURUSD session London, pas de trade avant 9h. Max 2 trades.',
          'Setup uniquement sur niveaux H4 confirmés. Stop à 1R.',
          'Journée de patience — attendre la liquidité NY.',
          'Pas de trade sur news FOMC. Reprendre après 16h.',
          'Objectif : 1 beau trade bien géré, peu importe le résultat.',
        ]),
        reviewAfter: pick([
          'Bonne journée. Respect du plan, 2 trades gagnants sur EURUSD.',
          'Sorti trop tôt sur GBPUSD. Manque de patience sur la TP zone.',
          'FOMO sur NAS100 — exactement ce que je voulais éviter. -1R.',
          'Excellent setup ICT, entrée propre sur FVG, +2.3R.',
          'Session asiatique — peu de liquidité, sage de ne pas trader.',
          'Overtrading après 2 pertes. Doit respecter la règle des 2 pertes/jour.',
        ]),
        notes: Math.random() > 0.5 ? pick([
          'Marché en range — éviter les fakeouts',
          'CPI demain, se positionner avant ou attendre ?',
          'Mon meilleur setup reste le breakout London open',
          'Retravailler la gestion du trailing stop',
        ]) : null,
      })
    }
  }
  await prisma.journalEntry.createMany({ data: journalEntries, skipDuplicates: true })
  console.log(`✓ ${journalEntries.length} entrées de journal`)

  // ── 8. Analyses IA ──────────────────────────────────────────────────────
  await prisma.aiJournalEntry.deleteMany({ where: { userId: USER_ID } })
  const aiEntries = [
    {
      userId: USER_ID, date: new Date(daysAgo(3).toISOString().slice(0, 10)),
      score: 74,
      aiAnalysis: `Analyse de tes 30 derniers trades : tu montres une progression nette sur la gestion du risque avec un RR moyen de 1.8 sur les 2 dernières semaines. Tes forces majeures sont la lecture du marché London Open et ta discipline sur les niveaux H4. Points d'amélioration : overtrading détecté les jeudis (3.2 trades/jour vs 1.8 les autres jours), et une tendance au revenge trading après 2 pertes consécutives.`,
      insights: { strengths: ["Lecture London Open excellente", "Discipline sur niveaux H4", "Win rate 62% sur EURUSD"], improvements: ["Overtrading le jeudi — limiter à 2 trades", "Revenge trading après perte — pause obligatoire", "Sortie prématurée sur trades gagnants"], actions: ["Règle : pause 30 min après 2 pertes consécutives", "Journal émotionnel avant chaque session", "Revoir les trades jeudi — identifier le trigger"] },
      inputTokens: 1240, outputTokens: 580,
    },
    {
      userId: USER_ID, date: new Date(daysAgo(10).toISOString().slice(0, 10)),
      score: 68,
      aiAnalysis: `Cette semaine montre des résultats mitigés. Tu as bien respecté tes règles les 3 premiers jours, mais vendredi une série de 4 trades perdants a impacté la semaine. Le pattern de revenge trading est visible : après 2 pertes, tu as pris 2 trades supplémentaires sans setup clair.`,
      insights: { strengths: ["Bonnes entrées mardi et mercredi", "Stop loss respecté sur 90% des trades"], improvements: ["Vendredi : 4 trades, 0 setup valide", "Taille de position augmentée après pertes"], actions: ["Implémenter la règle 2 pertes = stop pour la journée", "Tracker l'heure des trades perdants"] },
      inputTokens: 980, outputTokens: 440,
    },
    {
      userId: USER_ID, date: new Date(daysAgo(21).toISOString().slice(0, 10)),
      score: 81,
      aiAnalysis: `Très bonne semaine. Win rate de 68%, profit factor de 2.4. Tu as parfaitement exploité les gaps London Open sur EURUSD et GBPUSD. La gestion du trailing stop montre une amélioration notable.`,
      insights: { strengths: ["Win rate 68% — meilleure semaine du mois", "Profit factor 2.4", "Excellente gestion trailing stop", "Respect du plan 5/5 jours"], improvements: ["Continuer à éviter XAUUSD en range"], actions: ["Documenter les setups gagnants de cette semaine", "Répliquer sur le mois suivant"] },
      inputTokens: 850, outputTokens: 390,
    },
  ]
  await prisma.aiJournalEntry.createMany({ data: aiEntries, skipDuplicates: true })
  console.log(`✓ ${aiEntries.length} analyses IA`)

  // ── 9. Alertes ──────────────────────────────────────────────────────────
  await prisma.alert.deleteMany({ where: { userId: USER_ID } })
  await prisma.alert.createMany({
    data: [
      { userId: USER_ID, type: 'AI_RECOMMENDATION', severity: 'INFO', title: 'Analyse IA disponible', body: 'Votre analyse hebdomadaire est prête. Score global : 74/100. Points clés : overtrading jeudi, bon respect des niveaux H4.', isRead: false, triggeredAt: daysAgo(0, 8) },
      { userId: USER_ID, type: 'DRAWDOWN',          severity: 'WARNING', title: 'Drawdown journalier à 3.2%', body: 'Vous approchez de votre limite de drawdown journalier. Considérez arrêter le trading pour aujourd\'hui.', isRead: false, triggeredAt: daysAgo(1, 14) },
      { userId: USER_ID, type: 'PNL_LIMIT',         severity: 'INFO', title: 'Objectif hebdomadaire atteint à 85%', body: 'Vous avez réalisé 85% de votre objectif de P&L hebdomadaire. +1 087 € sur la semaine.', isRead: false, triggeredAt: daysAgo(2, 17) },
      { userId: USER_ID, type: 'LOTSIZE',           severity: 'WARNING', title: 'Taille de position élevée', body: 'Trade XAUUSD du 12/06 : 0.15 lot = 2.8% du capital. Au-dessus de votre limite de 2%.', isRead: true, triggeredAt: daysAgo(4, 11) },
      { userId: USER_ID, type: 'AI_RECOMMENDATION', severity: 'INFO', title: 'Biais détecté : revenge trading', body: 'Pattern identifié : vous prenez en moyenne 2.1 trades supplémentaires après 2 pertes consécutives. Taux d\'échec de ces trades : 78%.', isRead: true, triggeredAt: daysAgo(7, 9) },
      { userId: USER_ID, type: 'DRAWDOWN',          severity: 'CRITICAL', title: 'Drawdown maximal atteint cette semaine', body: 'Drawdown de 6.8% cette semaine. Réduisez significativement votre exposition.', isRead: true, triggeredAt: daysAgo(10, 16) },
      { userId: USER_ID, type: 'PNL_LIMIT',         severity: 'INFO', title: 'Record mensuel battu', body: 'Meilleur mois depuis votre inscription : +3 247 €. Profit factor : 2.1.', isRead: true, triggeredAt: daysAgo(14, 18) },
      { userId: USER_ID, type: 'SYNC_ERROR',        severity: 'WARNING', title: 'Synchronisation XM interrompue', body: 'Compte XM Démo : dernière synchro il y a 26h. Vérifiez vos identifiants.', isRead: true, triggeredAt: daysAgo(5, 7) },
    ],
  })
  console.log('✓ 8 alertes')

  // ── 10. Résumé ───────────────────────────────────────────────────────────
  const totalTrades = await prisma.trade.count({ where: { userId: USER_ID } })
  const totalJournal = await prisma.journalEntry.count({ where: { userId: USER_ID } })
  const totalKpi = await prisma.kpiSnapshot.count({ where: { userId: USER_ID } })
  const totalAlerts = await prisma.alert.count({ where: { userId: USER_ID } })

  console.log('\n══════════════════════════════════════════')
  console.log('  SEED DÉMO MERKURE — TERMINÉ')
  console.log('══════════════════════════════════════════')
  console.log(`  Email        : demo@merkure.app`)
  console.log(`  Mot de passe : Demo1234!`)
  console.log(`  Plan         : ELITE`)
  console.log(`  Trades       : ${totalTrades} (dont 3 ouverts)`)
  console.log(`  Journal      : ${totalJournal} entrées`)
  console.log(`  KPI snaps    : ${totalKpi} jours`)
  console.log(`  Alertes      : ${totalAlerts}`)
  console.log(`  Comptes      : LIVE + PROP_CHALLENGE + DEMO`)
  console.log(`  Balance      : ${INITIAL_BAL} → ${balance.toFixed(0)} €`)
  console.log('══════════════════════════════════════════\n')
}

main().catch(console.error).finally(() => prisma.$disconnect())
