'use client'

import { useAiScore } from '@/lib/hooks/use-kpis'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

const BREAKDOWN_LABELS: Record<string, { label: string; weight: number }> = {
  winRate:      { label: 'Win Rate',      weight: 25 },
  profitFactor: { label: 'Profit Factor', weight: 20 },
  drawdown:     { label: 'Drawdown',      weight: 20 },
  rrMoyen:      { label: 'R/R moyen',     weight: 15 },
  discipline:   { label: 'Discipline',    weight: 10 },
  consistency:  { label: 'Régularité',    weight: 10 },
}

/**
 * Trois paliers sémantiques, alignés sur le reste du dashboard :
 * vert = bon, ambre = à surveiller, rouge = insuffisant.
 * Pas de quatrième teinte décorative — la couleur ne sert qu'à porter du sens.
 */
function tier(value: number): { stroke: string; text: string; pill: string } {
  if (value >= 70) {
    return { stroke: '#22c55e', text: 'text-green-500', pill: 'border-green-500/30 bg-green-500/10 text-green-500' }
  }
  if (value >= 45) {
    return { stroke: '#f59e0b', text: 'text-amber-500', pill: 'border-amber-500/30 bg-amber-500/10 text-amber-500' }
  }
  return { stroke: '#ef4444', text: 'text-red-500', pill: 'border-red-500/30 bg-red-500/10 text-red-500' }
}

/** Anneau de progression — piste sur le token `secondary`, pas un gris figé. */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.max(0, Math.min(score, 100)) / 100) * circ

  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90" aria-hidden="true">
      <circle cx="56" cy="56" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
      <circle
        cx="56" cy="56" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

function CardFrame({ children, bare }: { children: React.ReactNode; bare?: boolean }) {
  if (bare) return <div>{children}</div>
  return <section className="rounded-lg border border-border bg-card p-6">{children}</section>
}

function CardTitle({ subtitle }: { subtitle?: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Score IA</h3>
      <p className="text-sm text-muted-foreground">{subtitle ?? 'Note globale de votre trading'}</p>
    </div>
  )
}

interface Props {
  period?: KpiPeriod
  /** Rendu sans cadre ni titre : la carte à onglets les fournit. */
  bare?: boolean
}

export function AiScoreCard({ period = '30d', bare = false }: Props) {
  const { data, isLoading } = useAiScore(period)

  if (isLoading) {
    return (
      <CardFrame bare={bare}>
        {!bare && <CardTitle />}
        <div className="mt-6 flex animate-pulse flex-col items-center gap-4">
          <div className="h-28 w-28 rounded-full bg-secondary" />
          <div className="h-4 w-32 rounded bg-secondary" />
        </div>
      </CardFrame>
    )
  }

  if (!data || data.nbTrades === 0) {
    return (
      <CardFrame bare={bare}>
        {!bare && <CardTitle />}
        <p className="mt-6 text-sm text-muted-foreground">
          Importez des trades pour obtenir votre score.
        </p>
      </CardFrame>
    )
  }

  const t = tier(data.score)

  return (
    <CardFrame bare={bare}>
      <div className={cn('mb-6 flex items-start gap-3', bare ? 'justify-end' : 'justify-between')}>
        {!bare && <CardTitle subtitle={`${data.nbTrades} trades analysés`} />}
        <span className={cn('shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium', t.pill)}>
          {data.label}
        </span>
      </div>

      {/* Anneau + score */}
      <div className="relative flex items-center justify-center py-2">
        <ScoreRing score={data.score} color={t.stroke} />
        <div className="absolute flex flex-col items-center">
          <span className={cn('text-3xl font-bold tabular-nums leading-none', t.text)}>{data.score}</span>
          <span className="mt-1 text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Détail par critère — une seule couleur d'accent pour les barres,
          la valeur porte la lecture bon / à surveiller / insuffisant. */}
      <div className="mt-6 space-y-3">
        {Object.entries(data.breakdown).map(([key, val]) => {
          const meta = BREAKDOWN_LABELS[key]
          if (!meta) return null
          const vt = tier(val)
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-sm text-muted-foreground">{meta.label}</span>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${Math.max(0, Math.min(val, 100))}%` }}
                />
              </div>
              <span className={cn('w-8 shrink-0 text-right text-sm font-medium tabular-nums', vt.text)}>{val}</span>
              <span
                className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground"
                title={`Pondération dans le score global : ${meta.weight} %`}
              >
                {meta.weight} %
              </span>
            </div>
          )
        })}
      </div>
    </CardFrame>
  )
}
