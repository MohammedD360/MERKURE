'use client'

import { AlertTriangle, CheckCircle2, Minus } from 'lucide-react'
import { useBehavioral } from '@/lib/hooks/use-kpis'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

const PATTERN_META: Record<string, { label: string; emoji: string }> = {
  REVENGE_TRADING:   { label: 'Revenge trading',    emoji: '🔁' },
  OVERTRADING:       { label: 'Overtrading',         emoji: '📈' },
  FOMO:              { label: 'FOMO',                emoji: '⚡' },
  DIRECTIONAL_BIAS:  { label: 'Biais directionnel',  emoji: '🧭' },
  FATIGUE:           { label: 'Fatigue',             emoji: '😮‍💨' },
  MORNING_RUSH:      { label: 'Morning rush',        emoji: '🌅' },
}

const SEV_STYLE: Record<string, string> = {
  HIGH:   'border-red-200   bg-red-50   text-red-600',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-600',
  LOW:    'border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground',
}

const SEV_LABEL: Record<string, string> = {
  HIGH:   'Élevé',
  MEDIUM: 'Modéré',
  LOW:    'Faible',
}

interface Props {
  period?: KpiPeriod
}

export function BehavioralCard({ period = '30d' }: Props) {
  const { data, isLoading } = useBehavioral(period)

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Comportements</p>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-[hsl(var(--accent))]" />
          ))}
        </div>
      </section>
    )
  }

  if (!data || data.nbTrades < 3) {
    return (
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Comportements</p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Importez au moins 3 trades pour activer la détection.
        </p>
      </section>
    )
  }

  const detected  = data.patterns.filter(p => p.detected)
  const clean     = data.patterns.filter(p => !p.detected)
  const highCount = detected.filter(p => p.severity === 'HIGH').length

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Comportements IA
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{data.nbTrades} trades analysés</p>
        </div>
        {highCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600">
            <AlertTriangle className="h-3 w-3" />
            {highCount} alerte{highCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Sain
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Patterns détectés en premier */}
        {detected.map(p => {
          const meta  = PATTERN_META[p.type]
          const style = SEV_STYLE[p.severity ?? 'LOW']
          return (
            <div
              key={p.type}
              className={cn('rounded-lg border px-3 py-2.5', style)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm leading-none">{meta?.emoji}</span>
                  <span className="text-xs font-bold truncate">{meta?.label}</span>
                </div>
                <span className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold',
                  p.severity === 'HIGH'   && 'bg-red-100 text-red-700',
                  p.severity === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                  p.severity === 'LOW'    && 'bg-gray-100 text-gray-600',
                )}>
                  {SEV_LABEL[p.severity ?? 'LOW']}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-4 opacity-80">{p.detail}</p>
              {p.impact && (
                <p className="mt-0.5 text-[10px] font-semibold leading-4 opacity-70">{p.impact}</p>
              )}
            </div>
          )
        })}

        {/* Patterns non détectés */}
        {clean.length > 0 && (
          <div className="mt-1 border-t border-[hsl(var(--border))] pt-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
              Aucun signal
            </p>
            <div className="flex flex-wrap gap-1.5">
              {clean.map(p => {
                const meta = PATTERN_META[p.type]
                return (
                  <span
                    key={p.type}
                    className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--accent))] px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                  >
                    <Minus className="h-2.5 w-2.5" />
                    {meta?.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
