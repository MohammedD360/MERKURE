'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PolymarketMarket } from '@/lib/hooks/use-bots'

const HISTORY_LENGTH = 40

export function LiveTicker({ market }: { market: PolymarketMarket }) {
  const [history, setHistory] = useState<number[]>([market.yesPrice])
  const lastMarketId = useRef(market.id)

  useEffect(() => {
    if (lastMarketId.current !== market.id) {
      lastMarketId.current = market.id
      setHistory([market.yesPrice])
      return
    }
    setHistory((prev) => [...prev.slice(-(HISTORY_LENGTH - 1)), market.yesPrice])
  }, [market.id, market.yesPrice])

  const first  = history[0] ?? market.yesPrice
  const change = market.yesPrice - first
  const changePct = first > 0 ? (change / first) * 100 : 0
  const isUp = change >= 0
  const max = Math.max(...history)
  const min = Math.min(...history)
  const range = max - min || 0.01

  return (
    <Card className="overflow-hidden border-[hsl(var(--border))] bg-card p-0">
      <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block h-2 w-2 shrink-0 animate-terminal-live rounded-full bg-[hsl(var(--chart-win))]" />
          <span className="truncate text-xs font-bold uppercase tracking-wider text-white/60">{market.question}</span>
        </div>
        <Badge className="shrink-0 border-transparent bg-white/10 text-[10px] text-white/60">{market.category}</Badge>
      </div>

      <div className="flex items-end justify-between gap-4 px-4 py-4">
        <div>
          <p className="font-mono-terminal text-3xl font-black text-white">
            {(market.yesPrice * 100).toFixed(1)}<span className="text-lg text-white/40">¢</span>
          </p>
          <p className={`mt-1 font-mono-terminal text-xs font-bold ${isUp ? 'text-[hsl(var(--chart-win))]' : 'text-[hsl(var(--chart-loss))]'}`}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{changePct.toFixed(2)}%
          </p>
        </div>

        <div className="flex h-12 items-end gap-[2px]">
          {history.map((v, i) => {
            const h = Math.max(4, ((v - min) / range) * 44)
            const barUp = i === 0 || v >= (history[i - 1] ?? v)
            return (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`w-[3px] rounded-t-sm ${barUp ? 'bg-[hsl(var(--chart-win))]' : 'bg-[hsl(var(--chart-loss))]'}`}
              />
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-[hsl(var(--border))] bg-[hsl(var(--border))] text-center">
        <div className="bg-card px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Liquidité</p>
          <p className="font-mono-terminal text-sm font-bold text-white">${market.liquidityUsd.toLocaleString('fr-FR')}</p>
        </div>
        <div className="bg-card px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-white/40">Volume 24h</p>
          <p className="font-mono-terminal text-sm font-bold text-white">${market.volume24hUsd.toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </Card>
  )
}
