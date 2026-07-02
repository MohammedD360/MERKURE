import { Badge } from '@/components/ui/badge'
import type { BotMode, BotStatus } from '@/lib/hooks/use-bots'

const STATUS_LABEL: Record<BotStatus, string> = {
  DRAFT:   'Brouillon',
  ACTIVE:  'Actif',
  PAUSED:  'En pause',
  STOPPED: 'Arrêté',
}

const STATUS_CLASS: Record<BotStatus, string> = {
  DRAFT:   'border-transparent bg-white/10 text-white/70',
  ACTIVE:  'border-transparent bg-[hsl(var(--chart-win)/0.18)] text-[hsl(var(--chart-win))]',
  PAUSED:  'border-transparent bg-amber-500/15 text-amber-400',
  STOPPED: 'border-transparent bg-white/10 text-white/50',
}

export function BotStatusBadge({ status }: { status: BotStatus }) {
  return (
    <Badge className={STATUS_CLASS[status]}>
      {status === 'ACTIVE' && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-terminal-live rounded-full bg-[hsl(var(--chart-win))]" />
      )}
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function BotModeBadge({ mode }: { mode: BotMode }) {
  return mode === 'LIVE' ? (
    <Badge className="border-transparent bg-[hsl(var(--destructive)/0.18)] text-[hsl(var(--destructive))]">
      LIVE — fonds réels
    </Badge>
  ) : (
    <Badge className="border-transparent bg-white/10 text-white/60">
      Dry-run
    </Badge>
  )
}
