'use client'

import Link from 'next/link'
import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Brain,
  CalendarDays,
  Check,
  Clock3,
  DollarSign,
  FileText,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useGenerateAiAnalysis, useLatestAiAnalysis } from '@/lib/hooks/use-ai-journal'

const modules: Array<{
  href: string
  icon: LucideIcon
  badge: string
  title: string
  description: string
  metric: string
  metricLabel: string
  tone: string
  badgeTone: string
}> = [
  {
    href:        '/app/ia/biais',
    icon:        Brain,
    badge:       'Exclusif',
    title:       'Biais comportementaux',
    description: 'Détecte revenge trading, overtrading et trades émotionnels sur vos 100 derniers trades.',
    metric:      '73%',
    metricLabel: 'de trades impactés après 17h',
    tone:        'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.25)]',
    badgeTone:   'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.25)]',
  },
  {
    href:        '/app/ia/rapport',
    icon:        FileText,
    badge:       'Hebdomadaire',
    title:       'Rapport narratif',
    description: 'Un rapport rédigé en français chaque lundi : causes des pertes et actions concrètes.',
    metric:      '62%',
    metricLabel: 'win rate chuté à 41% en session asiatique',
    tone:        'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] border-[hsl(var(--primary)/0.2)]',
    badgeTone:   'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] border-[hsl(var(--primary)/0.2)]',
  },
  {
    href:        '/app/ia/coach',
    icon:        Bell,
    badge:       'Temps réel',
    title:       'Coach de discipline',
    description: 'Alerte avant que vous aggraviez une série de pertes. Prévention, pas constat.',
    metric:      '3',
    metricLabel: 'pertes consécutives — pause recommandée',
    tone:        'text-amber-600 bg-amber-50 border-amber-200',
    badgeTone:   'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    href:        '/app/ia/simulation',
    icon:        ArrowLeftRight,
    badge:       'Simulation',
    title:       'What-if & scénarii',
    description: "Visualisez l'impact de vos règles. Ce type d'insight change le comportement.",
    metric:      '+84,7€',
    metricLabel: 'de plus si stop loss respecté',
    tone:        'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeTone:   'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
]

const summaryCards: Array<{
  icon: LucideIcon
  label: string
  value: number
  color: string
}> = [
  { icon: PieChart,     label: "Score global",      value: 78, color: "hsl(var(--primary))" },
  { icon: ShieldCheck,  label: "Discipline",        value: 82, color: "hsl(var(--primary))" },
  { icon: DollarSign,   label: 'Gestion du risque', value: 74, color: '#f97316' },
  { icon: TrendingUp,   label: 'Performance',       value: 71, color: '#f97316' },
  { icon: CalendarDays, label: "Régularité",        value: 80, color: "hsl(var(--primary))" },
]

function WaveLines() {
  return (
    <svg className="absolute inset-y-0 left-[18%] h-full w-[48%] text-violet-500/25" viewBox="0 0 680 260" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <path
          key={index}
          d={`M0 ${176 + index * 3} C120 ${120 - index * 2}, 180 ${230 - index * 4}, 310 ${124 - index * 2} C420 ${34 + index * 3}, 468 ${70 + index * 2}, 680 ${22 + index}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.18 + index * 0.018}
        />
      ))}
    </svg>
  )
}

function BrainVisual() {
  return (
    <div className="relative hidden min-h-[260px] items-center justify-center overflow-hidden border-l border-[hsl(var(--border))] lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(111,94,255,0.12),transparent_34%),linear-gradient(90deg,transparent,rgba(91,74,255,0.04))]" />
      <div className="absolute bottom-8 h-24 w-72 rounded-[50%] border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)] shadow-[0_0_80px_hsl(var(--primary)/0.15)]" />
      <div className="absolute bottom-14 h-16 w-52 rounded-[50%] border border-[hsl(var(--primary)/0.2)]" />
      <div className="absolute bottom-[72px] h-8 w-32 rounded-[50%] border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.05)]" />
      <div className="absolute bottom-[82px] h-4 w-20 rounded-[50%] bg-[hsl(var(--primary)/0.4)] blur-[2px]" />
      <Brain className="relative -mt-16 h-28 w-28 text-[hsl(var(--primary))] drop-shadow-[0_0_34px_hsl(var(--primary)/0.4)]" strokeWidth={1.5} />
      <div className="absolute left-1/2 top-8 h-40 w-px bg-gradient-to-b from-[hsl(var(--primary)/0.3)] to-transparent" />
      <div className="absolute right-[27%] top-11 h-36 w-px bg-gradient-to-b from-[hsl(var(--primary)/0.2)] to-transparent" />
      <div className="absolute bottom-12 left-1/2 h-3 w-3 rounded-full bg-[hsl(var(--primary)/0.6)] shadow-[0_0_24px_hsl(var(--primary)/0.5)]" />
    </div>
  )
}

function AiHero() {
  const { data: entry } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()
  const hasAnalysis = Boolean(entry)

  return (
    <section className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-background shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,hsl(var(--primary)/0.08),transparent_34%),radial-gradient(circle_at_78%_20%,hsl(var(--primary)/0.05),transparent_34%)]" />
      <WaveLines />

      <div className="relative grid min-h-[300px] lg:grid-cols-[1fr_0.72fr_0.9fr]">
        <div className="flex flex-col justify-center px-6 py-8 sm:px-8">
          <span className="inline-flex w-fit rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[hsl(var(--primary))]">
            Beta
          </span>
          <h2 className="mt-5 max-w-md text-2xl font-black leading-tight text-foreground sm:text-3xl">
            Analyse de performance IA
          </h2>
          <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-muted-foreground">
            Générez votre première analyse pour obtenir des insights personnalisés sur votre trading.
          </p>

          <button
            type="button"
            onClick={() => generate({})}
            disabled={isPending}
            className="mt-6 inline-flex w-fit items-center justify-center gap-3 rounded-lg bg-[hsl(var(--primary))] px-6 py-3 text-sm font-black text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.3)] transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
            {isPending ? "Analyse en cours..." : hasAnalysis ? "Actualiser l'analyse" : "Générer une analyse"}
          </button>

          <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Analyse complète en moins de 60 secondes
          </p>
        </div>

        <div className="flex items-center px-6 py-8 sm:px-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Ce que vous obtiendrez</p>
            <div className="mt-5 space-y-4">
              {[
                'Analyse de vos forces et faiblesses',
                'Détection des biais comportementaux',
                'Recommandations personnalisées',
                "Plan d'amélioration sur mesure",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <BrainVisual />
      </div>
    </section>
  )
}

function ModuleCard({ module }: { module: (typeof modules)[number] }) {
  const Icon = module.icon

  return (
    <Link
      href={module.href}
      className="group overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white shadow-sm transition-colors hover:border-[hsl(var(--primary)/0.3)]"
    >
      <div className="relative min-h-[142px] p-5">
        <div className="relative flex items-start gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border ${module.tone}`}>
            <Icon className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-black text-foreground">{module.title}</h3>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${module.badgeTone}`}>
                {module.badge}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{module.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className={`rounded-lg px-2.5 py-1 font-mono text-xl font-black ${module.tone}`}>
            {module.metric}
          </span>
          <span className="truncate text-sm font-semibold text-muted-foreground">{module.metricLabel}</span>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
      </div>
    </Link>
  )
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-24" aria-hidden="true">
      <path
        d="M2 28 C16 16 24 28 36 22 C48 16 56 25 68 17 C82 7 91 18 104 10 C111 6 116 2 118 5"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M2 36 C16 22 24 34 36 28 C48 22 56 31 68 23 C82 13 91 24 104 16 C111 12 116 8 118 11 L118 36 Z"
        fill={color}
        opacity="0.10"
      />
    </svg>
  )
}

function SummaryStrip() {
  const { data: entry } = useLatestAiAnalysis()
  const score = entry?.score ?? 78
  const cards = summaryCards.map((card, index) => index === 0 ? { ...card, value: score } : card)

  return (
    <section className="rounded-xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Votre résumé IA</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-4 border-[hsl(var(--border))] xl:border-r xl:last:border-r-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">{label}</p>
              <p className="mt-1 font-mono text-2xl font-black text-foreground">
                {value}<span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="ml-auto hidden 2xl:block">
              <Sparkline color={color} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function IaHubPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <AiHero />

      <section>
        <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">4 modules disponibles</p>
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {modules.map(module => (
            <ModuleCard key={module.href} module={module} />
          ))}
        </div>
      </section>

      <SummaryStrip />
    </div>
  )
}
