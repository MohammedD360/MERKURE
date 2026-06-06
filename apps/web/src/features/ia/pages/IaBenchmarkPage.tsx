'use client'

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  LineChart,
  Medal,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

const benchmarkStats: Array<{
  icon: LucideIcon
  label: string
  value: string
  helper: string
  tone: string
}> = [
  {
    icon:   Medal,
    label:  'Classement discipline',
    value:  'Top 15%',
    helper: 'Risque mieux contrôlé que la moyenne',
    tone:   'border-violet-400/20 bg-violet-400/[0.08] text-violet-300',
  },
  {
    icon:   ShieldCheck,
    label:  'Gestion du risque',
    value:  '82/100',
    helper: 'Cadre respecté sur les dernières sessions',
    tone:   'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
  },
  {
    icon:   TrendingUp,
    label:  'Progression relative',
    value:  '+18%',
    helper: 'Amélioration vs cohorte similaire',
    tone:   'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
  },
]

const cohortRows = [
  { label: 'Votre profil', winRate: '58%', drawdown: '-4,8%', risk: '0,9R', consistency: '82', highlight: true },
  { label: 'Médiane cohorte', winRate: '51%', drawdown: '-7,2%', risk: '1,3R', consistency: '64', highlight: false },
  { label: 'Top quartile', winRate: '62%', drawdown: '-3,9%', risk: '0,8R', consistency: '88', highlight: false },
]

const benchmarkSignals = [
  {
    title: 'Ce qui vous distingue',
    text: 'Votre drawdown reste plus bas que la cohorte sur les périodes de forte volatilité.',
    icon: ShieldCheck,
    tone: 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
  },
  {
    title: 'Point à améliorer',
    text: 'Votre performance relative baisse lorsque le nombre de trades dépasse votre moyenne hebdomadaire.',
    icon: Gauge,
    tone: 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
  },
  {
    title: 'Objectif recommandé',
    text: 'Maintenir votre risque moyen sous 1R pendant quatre semaines pour viser le top 10%.',
    icon: Target,
    tone: 'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
  },
]

function PercentileVisual() {
  return (
    <div className="relative hidden min-h-[250px] overflow-hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_38%,rgba(124,92,255,0.28),transparent_30%),radial-gradient(circle_at_38%_78%,rgba(37,99,235,0.18),transparent_28%)]" />
      <div className="absolute right-8 top-8 w-[340px] rounded-xl border border-white/10 bg-[#10182f]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Votre classement</p>
            <p className="mt-2 text-3xl font-black text-white">78%</p>
          </div>
          <Medal className="h-8 w-8 text-violet-300" />
        </div>
        <div className="mt-5 space-y-4">
          {[
            { label: 'Vous', value: '78%', width: '78%', color: 'bg-violet-400' },
            { label: 'Médiane', value: '54%', width: '54%', color: 'bg-slate-500' },
            { label: 'Niveau 1', value: '38%', width: '38%', color: 'bg-slate-700' },
          ].map(({ label, value, width, color }) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-xs font-bold text-muted-foreground">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div className={`h-full rounded-full ${color}`} style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 right-20 h-px w-[440px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
    </div>
  )
}

function MiniTrend() {
  return (
    <svg viewBox="0 0 128 42" className="h-10 w-24" aria-hidden="true">
      <path
        d="M2 30 C16 18 24 24 36 15 C48 5 58 24 70 16 C84 7 90 11 102 20 C114 29 120 17 126 10"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M2 30 C16 18 24 24 36 15 C48 5 58 24 70 16 C84 7 90 11 102 20 C114 29 120 17 126 10 L126 42 L2 42 Z"
        fill="#22c55e"
        opacity="0.10"
      />
    </svg>
  )
}

export function IaBenchmarkPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_12px_52px_rgba(0,0,0,0.22)]">
        <div className="relative grid lg:grid-cols-[1fr_0.9fr]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(124,92,255,0.20),transparent_30%),radial-gradient(circle_at_82%_42%,rgba(37,99,235,0.16),transparent_32%)]" />
          <div className="relative px-7 py-8">
            <span className="rounded-md border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300">
              Benchmark anonymisé
            </span>
            <h1 className="mt-5 max-w-2xl text-3xl font-black text-white">
              Comparez votre discipline à des profils similaires.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
              MERKURE situe vos performances face à une cohorte anonymisée : risque moyen, régularité, drawdown et qualité d'exécution.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-muted-foreground">
              {[
                { icon: Users, label: 'Cohortes anonymisées' },
                { icon: BarChart3, label: 'Percentile de progression' },
                { icon: ShieldCheck, label: 'Données privées' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-violet-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <PercentileVisual />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {benchmarkStats.map(({ icon: Icon, label, value, helper, tone }) => (
          <article key={label} className="rounded-xl border border-white/10 bg-background p-5 shadow-[0_12px_46px_rgba(0,0,0,0.18)]">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{helper}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_12px_52px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-white">Comparaison de cohorte</h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Lecture illustrative basée sur votre profil de risque.</p>
          </div>
          <LineChart className="h-5 w-5 text-violet-300" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-white/[0.025] text-xs font-black text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Profil</th>
                <th className="px-5 py-4">Win rate</th>
                <th className="px-5 py-4">Drawdown</th>
                <th className="px-5 py-4">Risque moyen</th>
                <th className="px-5 py-4">Régularité</th>
                <th className="px-5 py-4">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {cohortRows.map(row => (
                <tr key={row.label} className={row.highlight ? 'bg-violet-400/[0.04]' : undefined}>
                  <td className="px-5 py-4 text-sm font-black text-white">{row.label}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-muted-foreground">{row.winRate}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-rose-300">{row.drawdown}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-muted-foreground">{row.risk}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-emerald-300">{row.consistency}/100</td>
                  <td className="px-5 py-4"><MiniTrend /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {benchmarkSignals.map(({ title, text, icon: Icon, tone }) => (
          <article key={title} className="rounded-xl border border-white/10 bg-background p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-sm font-black text-white">{title}</h3>
            <p className="mt-3 text-xs font-medium leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background px-5 py-4 text-sm font-semibold text-muted-foreground sm:flex-row sm:items-center">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#56bf6b]" />
        Les benchmarks sont anonymisés et servent à piloter votre progression. Ils ne constituent pas une promesse de résultat.
        <button className="inline-flex items-center gap-2 text-xs font-black text-violet-300 sm:ml-auto">
          Voir la méthode <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
