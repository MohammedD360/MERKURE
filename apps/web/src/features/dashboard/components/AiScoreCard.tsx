'use client'

import { useAiScore } from '@/lib/hooks/use-kpis'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

const BREAKDOWN_LABELS: Record<string, { label: string; weight: string }> = {
  winRate:      { label: 'Win Rate',      weight: '25%' },
  profitFactor: { label: 'Profit Factor', weight: '20%' },
  drawdown:     { label: 'Drawdown',      weight: '20%' },
  rrMoyen:      { label: 'R/R moyen',     weight: '15%' },
  discipline:   { label: 'Discipline',    weight: '10%' },
  consistency:  { label: 'Régularité',    weight: '10%' },
}

function scoreColor(score: number) {
  if (score >= 85) return { ring: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 70) return { ring: '#6366f1', text: 'text-indigo-500',  bg: 'bg-indigo-50 border-indigo-200' }
  if (score >= 50) return { ring: '#f59e0b', text: 'text-amber-500',   bg: 'bg-amber-50 border-amber-200' }
  return              { ring: '#ef4444', text: 'text-red-500',      bg: 'bg-red-50 border-red-200' }
}

function barColor(val: number) {
  if (val >= 80) return 'bg-emerald-400'
  if (val >= 60) return 'bg-indigo-400'
  if (val >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

// Cercle SVG progress ring
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" className="rotate-[-90deg]">
      <circle cx="54" cy="54" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
      <circle
        cx="54" cy="54" r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

interface Props {
  period?: KpiPeriod
}

export function AiScoreCard({ period = '30d' }: Props) {
  const { data, isLoading } = useAiScore(period)
  const colors = scoreColor(data?.score ?? 0)

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Score IA</p>
        <div className="mt-4 flex animate-pulse flex-col items-center gap-3">
          <div className="h-[108px] w-[108px] rounded-full bg-[hsl(var(--accent))]" />
          <div className="h-4 w-24 rounded bg-[hsl(var(--accent))]" />
        </div>
      </section>
    )
  }

  if (!data || data.nbTrades === 0) {
    return (
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Score IA</p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Importez des trades pour obtenir votre score.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Score Global IA</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{data.nbTrades} trades analysés</p>
        </div>
        <span className={cn('rounded-md border px-2.5 py-1 text-[11px] font-bold', colors.bg, colors.text)}>
          {data.label}
        </span>
      </div>

      {/* Anneau + score */}
      <div className="relative flex items-center justify-center">
        <ScoreRing score={data.score} color={colors.ring} />
        <div className="absolute flex flex-col items-center">
          <span className={cn('text-3xl font-black tabular-nums', colors.text)}>{data.score}</span>
          <span className="text-[10px] font-bold text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2">
        {Object.entries(data.breakdown).map(([key, val]) => {
          const meta = BREAKDOWN_LABELS[key]
          if (!meta) return null
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-[88px] shrink-0 text-[10px] font-semibold text-muted-foreground">{meta.label}</span>
              <div className="min-w-0 flex-1 overflow-hidden rounded-full bg-[hsl(var(--accent))]" style={{ height: 5 }}>
                <div
                  className={cn('h-full rounded-full transition-all duration-500', barColor(val))}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="w-7 text-right text-[10px] font-bold tabular-nums text-muted-foreground">{val}</span>
              <span className="w-6 text-right text-[9px] text-muted-foreground/60">{meta.weight}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
