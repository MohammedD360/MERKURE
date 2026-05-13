// ─── KPIs principaux ────────────────────────────────────────────
export const mockKpis = {
  balanceTotal: 125_430.50,
  balanceDeltaPct: 12.45,
  balanceDeltaAbs: 1_382.50,
  performance: 12.45,
  performanceDeltaAbs: 1_382.50,
  drawdownMax: -6.21,
  drawdownDeltaAbs: -1_215.00,
  sharpe: 1.72,
  sharpeLabel: 'Excellent',
  winRate: 68.4,
  winCount: 233,
  totalTrades: 341,
  profitFactor: 2.14,
  profitFactorLabel: 'Très bon',
}

// ─── Sparklines (mini courbes KPI cards) ─────────────────────────
export const sparkBalance = [
  { v: 110000 }, { v: 112000 }, { v: 109000 }, { v: 115000 },
  { v: 114000 }, { v: 118000 }, { v: 120000 }, { v: 122000 },
  { v: 121000 }, { v: 125430 },
]
export const sparkPerf = [
  { v: 0 }, { v: 2 }, { v: 1 }, { v: 4 }, { v: 3 },
  { v: 6 }, { v: 8 }, { v: 9 }, { v: 11 }, { v: 12.45 },
]
export const sparkDrawdown = [
  { v: -2 }, { v: -3 }, { v: -5 }, { v: -4 }, { v: -6 },
  { v: -5 }, { v: -7 }, { v: -6.21 }, { v: -5 }, { v: -6.21 },
]
export const sparkPF = [
  { v: 1.5 }, { v: 1.7 }, { v: 1.6 }, { v: 1.9 }, { v: 2.0 },
  { v: 1.8 }, { v: 2.1 }, { v: 2.0 }, { v: 2.2 }, { v: 2.14 },
]

// ─── Courbe de performance ────────────────────────────────────────
export const mockEquityCurve = [
  { date: '01 Mai', pct: 0 },
  { date: '03 Mai', pct: 1.2 },
  { date: '05 Mai', pct: -0.8 },
  { date: '06 Mai', pct: 2.1 },
  { date: '08 Mai', pct: 1.5 },
  { date: '10 Mai', pct: 3.4 },
  { date: '11 Mai', pct: 2.8 },
  { date: '13 Mai', pct: 4.2 },
  { date: '15 Mai', pct: 3.9 },
  { date: '16 Mai', pct: 5.6 },
  { date: '18 Mai', pct: 4.8 },
  { date: '20 Mai', pct: 6.3 },
  { date: '21 Mai', pct: 8.75 },
  { date: '22 Mai', pct: 7.9 },
  { date: '24 Mai', pct: 9.2 },
  { date: '25 Mai', pct: 8.6 },
  { date: '27 Mai', pct: 10.4 },
  { date: '28 Mai', pct: 11.1 },
  { date: '29 Mai', pct: 10.8 },
  { date: '31 Mai', pct: 12.45 },
]

// ─── Répartition des actifs ───────────────────────────────────────
export const mockAssets = [
  { label: 'Forex',            pct: 40.2, color: '#06b6d4' },
  { label: 'Actions',          pct: 28.5, color: '#8b5cf6' },
  { label: 'Crypto',           pct: 15.3, color: '#f97316' },
  { label: 'Indices',          pct: 10.8, color: '#22c55e' },
  { label: 'Matières premières', pct: 5.2, color: '#ec4899' },
]

// ─── Statistiques clés ────────────────────────────────────────────
export const mockStats = {
  totalTrades: 341,
  winTrades: 233,
  lossTrades: 108,
  bestTrade: 2450,
  worstTrade: -1050,
  avgWin: 405.72,
  avgLoss: -265.34,
  avgDuration: '2j 4h 32m',
}

// ─── Performance par stratégie ────────────────────────────────────
export const mockStrategies = [
  { name: 'Breakout Strategy',  pct: 18.45, positive: true },
  { name: 'Trend Following',    pct: 12.31, positive: true },
  { name: 'Scalping M15',       pct: 8.72,  positive: true },
  { name: 'Mean Reversion',     pct: -2.14, positive: false },
  { name: 'News Trading',       pct: -4.32, positive: false },
]

// ─── Calendrier économique ────────────────────────────────────────
export const mockCalendar = [
  { time: '14:30', currency: 'USD', event: 'NFP (Non-Farm Payrolls)',  impact: 'Élevé' },
  { time: '14:30', currency: 'USD', event: 'Taux de chômage',          impact: 'Élevé' },
  { time: '16:00', currency: 'USD', event: 'ISM Manufacturing PMI',    impact: 'Moyen' },
  { time: '10:00', currency: 'EUR', event: 'CPI (YoY)',                impact: 'Élevé' },
  { time: '10:00', currency: 'EUR', event: 'Taux de chômage',          impact: 'Moyen' },
]

// ─── Assistant IA — Recommandations ──────────────────────────────
export const mockRecommendations = [
  {
    icon: 'shield',
    title: 'Gestion du risque',
    body: 'Votre drawdown max dépasse votre objectif. Suggestion : Réduire le risque par trade à 1%.',
  },
  {
    icon: 'pie',
    title: 'Diversification',
    body: "Votre exposition au Forex est élevée (40%). Suggestion : Diversifier vers les indices.",
  },
  {
    icon: 'clock',
    title: 'Timing',
    body: 'Vos performances sont meilleures entre 09:00 et 12:00. Suggestion : Concentrer vos sessions.',
  },
]

// ─── Matching IA — Stratégies ─────────────────────────────────────
export const mockMatchingStrategies = [
  { name: 'Smart Breakout Pro',  compatibility: 92, perf3m: 15.8, positive: true },
  { name: 'Trend Catcher AI',    compatibility: 87, perf3m: 11.3, positive: true },
  { name: 'Range Scalper',       compatibility: 78, perf3m: 9.6,  positive: true },
]

// ─── Score IA ─────────────────────────────────────────────────────
export const mockAiScore = {
  score: 78,
  label: 'Bon travail !',
  sub: 'Vous êtes dans le top 23% des traders similaires.',
  strengths: [
    'Excellente discipline sur la gestion des positions',
    'Bon ratio risque/rendement (1:2,14)',
    'Performance solide sur les 30 derniers jours',
  ],
  improvements: [
    'Réduire le drawdown maximum',
    'Améliorer les performances en news trading',
    'Diversifier davantage les classes d\'actifs',
  ],
}
