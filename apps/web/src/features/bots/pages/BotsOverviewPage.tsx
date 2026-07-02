'use client'

import Link from 'next/link'
import { Bot, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBots, useBotMarkets, useWhaleActivity } from '@/lib/hooks/use-bots'
import { BotCard } from '../components/BotCard'
import { LiveTicker } from '../components/LiveTicker'
import { WhaleActivityFeed } from '../components/WhaleActivityFeed'
import { CircuitBreakerBanner } from '../components/CircuitBreakerBanner'

export function BotsOverviewPage() {
  const { data: bots = [], isLoading } = useBots()
  const { data: marketsData }  = useBotMarkets()
  const { data: whaleData }    = useWhaleActivity()

  const trippedBots = bots.filter((b) => b.circuitBreakerTrippedAt)
  const topMarket = marketsData?.markets[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">Bot Trading — Polymarket</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white">
            <Bot className="h-6 w-6 text-[hsl(var(--primary))]" /> Mes Bots
          </h1>
        </div>
        <Button asChild className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.85)]">
          <Link href="/app/bots/create"><PlusCircle className="mr-1.5 h-4 w-4" /> Créer un bot</Link>
        </Button>
      </div>

      {trippedBots.map((bot) => <CircuitBreakerBanner key={bot.id} bot={bot} />)}

      <div className="grid gap-4 lg:grid-cols-2">
        {topMarket ? <LiveTicker market={topMarket} /> : <div className="h-40 animate-pulse rounded-lg bg-white/5" />}
        <WhaleActivityFeed signals={whaleData?.signals ?? []} live={whaleData?.live ?? false} />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-black uppercase tracking-wider text-white/50">
          Bots ({bots.length})
        </h2>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />)}
          </div>
        ) : bots.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm text-white/50">Aucun bot pour l&apos;instant.</p>
            <Button asChild variant="outline" className="mt-3 border-white/20 text-white/70 hover:bg-white/10">
              <Link href="/app/bots/create">Créer votre premier bot</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bots.map((bot) => <BotCard key={bot.id} bot={bot} />)}
          </div>
        )}
      </div>
    </div>
  )
}
