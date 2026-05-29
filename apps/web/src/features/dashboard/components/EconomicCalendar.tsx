import { CalendarClock } from 'lucide-react'

export function EconomicCalendar() {
  return (
    <div className="flex flex-col rounded-lg border border-slate-800 bg-[#0b111c] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Contexte marché</p>
          <h3 className="mt-1 text-base font-black text-white">Calendrier économique</h3>
        </div>
      </div>
      <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-800 bg-[#071017] px-4 py-8 text-center">
        <CalendarClock className="h-8 w-8 text-slate-600" />
        <div>
          <p className="text-xs font-black text-slate-500">Aucun événement chargé</p>
          <p className="mt-1 text-[11px] text-slate-600">Connectez une source calendrier pour alimenter ce panneau.</p>
        </div>
      </div>
    </div>
  )
}
