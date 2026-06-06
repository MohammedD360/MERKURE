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
    <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}

export function StreakAnalysis() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const { data, isLoading } = useStreaks(period)

  const currentColor = data?.currentType === 'win'
    ? 'text-green-400'
    : data?.currentType === 'loss'
      ? 'text-red-400'
      : 'text-gray-400'

  const currentLabel = data?.currentType === 'win'
    ? 'série gagnante'
    : data?.currentType === 'loss'
      ? 'série perdante'
      : 'aucune série'

  return (
    <div className="bg-card border border-gray-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Analyse des séries</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Streaks gagnants / perdants</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                period === p.value
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-500 hover:text-gray-300'
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
              <div key={i} className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-4">
                <div className="h-3 bg-gray-800 rounded animate-pulse w-20 mb-2" />
                <div className="h-7 bg-gray-800 rounded animate-pulse w-12" />
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-gray-600 text-sm">Aucune donnée disponible</div>
        ) : (
          <>
            {/* Current streak highlighted */}
            <div className={`mb-4 rounded-xl border p-4 ${
              data.currentType === 'win'
                ? 'border-green-500/20 bg-green-500/5'
                : data.currentType === 'loss'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-gray-800/60 bg-gray-900/50'
            }`}>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-1">Série en cours</p>
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
                color="text-green-400"
              />
              <StatCard
                label="Pire série L"
                value={data.longestLoss}
                sub="trades perdants consécutifs"
                color="text-red-400"
              />
              <StatCard
                label="Série W moyenne"
                value={data.avgWinStreak}
                sub="trades par série gagnante"
                color="text-emerald-400"
              />
              <StatCard
                label="Série L moyenne"
                value={data.avgLossStreak}
                sub="trades par série perdante"
                color="text-orange-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
