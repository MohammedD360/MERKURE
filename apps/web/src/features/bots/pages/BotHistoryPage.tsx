'use client'

import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { useBots, useBotDecisions, useBotEvents } from '@/lib/hooks/use-bots'
import { BotSelectorChips } from '../components/BotSelectorChips'
import { ExecutionLog } from '../components/ExecutionLog'

export function BotHistoryPage() {
  const { data: bots = [] } = useBots()
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    if (!selectedId && bots.length > 0) setSelectedId(bots[0]?.id)
  }, [bots, selectedId])

  const { data: decisions = [] } = useBotDecisions(selectedId)
  const { data: events = [] }    = useBotEvents(selectedId)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-white/40">Bot Trading — Polymarket</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-white">
          <History className="h-6 w-6 text-[hsl(var(--primary))]" /> Historique des Trades Auto
        </h1>
      </div>

      <BotSelectorChips bots={bots} selectedId={selectedId} onSelect={setSelectedId} />

      {bots.length === 0 ? (
        <p className="text-sm text-white/50">Aucun bot pour l&apos;instant.</p>
      ) : (
        <ExecutionLog decisions={decisions} events={events} maxRows={200} />
      )}
    </div>
  )
}
