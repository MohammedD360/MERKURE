'use client'

import { useState } from 'react'
import { useStreaks } from '@/lib/hooks/use-stats'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'

const PERIODS: { value: KpiPeriod; label: string }[] = [
  { value: '7d',  label: '7j' },
  { value: '30d', label: '30j' },
  { value: '90d', label: '90j' },
  { value: '1y',  label: '1 an' },
  { value: 'all', label: 'Tout' },
]

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-[hsl(var(--accent))] border border-[hsl(var(--border))] rounded-xl p-4">
      <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-foreground/50 mt-1">{sub}</p>}
    </div>
  )
}

export function StreakAnalysis() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const { data, isLoading } = useStreaks(period)

  const currentColor = data?.currentType === 'win'
    ? 'text-emerald-600'
    : data?.currentType === 'loss'
      ? 'text-red-500'
      : 'text-[hsl(var(--foreground-soft))]'

  const currentLabel = data?.currentType === 'win'
    ? 'série gagnante'
    : data?.currentType === 'loss'
      ? 'série perdante'
      : 'aucune série'

  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Analyse des séries</h2>
          <p className="text-[11px] text-[hsl(var(--foreground-soft))] mt-0.5">Streaks gagnants / perdants</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                period === p.value
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]'
                  : 'text-[hsl(var(--foreground-soft))] hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[hsl(var(--accent))] border border-[hsl(var(--border))] rounded-xl p-4">
                <div className="h-3 bg-[hsl(var(--border))] rounded animate-pulse w-20 mb-2" />
                <div className="h-7 bg-[hsl(var(--border))] rounded animate-pulse w-12" />
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-[hsl(var(--foreground-soft))] text-sm">Aucune donnée disponible</div>
        ) : (
          <>
            {/* Current streak highlighted */}
            <div className={`mb-4 rounded-xl border p-4 ${
              data.currentType === 'win'
                ? 'border-emerald-200 bg-emerald-50'
                : data.currentType === 'loss'
                  ? 'border-red-200 bg-red-50'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--accent))]'
            }`}>
              <p className="text-[11px] text-[hsl(var(--foreground-soft))] uppercase tracking-wider font-medium mb-1">Série en cours</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold font-mono ${currentColor}`}>{data.current}</span>
                <span className={`text-sm ${currentColor}`}>{currentLabel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Meilleure série W"
                value={data.longestWin}
                sub="trades gagnants consécutifs"
                color="text-emerald-600"
              />
              <StatCard
                label="Pire série L"
                value={data.longestLoss}
                sub="trades perdants consécutifs"
                color="text-red-500"
              />
              <StatCard
                label="Série W moyenne"
                value={data.avgWinStreak}
                sub="trades par série gagnante"
                color="text-emerald-600"
              />
              <StatCard
                label="Série L moyenne"
                value={data.avgLossStreak}
                sub="trades par série perdante"
                color="text-amber-600"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
