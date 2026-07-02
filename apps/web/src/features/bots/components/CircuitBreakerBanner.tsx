import { AlertTriangle } from 'lucide-react'
import type { TradingBot } from '@/lib/hooks/use-bots'

export function CircuitBreakerBanner({ bot }: { bot: TradingBot }) {
  if (!bot.circuitBreakerTrippedAt) return null

  const pnlPct =
    Number(bot.sessionStartEquity) > 0
      ? ((Number(bot.currentEquity) - Number(bot.sessionStartEquity)) / Number(bot.sessionStartEquity)) * 100
      : 0

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.12)] p-4 terminal-glow-pink">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--destructive))]" />
      <div>
        <p className="text-sm font-bold text-[hsl(var(--destructive))]">
          Circuit breaker déclenché — « {bot.name} » arrêté automatiquement
        </p>
        <p className="mt-1 text-xs text-white/70">
          Perte de session : {pnlPct.toFixed(2)}% (limite : -{bot.riskConfig.maxSessionLossPct}%).
          Relance manuelle nécessaire depuis la liste des bots.
        </p>
      </div>
    </div>
  )
}
