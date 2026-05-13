import { KpiCards } from './components/KpiCards'
import { EquityChart } from './components/EquityChart'
import { AssetBreakdown } from './components/AssetBreakdown'
import { StatsCles, StrategyPerformance } from './components/StatsAndStrategy'
import { EconomicCalendar } from './components/EconomicCalendar'
import { AiAnalysisBanner } from './components/AiAnalysisBanner'

export function DashboardPage() {
  return (
    <div className="px-5 py-4 space-y-4">
      <KpiCards />

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <EquityChart />
        </div>
        <div className="col-span-2">
          <AssetBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCles />
        <StrategyPerformance />
        <EconomicCalendar />
      </div>

      <AiAnalysisBanner />
    </div>
  )
}
