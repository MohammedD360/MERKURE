import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  delta?: number        // variation vs période précédente en %
  icon: ReactNode
  variant?: 'default' | 'profit' | 'loss' | 'warning'
  tooltip?: string
}

export function KpiCard({ label, value, sub, delta, icon, variant = 'default', tooltip }: KpiCardProps) {
  const variantStyles = {
    default: 'border-[hsl(var(--border))]',
    profit: 'border-emerald-200 bg-emerald-50/50',
    loss: 'border-red-200 bg-red-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
  }

  const deltaColor = delta === undefined ? '' : delta >= 0 ? 'text-emerald-600' : 'text-red-500'
  const DeltaIcon = delta === undefined ? Minus : delta >= 0 ? TrendingUp : TrendingDown

  return (
    <div
      className={`card flex flex-col gap-3 ${variantStyles[variant]}`}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[hsl(var(--foreground-soft))] uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--foreground-soft))]">
          {icon}
        </div>
      </div>

      <div>
        <div className="kpi-value text-foreground">{value}</div>
        {sub && <div className="text-xs text-[hsl(var(--foreground-soft))] mt-0.5">{sub}</div>}
      </div>

      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon className="w-3 h-3" />
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs mois dernier
        </div>
      )}
    </div>
  )
}
