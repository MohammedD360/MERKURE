import { mockCalendar } from '@/lib/mock-data'

const impactColor: Record<string, string> = {
  'Élevé': 'bg-red-500/15 text-red-400 border-red-500/30',
  'Moyen': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Faible': 'bg-green-500/15 text-green-400 border-green-500/30',
}

export function EconomicCalendar() {
  return (
    <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Calendrier économique</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Voir tout</button>
      </div>

      {/* En-têtes */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-1">
        {['Heure', 'Curd', 'Événement', 'Impact'].map((h) => (
          <span key={h} className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{h}</span>
        ))}
      </div>

      <div className="space-y-2">
        {mockCalendar.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-center px-1 py-1.5 rounded-lg hover:bg-gray-800/30 transition-colors">
            <span className="text-xs font-mono text-gray-400">{item.time}</span>
            <span className={`text-xs font-bold ${item.currency === 'USD' ? 'text-green-400' : 'text-blue-400'}`}>
              {item.currency}
            </span>
            <span className="text-xs text-gray-300 truncate">{item.event}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border w-fit ${impactColor[item.impact] ?? 'text-gray-400'}`}>
              {item.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
