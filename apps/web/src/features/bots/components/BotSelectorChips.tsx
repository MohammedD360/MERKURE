import type { TradingBot } from '@/lib/hooks/use-bots'

export function BotSelectorChips({
  bots, selectedId, onSelect,
}: { bots: TradingBot[]; selectedId: string | undefined; onSelect: (id: string) => void }) {
  if (bots.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {bots.map((bot) => (
        <button key={bot.id} type="button" onClick={() => onSelect(bot.id)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedId === bot.id
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.18)] text-[hsl(var(--primary))]'
              : 'border-white/15 text-white/50 hover:border-white/30'
          }`}>
          {bot.name}
        </button>
      ))}
    </div>
  )
}
