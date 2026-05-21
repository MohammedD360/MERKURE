import { CalendarClock } from 'lucide-react'

export function EconomicCalendar() {
  return (
    <div className="flex flex-col rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_18px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Calendrier économique</h3>
      </div>
      <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#223653] bg-[#081220] py-8 text-center">
        <CalendarClock className="h-8 w-8 text-slate-600" />
        <div>
          <p className="text-xs font-medium text-slate-500">Aucun événement chargé</p>
          <p className="mt-1 text-[11px] text-slate-600">Connectez une source calendrier pour alimenter ce panneau.</p>
        </div>
      </div>
    </div>
  )
}
