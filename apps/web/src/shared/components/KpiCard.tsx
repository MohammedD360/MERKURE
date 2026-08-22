'use client'

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'

/* ── Typologie des KPI d'en-tête ───────────────────────────────────────────
   Une seule source pour toutes les pages : libellé léger 15px, valeur
   dominante 32px, puis une ligne de métriques secondaires ou une pastille.
   Toute modification ici se propage partout — c'est le but.               */

export function KpiCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-lg border border-border bg-card p-6', className)}>{children}</div>
}

export function KpiLabel({ children }: { children: ReactNode }) {
  return <p className="truncate text-[15px] text-muted-foreground">{children}</p>
}

export function KpiValue({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('kpi-display mt-3 truncate text-[32px] font-bold leading-none', className)}>
      {children}
    </p>
  )
}

/** Pastille de variation + suffixe — l'équivalent du « +2.30% Today » du modèle. */
export function KpiBadge({
  value,
  suffix,
  format = (v) => String(v),
}: {
  value: number
  suffix: string
  format?: (value: number) => string
}) {
  const up = value >= 0
  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
          up ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500',
        )}
      >
        {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {format(Math.abs(value))}
      </span>
      <span className="text-sm text-muted-foreground">{suffix}</span>
    </div>
  )
}

/** Pastille qualitative (texte) — même gabarit que KpiBadge, sans flèche. */
export function KpiTag({
  label,
  suffix,
  tone = 'neutral',
}: {
  label: string
  suffix?: string
  tone?: 'up' | 'down' | 'warn' | 'neutral'
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold',
        tone === 'up'     ? 'bg-green-500/15 text-green-500'
        : tone === 'down' ? 'bg-red-500/15 text-red-500'
        : tone === 'warn' ? 'bg-amber-500/15 text-amber-500'
        : 'bg-secondary text-muted-foreground',
      )}>
        {label}
      </span>
      {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export interface SubMetric {
  label: string
  value: string
  tone?: 'up' | 'down'
}

/** Ligne de métriques secondaires : « Libellé : valeur », côte à côte. */
export function KpiSubMetrics({ items }: { items: SubMetric[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
      {items.map(item => (
        <span key={item.label} className="text-sm text-muted-foreground">
          {item.label} :{' '}
          <span className={cn(
            'font-medium',
            item.tone === 'up' ? 'text-green-500' : item.tone === 'down' ? 'text-red-500' : 'text-foreground',
          )}>
            {item.value}
          </span>
        </span>
      ))}
    </div>
  )
}

/** Squelette au même gabarit, pour éviter le saut de mise en page au chargement. */
export function KpiSkeleton() {
  return (
    <KpiCard>
      <div className="h-5 w-28 animate-pulse rounded bg-secondary" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded bg-secondary" />
      <div className="mt-3 h-4 w-44 animate-pulse rounded bg-secondary" />
    </KpiCard>
  )
}
