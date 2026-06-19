'use client'

import {
  ArrowRight,
  BarChart3,
  Bolt,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  LineChart,
  MoreVertical,
  Route,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const quickStarts: Array<{
  icon: LucideIcon
  title: string
  text: string
  tone: string
}> = [
  {
    icon:  BarChart3,
    title: 'Backtest stratégie',
    text:   'Testez une stratégie sur des données historiques.',
    tone:  'border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
  {
    icon:  Route,
    title: 'Scénario personnalisé',
    text:   'Créez un scénario manuel pour simuler vos décisions.',
    tone:  'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
  {
    icon:  SlidersHorizontal,
    title: 'Simulation Monte Carlo',
    text:   'Analysez la robustesse de votre stratégie avec des variations.',
    tone:  'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  {
    icon:  FileText,
    title: 'Comparaison de règles',
    text:   'Comparez plusieurs règles ou stratégies entre elles.',
    tone:  'border-amber-200 bg-amber-50 text-amber-600',
  },
]

const overviewStats: Array<{
  icon: LucideIcon
  label: string
  value: string
  helper: string
  tone: string
}> = [
  {
    icon:   Briefcase,
    label:  'Simulations totales',
    value:  '24',
    helper: '+20% vs mois dernier',
    tone:   'border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
  {
    icon:   CheckCircle2,
    label:  'Simulations gagnantes',
    value:  '15',
    helper: '62,5% de win rate',
    tone:   'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
  },
  {
    icon:   TrendingUp,
    label:  'Gain moyen / simulation',
    value:  '+1,38R',
    helper: '+0,42R vs mois dernier',
    tone:   'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
  {
    icon:   TrendingDown,
    label:  'Perte moyenne / simulation',
    value:  '-0,86R',
    helper: '-0,12R vs mois dernier',
    tone:   'border-red-200 bg-red-50 text-red-500',
  },
  {
    icon:   Clock3,
    label:  'Temps moyen / simulation',
    value:  '12 min',
    helper: '-3 min vs mois dernier',
    tone:   'border-amber-200 bg-amber-50 text-amber-600',
  },
]

const recentScenarios = [
  {
    name:        'Breakout tendance H1',
    type:        'Backtest',
    typeTone:    'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    asset:       'EUR/USD',
    period:      '01/01/2023 – 31/12/2023',
    result:      'Gagnant',
    resultTone:  'bg-emerald-50 text-emerald-600',
    performance: '+2,31R',
    perfTone:    'text-emerald-600',
    date:        '18 mai 2024',
    trend:       'up',
  },
  {
    name:        'Scalping London Session',
    type:        'Scénario',
    typeTone:    'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
    asset:       'XAU/USD',
    period:      '15/04/2024 – 15/05/2024',
    result:      'Gagnant',
    resultTone:  'bg-emerald-50 text-emerald-600',
    performance: '+1,07R',
    perfTone:    'text-emerald-600',
    date:        '17 mai 2024',
    trend:       'up',
  },
  {
    name:        'Mean Reversion M15',
    type:        'Backtest',
    typeTone:    'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    asset:       'GBP/USD',
    period:      '01/03/2023 – 30/04/2024',
    result:      'Perdant',
    resultTone:  'bg-red-50 text-red-500',
    performance: '-0,74R',
    perfTone:    'text-red-500',
    date:        '16 mai 2024',
    trend:       'down',
  },
  {
    name:        'Plan de trading mensuel',
    type:        'Scénario',
    typeTone:    'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
    asset:       'USD/JPY',
    period:      '01/05/2024 – 31/05/2024',
    result:      'En cours',
    resultTone:  'bg-[hsl(var(--accent))] text-muted-foreground',
    performance: '+0,23R',
    perfTone:    'text-emerald-600',
    date:        '15 mai 2024',
    trend:       'up',
  },
]

const heroFeatures: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Données historiques', icon: Briefcase },
  { label: 'Scénarios personnalisés', icon: Bolt },
  { label: 'Analyse détaillée', icon: LineChart },
  { label: 'Aucun risque', icon: ShieldCheck },
]

function HeroVisual() {
  return (
    <div className="relative hidden min-h-[230px] overflow-hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_55%,hsl(var(--primary)/0.12),transparent_32%),radial-gradient(circle_at_38%_75%,hsl(var(--primary)/0.06),transparent_30%)]" />
      <div className="absolute bottom-8 right-12 h-28 w-44 rotate-3 rounded-xl border border-[hsl(var(--border))] bg-white shadow-sm">
        <div className="flex gap-1 border-b border-[hsl(var(--border))] px-3 py-2">
          {[0, 1, 2].map(item => <span key={item} className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />)}
        </div>
        <svg viewBox="0 0 180 100" className="h-[92px] w-full px-3" aria-hidden="true">
          <path d="M4 70 C20 42 28 68 42 36 C58 76 70 55 84 28 C99 62 111 52 124 73 C138 35 150 55 172 22" fill="none" stroke="hsl(244 42% 51%)" strokeWidth="3" strokeLinecap="round" />
          <path d="M4 82 C22 62 32 73 44 64 C60 51 72 84 86 68 C104 45 116 66 130 48 C146 28 158 60 174 40" fill="none" stroke="hsl(244 42% 65%)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-2 flex h-24 w-24 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.08)] shadow-[0_0_52px_hsl(244_42%_51%/0.2)]">
        <div className="flex h-16 w-16 rotate-[-18deg] items-center justify-center rounded-full border border-[hsl(var(--primary)/0.3)] bg-white">
          <Route className="h-8 w-8 text-[hsl(var(--primary))]" />
        </div>
      </div>
      <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />
    </div>
  )
}

function QuickStartCard({ icon: Icon, title, text, tone }: (typeof quickStarts)[number]) {
  return (
    <button className={`group flex min-h-[140px] items-start gap-4 rounded-xl border bg-white p-5 text-left transition-colors hover:border-[hsl(var(--primary)/0.3)] ${tone}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-black text-foreground">{title}</h3>
        <p className="mt-4 text-xs font-medium leading-6 text-muted-foreground">{text}</p>
      </div>
      <ArrowRight className="mt-auto h-4 w-4 shrink-0 text-current transition-transform group-hover:translate-x-1" />
    </button>
  )
}

function Sparkline({ trend }: { trend: string }) {
  const color = trend === 'down' ? '#ef4444' : '#16a34a'
  const path = trend === 'down'
    ? 'M2 10 C16 18 22 26 34 20 C46 14 55 32 66 30 C78 28 88 42 102 35 C113 30 120 44 126 42'
    : 'M2 34 C15 26 24 30 35 22 C47 13 55 28 68 20 C80 12 88 7 100 14 C112 19 118 9 126 4'

  return (
    <svg viewBox="0 0 128 48" className="h-10 w-24" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`${path} L126 48 L2 48 Z`} fill={color} opacity="0.10" />
    </svg>
  )
}

export function IaSimulationPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white shadow-sm">
        <div className="relative grid lg:grid-cols-[1fr_0.92fr]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,hsl(var(--primary)/0.08),transparent_28%),radial-gradient(circle_at_82%_45%,hsl(var(--primary)/0.05),transparent_32%)]" />
          <div className="relative flex items-center gap-7 px-7 py-8">
            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] shadow-[0_0_42px_hsl(244_42%_51%/0.2)] sm:flex">
              <Zap className="h-11 w-11 text-[hsl(var(--primary))]" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Testez. Analysez. Progressez.</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                Simulez vos stratégies de trading sur des données historiques ou créez des scénarios personnalisés pour anticiper vos décisions.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-muted-foreground">
                {heroFeatures.map(({ label, icon: Icon }) => (
                  <span key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                    {label}
                  </span>
                ))}
              </div>
              <button className="mt-7 rounded-lg bg-[hsl(var(--primary))] px-6 py-3 text-sm font-black text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.3)] transition-colors hover:bg-[hsl(244_42%_44%)]">
                Créer une nouvelle simulation
              </button>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section>
        <h2 className="text-base font-black text-foreground">Démarrer rapidement</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {quickStarts.map(item => (
            <QuickStartCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[hsl(var(--border))] bg-white p-4 shadow-sm">
        <h2 className="px-1 text-base font-black text-foreground">Aperçu de vos simulations</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {overviewStats.map(({ icon: Icon, label, value, helper, tone }) => (
            <article key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))] p-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium leading-5 text-muted-foreground">{label}</p>
                  <p className="mt-2 font-mono text-3xl font-black text-foreground">{value}</p>
                  <p className={`mt-2 text-xs font-black ${helper.startsWith('-0') ? 'text-red-500' : 'text-emerald-600'}`}>
                    {helper}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] px-5 py-4">
          <h2 className="text-base font-black text-foreground">Mes scénarios récents</h2>
          <button className="rounded-lg border border-[hsl(var(--primary)/0.2)] px-4 py-2 text-xs font-black text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.08)]">
            Voir toutes les simulations
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-[hsl(var(--accent))] text-xs font-black text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Nom du scénario</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Actif</th>
                <th className="px-5 py-4">Période</th>
                <th className="px-5 py-4">Résultat</th>
                <th className="px-5 py-4">Performance</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {recentScenarios.map((scenario) => (
                <tr key={scenario.name} className="text-sm font-semibold text-muted-foreground">
                  <td className="px-5 py-4 font-black text-foreground">{scenario.name}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-black ${scenario.typeTone}`}>{scenario.type}</span>
                  </td>
                  <td className="px-5 py-4">{scenario.asset}</td>
                  <td className="px-5 py-4">{scenario.period}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-black ${scenario.resultTone}`}>{scenario.result}</span>
                  </td>
                  <td className={`px-5 py-4 font-mono text-base font-black ${scenario.perfTone}`}>
                    <div className="flex items-center gap-4">
                      {scenario.performance}
                      <Sparkline trend={scenario.trend} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{scenario.date}</td>
                  <td className="px-5 py-4 text-right">
                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-white px-5 py-4 text-sm font-semibold text-muted-foreground">
        <Settings2 className="h-5 w-5 text-[hsl(var(--primary))]" />
        Les simulations utilisent vos trades importés et vos règles de risque. Les résultats restent des scénarios, pas des promesses de performance.
      </div>
    </div>
  )
}
