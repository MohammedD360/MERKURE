'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { KpiCards }                         from './components/KpiCards'
import { EquityChart }                       from './components/EquityChart'
import { AssetBreakdown }                    from './components/AssetBreakdown'
import { StatsCles, StrategyPerformance }    from './components/StatsAndStrategy'
import { EconomicCalendar }                  from './components/EconomicCalendar'
import { RiskPanel }                          from './components/RiskPanel'

const PERIODS: { label: string; value: KpiPeriod }[] = [
  { label: '7J',   value: '7d'  },
  { label: '30J',  value: '30d' },
  { label: '90J',  value: '90d' },
  { label: '1 AN', value: '1y'  },
  { label: 'TOUT', value: 'all' },
]

export function DashboardPage() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')

  return (
    <div className="space-y-4 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1b2a42] pt-4">
        <div className="inline-flex rounded-xl border border-[#20314d] bg-[#07101f] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`min-w-[4rem] rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                period === p.value
                  ? 'bg-[#6d4cff] text-white shadow-[0_10px_24px_rgba(109,76,255,0.32)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[#7c5cff]/70 bg-[#7c5cff]/5 px-4 py-2.5 text-xs font-semibold text-[#b9a8ff] transition-colors hover:bg-[#7c5cff]/10"
        >
          <Settings className="h-4 w-4" />
          Personnaliser le dashboard
        </button>
      </div>

      <KpiCards period={period} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 2xl:col-span-7">
          <EquityChart />
        </div>
        <div className="xl:col-span-5 2xl:col-span-5">
          <AssetBreakdown period={period} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StatsCles period={period} />
        <StrategyPerformance period={period} />
        <EconomicCalendar />
      </div>

      <RiskPanel />
    </div>
  )
}
