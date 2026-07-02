'use client'

import Link from 'next/link'
import { Play, Pause, Square, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BotStatusBadge, BotModeBadge } from './BotStatusBadge'
import {
  useStartBot, usePauseBot, useStopBot, useDeleteBot,
  type TradingBot,
} from '@/lib/hooks/use-bots'

export function BotCard({ bot }: { bot: TradingBot }) {
  const start  = useStartBot()
  const pause  = usePauseBot()
  const stop   = useStopBot()
  const remove = useDeleteBot()

  const pnlPct =
    Number(bot.sessionStartEquity) > 0
      ? ((Number(bot.currentEquity) - Number(bot.sessionStartEquity)) / Number(bot.sessionStartEquity)) * 100
      : 0
  const isUp = pnlPct >= 0

  return (
    <Card className="bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/app/bots/history" className="truncate text-sm font-bold text-white hover:text-[hsl(var(--primary))]">
            {bot.name}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <BotStatusBadge status={bot.status} />
            <BotModeBadge mode={bot.mode} />
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono-terminal text-lg font-black ${isUp ? 'text-[hsl(var(--chart-win))]' : 'text-[hsl(var(--chart-loss))]'}`}>
            {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
          </p>
          <p className="font-mono-terminal text-[11px] text-white/40">${Number(bot.currentEquity).toFixed(0)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {bot.status !== 'ACTIVE' && bot.status !== 'STOPPED' && (
          <Button size="sm" variant="outline" className="h-8 border-[hsl(var(--chart-win)/0.4)] text-[hsl(var(--chart-win))] hover:bg-[hsl(var(--chart-win)/0.1)]"
            onClick={() => start.mutate(bot.id)} disabled={start.isPending}>
            <Play className="mr-1.5 h-3.5 w-3.5" /> Démarrer
          </Button>
        )}
        {bot.status === 'ACTIVE' && (
          <Button size="sm" variant="outline" className="h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            onClick={() => pause.mutate(bot.id)} disabled={pause.isPending}>
            <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
          </Button>
        )}
        {bot.status !== 'STOPPED' && (
          <Button size="sm" variant="outline" className="h-8 border-white/20 text-white/60 hover:bg-white/10"
            onClick={() => stop.mutate(bot.id)} disabled={stop.isPending}>
            <Square className="mr-1.5 h-3.5 w-3.5" /> Arrêter
          </Button>
        )}
        <Button size="sm" variant="ghost" className="ml-auto h-8 text-white/40 hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
          onClick={() => { if (confirm(`Supprimer le bot "${bot.name}" ?`)) remove.mutate(bot.id) }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
