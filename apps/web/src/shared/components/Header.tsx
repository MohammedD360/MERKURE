import { Search, Bell, Calendar, GitCompare } from 'lucide-react'

interface HeaderProps {
  title: string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#0d1117]/90 backdrop-blur-sm border-b border-gray-800/60 px-6 h-14 flex items-center justify-between flex-shrink-0">
      {/* Titre */}
      <div>
        <h1 className="text-base font-bold text-white leading-none">{title}</h1>
        <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
      </div>

      {/* Centre — Sélecteur de dates */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/60 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-medium transition-colors">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          01 Mai 2024 – 31 Mai 2024
        </button>
        <button className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/60 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-medium transition-colors">
          <GitCompare className="w-3.5 h-3.5" />
          Comparer
        </button>
      </div>

      {/* Droite — actions + user */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-gray-700/40">
          <Search className="w-3.5 h-3.5" />
        </button>
        <button className="relative w-8 h-8 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-gray-700/40">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 border border-[#0d1117]" />
        </button>

        {/* Avatar utilisateur */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-700/60">
          <div className="text-right">
            <div className="text-xs font-semibold text-white leading-none">Alexandre L.</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Mode démo</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            AL
          </div>
        </div>
      </div>
    </header>
  )
}
