'use client'

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Clock3,
  Info,
  Loader2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useAiJournal, useGenerateAiAnalysis, useLatestAiAnalysis } from '@/lib/hooks/use-ai-journal'

const biasCards: Array<{
  icon: LucideIcon
  title: string
  description: string
  label: string
  tone: string
  chartColor: string
  points: string
}> = [
  {
    icon:        Clock3,
    title:       'Revenge trading',
    description: 'Trades passés immédiatement après une perte pour "récupérer".',
    label:       'Risque élevé',
    tone:        'border-violet-400/20 bg-violet-400/[0.08] text-violet-300',
    chartColor:  '#a855f7',
    points:      '5,42 18,35 31,23 42,25 49,10 58,18 68,12 77,30 90,17 103,28 116,18',
  },
  {
    icon:        TrendingDown,
    title:       'Overtrading',
    description: 'Nombre de trades anormalement élevé en une session.',
    label:       'Surveillance',
    tone:        'border-rose-400/20 bg-rose-400/[0.08] text-rose-300',
    chartColor:  '#fb7185',
    points:      '5,42 17,37 29,28 40,33 53,17 65,31 77,25 89,34 100,10 112,24 122,18',
  },
  {
    icon:        AlertTriangle,
    title:       'Trade émotionnel',
    description: 'Entrées hors setup identifiées après une série de pertes.',
    label:       'Attention',
    tone:        'border-amber-400/20 bg-amber-400/[0.08] text-amber-300',
    chartColor:  '#f59e0b',
    points:      '5,40 16,24 28,34 39,22 50,31 62,17 75,28 87,24 99,31 111,21 122,9',
  },
]

const educationCards: Array<{
  icon: LucideIcon
  title: string
  text: string
  tone: string
}> = [
  {
    icon:  Brain,
    title: "Qu'est-ce qu'un biais ?",
    text:   'Un biais est un schéma de pensée qui influence vos décisions de trading, souvent de manière inconsciente et contre-productive.',
    tone:  'border-violet-400/20 bg-violet-400/[0.08] text-violet-300',
  },
  {
    icon:  Target,
    title: 'Pourquoi les détecter ?',
    text:   'Identifier vos biais permet de mieux comprendre vos erreurs récurrentes et d’améliorer votre discipline sur le long terme.',
    tone:  'border-blue-400/20 bg-blue-400/[0.08] text-blue-300',
  },
  {
    icon:  TrendingUp,
    title: 'Comment les corriger ?',
    text:   'Avec de la prise de conscience, des règles claires et un plan d’action adapté à votre profil de trader.',
    tone:  'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300',
  },
]

function MiniChart({ color, points }: { color: string; points: string }) {
  return (
    <svg viewBox="0 0 128 52" className="h-16 w-32 shrink-0" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.split(' ').map((point) => {
        const [x, y] = point.split(',')
        return <circle key={point} cx={x} cy={y} r="2.5" fill={color} />
      })}
    </svg>
  )
}

function BiasCard({
  icon: Icon,
  title,
  description,
  label,
  tone,
  chartColor,
  points,
}: (typeof biasCards)[number]) {
  return (
    <article className={`overflow-hidden rounded-xl border bg-background p-5 shadow-[0_12px_46px_rgba(0,0,0,0.22)] ${tone}`}>
      <div className="flex min-h-[132px] items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 shrink-0" strokeWidth={1.9} />
            <h2 className="text-base font-black text-white">{title}</h2>
          </div>
          <p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-slate-400">{description}</p>
          <span className={`mt-5 inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${tone}`}>
            {label}
          </span>
        </div>
        <MiniChart color={chartColor} points={points} />
      </div>
    </article>
  )
}

function EmptyAnalysis({
  onGenerate,
  isPending,
}: {
  onGenerate: () => void
  isPending: boolean
}) {
  return (
    <div className="flex min-h-[312px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-violet-400/15" />
        <div className="absolute inset-3 rounded-full border border-violet-400/15" />
        <div className="absolute inset-6 rounded-full border border-violet-400/20 bg-violet-400/[0.08]" />
        <Sparkles className="relative h-8 w-8 text-violet-400" />
      </div>
      <h3 className="mt-6 text-base font-black text-white">Aucune analyse disponible pour le moment</h3>
      <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-400">
        Générez une analyse depuis le dashboard pour voir vos biais détectés et obtenir des recommandations personnalisées.
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isPending}
        className="mt-7 inline-flex items-center justify-center gap-3 rounded-lg bg-violet-600 px-6 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(124,92,255,0.24)] transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        {isPending ? 'Analyse en cours...' : 'Générer une analyse'}
      </button>
      <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Clock3 className="h-4 w-4" />
        Analyse complète en moins de 60 secondes
      </p>
    </div>
  )
}

export function IaBiaisPage() {
  const { data: latest, isLoading } = useLatestAiAnalysis()
  const { data: entries } = useAiJournal()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()

  const improvements = latest?.insights?.improvements ?? []
  const hasEntries = Boolean(entries?.length)
  const generateBiasAnalysis = () => {
    generate({ context: 'Détection des biais comportementaux : revenge trading, overtrading, trades émotionnels.' })
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-5 xl:grid-cols-3">
        {biasCards.map((card) => (
          <BiasCard key={card.title} {...card} />
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-[0_12px_48px_rgba(0,0,0,0.20)]">
        <div className="flex items-center gap-2 px-6 py-5">
          <h2 className="text-base font-black text-white">Points d&apos;amélioration détectés</h2>
          <Info className="h-4 w-4 text-slate-600" />
          {isLoading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-600" />}
        </div>

        {isLoading ? (
          <div className="space-y-3 px-6 pb-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        ) : improvements.length > 0 ? (
          <div className="grid gap-3 px-6 pb-6 lg:grid-cols-2">
            {improvements.map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-[#071017] p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/[0.10] text-[11px] font-black text-violet-300">
                  {index + 1}
                </span>
                <p className="text-sm font-medium leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyAnalysis onGenerate={generateBiasAnalysis} isPending={isPending} />
        )}

        {!isLoading && hasEntries && improvements.length === 0 && (
          <div className="border-t border-white/[0.06] px-6 py-4">
            <p className="text-xs font-semibold text-slate-500">
              Dernière analyse disponible, mais aucun biais majeur n’a été identifié dans les recommandations.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-background p-6 shadow-[0_12px_48px_rgba(0,0,0,0.18)]">
        <h2 className="text-base font-black text-white">Comprendre les biais</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {educationCards.map(({ icon: Icon, title, text, tone }) => (
            <article key={title} className="rounded-xl border border-white/10 bg-[#101827]/60 p-5">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{title}</h3>
                  <p className="mt-3 text-xs font-medium leading-6 text-slate-400">{text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-background px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-black text-white">Conseil IA</span>
        </div>
        <p className="text-sm font-medium leading-6 text-slate-400 sm:border-l sm:border-white/[0.06] sm:pl-5">
          La clé n’est pas d’éviter les erreurs, mais d’apprendre à les reconnaître et à ne plus les répéter.
        </p>
        <button className="inline-flex items-center gap-2 text-sm font-black text-violet-300 sm:ml-auto">
          En savoir plus
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
