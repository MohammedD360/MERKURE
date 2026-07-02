'use client'

import { useEffect, useState } from 'react'
import { LineChart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useBots, useBotDecisions } from '@/lib/hooks/use-bots'
import { BotSelectorChips } from '../components/BotSelectorChips'

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <Card className="bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-white/40">{label}</p>
      <p className={`mt-1 font-mono-terminal text-xl font-black ${
        tone === 'up' ? 'text-[hsl(var(--chart-win))]' : tone === 'down' ? 'text-[hsl(var(--chart-loss))]' : 'text-white'
      }`}>
        {value}
      </p>
    </Card>
  )
}

export function BotPerformancePage() {
  const { data: bots = [] } = useBots()
  const [selectedId, setSelectedId] = useState<string | undefined>()

  useEffect(() => {
    if (!selectedId && bots.length > 0) setSelectedId(bots[0]?.id)
  }, [bots, selectedId])

  const selectedBot = bots.find((b) => b.id === selectedId)
  const { data: decisions = [] } = useBotDecisions(selectedId)

  const pnlPct = selectedBot && Number(selectedBot.sessionStartEquity) > 0
    ? ((Number(selectedBot.currentEquity) - Number(selectedBot.sessionStartEquity)) / Number(selectedBot.sessionStartEquity)) * 100
    : 0

  const filled    = decisions.filter((d) => d.status === 'FILLED' || d.status === 'SUBMITTED')
  const rejected  = decisions.filter((d) => d.status === 'REJECTED' || d.status === 'FAILED')
  const holds     = decisions.filter((d) => d.side === 'HOLD')

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">Bot Trading — Polymarket</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white">
          <LineChart className="h-6 w-6 text-[hsl(var(--primary))]" /> Performance des Bots
        </h1>
      </div>

      <BotSelectorChips bots={bots} selectedId={selectedId} onSelect={setSelectedId} />

      {!selectedBot ? (
        <p className="text-sm text-white/50">Aucun bot à analyser pour l&apos;instant.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="PnL session" value={`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`} tone={pnlPct >= 0 ? 'up' : 'down'} />
            <StatCard label="Équité actuelle" value={`$${Number(selectedBot.currentEquity).toFixed(0)}`} />
            <StatCard label="Trades exécutés" value={String(filled.length)} tone="up" />
            <StatCard label="Rejets / échecs" value={String(rejected.length)} {...(rejected.length > 0 ? { tone: 'down' as const } : {})} />
          </div>

          <Card className="bg-card p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-white/50">
              Répartition des décisions ({decisions.length} cycles observés)
            </p>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
              {decisions.length > 0 && (
                <>
                  <div className="bg-[hsl(var(--chart-win))]" style={{ width: `${(filled.length / decisions.length) * 100}%` }} />
                  <div className="bg-white/20" style={{ width: `${(holds.length / decisions.length) * 100}%` }} />
                  <div className="bg-[hsl(var(--chart-loss))]" style={{ width: `${(rejected.length / decisions.length) * 100}%` }} />
                </>
              )}
            </div>
            <div className="mt-3 flex gap-4 text-[11px] text-white/50">
              <span><span className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--chart-win))]" /> Exécutés ({filled.length})</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-white/20" /> Sans action ({holds.length})</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--chart-loss))]" /> Rejetés ({rejected.length})</span>
            </div>
            <p className="mt-4 text-[11px] text-white/30">
              Courbe d&apos;équity détaillée à venir — un historique de snapshots périodiques sera ajouté
              pour la tracer précisément dans le temps.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
