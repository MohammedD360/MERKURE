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
    default: 'border-gray-800',
    profit: 'border-green-500/20 bg-green-500/[0.03]',
    loss: 'border-red-500/20 bg-red-500/[0.03]',
    warning: 'border-amber-500/20 bg-amber-500/[0.03]',
  }

  const deltaColor = delta === undefined ? '' : delta >= 0 ? 'text-green-400' : 'text-red-400'
  const DeltaIcon = delta === undefined ? Minus : delta >= 0 ? TrendingUp : TrendingDown

  return (
    <div
      className={`card flex flex-col gap-3 ${variantStyles[variant]}`}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
          {icon}
        </div>
      </div>

      <div>
        <div className="kpi-value text-white">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
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
