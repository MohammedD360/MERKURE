import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WhaleSignal } from '@/lib/hooks/use-bots'

function formatWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  return `il y a ${h}h`
}

export function WhaleActivityFeed({ signals, live }: { signals: WhaleSignal[]; live: boolean }) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-black uppercase tracking-wider text-white/70">
          Activité baleines
        </CardTitle>
        <Badge className={`border-transparent text-[10px] ${live ? 'bg-[hsl(var(--chart-win)/0.18)] text-[hsl(var(--chart-win))]' : 'bg-white/10 text-white/50'}`}>
          {live ? 'Dune live' : 'Simulation'}
        </Badge>
      </CardHeader>
      <div className="divide-y divide-[hsl(var(--border))] px-4 pb-3">
        {signals.length === 0 && (
          <p className="py-4 text-xs text-white/40">Aucun mouvement significatif détecté.</p>
        )}
        {signals.map((s, i) => (
          <div key={`${s.wallet}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.side === 'BUY' ? 'bg-[hsl(var(--chart-win))]' : 'bg-[hsl(var(--chart-loss))]'}`} />
              <span className="font-mono-terminal truncate text-xs text-white/80">{formatWallet(s.wallet)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-right">
              <span className={`font-mono-terminal text-xs font-bold ${s.side === 'BUY' ? 'text-[hsl(var(--chart-win))]' : 'text-[hsl(var(--chart-loss))]'}`}>
                {s.side} ${s.sizeUsd.toLocaleString('fr-FR')}
              </span>
              <span className="w-16 text-[10px] text-white/40">{timeAgo(s.detectedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
