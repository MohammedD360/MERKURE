import { CalendarClock } from 'lucide-react'

export function EconomicCalendar() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Contexte marché</p>
          <h3 className="mt-1 text-base font-black text-foreground">Calendrier économique</h3>
        </div>
      </div>
      <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white px-4 py-8 text-center">
        <CalendarClock className="h-8 w-8 text-muted-foreground/60" />
        <div>
          <p className="text-xs font-black text-muted-foreground">Aucun événement chargé</p>
          <p className="mt-1 text-[11px] text-muted-foreground/60">Connectez une source calendrier pour alimenter ce panneau.</p>
        </div>
      </div>
    </div>
  )
}
