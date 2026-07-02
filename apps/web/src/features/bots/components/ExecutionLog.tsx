import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { BotDecision, BotEvent } from '@/lib/hooks/use-bots'

type LogRow =
  | { kind: 'decision'; at: string; data: BotDecision }
  | { kind: 'event';    at: string; data: BotEvent }

function decisionColor(status: BotDecision['status']): string {
  switch (status) {
    case 'FILLED':    return 'text-[hsl(var(--chart-win))]'
    case 'SUBMITTED': return 'text-[hsl(var(--chart-3))]'
    case 'SIMULATED': return 'text-white/50'
    case 'REJECTED':
    case 'FAILED':    return 'text-[hsl(var(--chart-loss))]'
    default:          return 'text-white/60'
  }
}

function eventColor(type: BotEvent['type']): string {
  switch (type) {
    case 'CIRCUIT_BREAKER_TRIPPED':
    case 'ERROR':   return 'text-[hsl(var(--chart-loss))]'
    case 'STARTED':
    case 'RESUMED': return 'text-[hsl(var(--chart-win))]'
    default:        return 'text-white/50'
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function ExecutionLog({ decisions, events, maxRows = 40 }: { decisions: BotDecision[]; events: BotEvent[]; maxRows?: number }) {
  const rows: LogRow[] = [
    ...decisions.map((d): LogRow => ({ kind: 'decision', at: d.createdAt, data: d })),
    ...events.map((e): LogRow => ({ kind: 'event', at: e.createdAt, data: e })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, maxRows)

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black uppercase tracking-wider text-white/70">
          Journal d&apos;exécution — live
        </CardTitle>
      </CardHeader>
      <div className="max-h-[420px] overflow-y-auto px-4 pb-4 font-mono-terminal text-xs">
        {rows.length === 0 && <p className="py-6 text-center text-white/40">Aucune activité pour l&apos;instant.</p>}
        {rows.map((row) =>
          row.kind === 'decision' ? (
            <div key={`d-${row.data.id}`} className="flex items-center gap-3 border-b border-[hsl(var(--border)/0.5)] py-1.5 last:border-0">
              <span className="w-20 shrink-0 text-white/30">{formatTime(row.at)}</span>
              <span className={`w-24 shrink-0 font-bold ${decisionColor(row.data.status)}`}>{row.data.status}</span>
              <span className="shrink-0 text-white/70">{row.data.side}</span>
              <span className="truncate text-white/50">{row.data.question || 'Aucune action ce cycle'}</span>
              {Number(row.data.sizeUsd) > 0 && (
                <span className="ml-auto shrink-0 text-white/70">${Number(row.data.sizeUsd).toFixed(0)}</span>
              )}
            </div>
          ) : (
            <div key={`e-${row.data.id}`} className="flex items-center gap-3 border-b border-[hsl(var(--border)/0.5)] py-1.5 last:border-0">
              <span className="w-20 shrink-0 text-white/30">{formatTime(row.at)}</span>
              <span className={`w-24 shrink-0 font-bold ${eventColor(row.data.type)}`}>{row.data.type}</span>
              <span className="truncate text-white/50">{row.data.message}</span>
            </div>
          ),
        )}
      </div>
    </Card>
  )
}
