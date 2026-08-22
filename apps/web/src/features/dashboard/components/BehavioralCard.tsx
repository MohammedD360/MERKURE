'use client'

import {
  AlertTriangle, BatteryLow, CheckCircle2, Compass, Gauge, Repeat, Sunrise, Zap,
  type LucideIcon,
} from 'lucide-react'
import { useBehavioral } from '@/lib/hooks/use-kpis'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

/** Icônes lucide monochromes — cohérentes avec le reste de l'app (plus d'emojis). */
const PATTERN_META: Record<string, { label: string; icon: LucideIcon }> = {
  REVENGE_TRADING:  { label: 'Revenge trading',   icon: Repeat },
  OVERTRADING:      { label: 'Overtrading',        icon: Gauge },
  FOMO:             { label: 'FOMO',               icon: Zap },
  DIRECTIONAL_BIAS: { label: 'Biais directionnel', icon: Compass },
  FATIGUE:          { label: 'Fatigue',            icon: BatteryLow },
  MORNING_RUSH:     { label: 'Morning rush',       icon: Sunrise },
}

const SEVERITY: Record<string, { label: string; icon: string; pill: string }> = {
  HIGH:   { label: 'Élevé',  icon: 'text-red-500',   pill: 'border-red-500/30 bg-red-500/10 text-red-500' },
  MEDIUM: { label: 'Modéré', icon: 'text-amber-500', pill: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  LOW:    { label: 'Faible', icon: 'text-muted-foreground', pill: 'border-border bg-secondary text-muted-foreground' },
}

interface Props {
  period?: KpiPeriod
  /** Rendu sans cadre ni titre : la carte à onglets les fournit. */
  bare?: boolean
}

function CardFrame({ children, bare }: { children: React.ReactNode; bare?: boolean }) {
  if (bare) return <div>{children}</div>
  return <section className="rounded-lg border border-border bg-card p-6">{children}</section>
}

function CardTitle({ subtitle }: { subtitle?: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Comportements IA</h3>
      <p className="text-sm text-muted-foreground">{subtitle ?? 'Biais détectés sur vos dernières sessions'}</p>
    </div>
  )
}

export function BehavioralCard({ period = '30d', bare = false }: Props) {
  const { data, isLoading } = useBehavioral(period)

  if (isLoading) {
    return (
      <CardFrame bare={bare}>
        {!bare && <CardTitle />}
        <div className="mt-6 space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />)}
        </div>
      </CardFrame>
    )
  }

  if (!data || data.nbTrades < 3) {
    return (
      <CardFrame bare={bare}>
        {!bare && <CardTitle />}
        <p className="mt-6 text-sm text-muted-foreground">
          Importez au moins 3 trades pour activer la détection.
        </p>
      </CardFrame>
    )
  }

  const detected  = data.patterns.filter(p => p.detected)
  const clean     = data.patterns.filter(p => !p.detected)
  const highCount = detected.filter(p => p.severity === 'HIGH').length

  return (
    <CardFrame bare={bare}>
      <div className={cn('mb-6 flex items-start gap-3', bare ? 'justify-end' : 'justify-between')}>
        {!bare && <CardTitle subtitle={`${data.nbTrades} trades analysés`} />}
        {highCount > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            {highCount} alerte{highCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sain
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Biais détectés — ligne neutre, la couleur est portée par l'icône
            et la pastille de sévérité, pas par un aplat de fond. */}
        {detected.map(p => {
          const meta = PATTERN_META[p.type]
          const sev  = SEVERITY[p.severity ?? 'LOW'] ?? SEVERITY.LOW!
          const Icon = meta?.icon ?? AlertTriangle
          return (
            <div key={p.type} className="rounded-lg border border-border p-3">
              <div className="flex items-start gap-3">
                <span className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary',
                  sev.icon,
                )}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{meta?.label ?? p.type}</p>
                    <span className={cn('shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium', sev.pill)}>
                      {sev.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{p.detail}</p>
                  {p.impact && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{p.impact}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Biais non détectés */}
        {clean.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm text-muted-foreground">Aucun signal détecté</p>
            <div className="flex flex-wrap gap-2">
              {clean.map(p => {
                const meta = PATTERN_META[p.type]
                const Icon = meta?.icon ?? CheckCircle2
                return (
                  <span
                    key={p.type}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta?.label ?? p.type}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </CardFrame>
  )
}
