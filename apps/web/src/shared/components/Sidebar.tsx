'use client'

import {
  LayoutDashboard, Wallet, BriefcaseBusiness, TrendingUp, ArrowLeftRight,
  BarChart2, PieChart, FileText,
  Bot, Lightbulb, FlaskConical, ScanLine,
  BookOpen, NotebookPen,
  ChevronRight,
} from 'lucide-react'
import type { ElementType } from 'react'
import type { Page } from '@/lib/navigation'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const sections: Array<{
  label: string
  items: Array<{ icon: ElementType; label: string; page: Page; badge?: string }>
}> = [
  {
    label: 'GESTION',
    items: [
      { icon: LayoutDashboard,   label: 'Dashboard',    page: 'dashboard' },
      { icon: Wallet,            label: 'Comptes',      page: 'comptes' },
      { icon: BriefcaseBusiness, label: 'Portefeuille', page: 'portefeuille' },
      { icon: TrendingUp,        label: 'Positions',    page: 'positions' },
      { icon: ArrowLeftRight,    label: 'Transactions', page: 'transactions' },
    ],
  },
  {
    label: 'ANALYSE',
    items: [
      { icon: BarChart2, label: 'Performance',  page: 'performance' },
      { icon: PieChart,  label: 'Statistiques', page: 'statistiques' },
      { icon: FileText,  label: 'Rapports',     page: 'rapports' },
    ],
  },
  {
    label: 'IA & STRATÉGIE',
    items: [
      { icon: Bot,         label: 'Assistant IA',   page: 'assistant',   badge: 'NOUVEAU' },
      { icon: Lightbulb,   label: 'Stratégies',     page: 'strategies' },
      { icon: FlaskConical,label: 'Backtesting',    page: 'backtesting' },
      { icon: ScanLine,    label: 'Market Scanner', page: 'scanner' },
    ],
  },
  {
    label: 'APPRENTISSAGE',
    items: [
      { icon: BookOpen,    label: 'Conseils personnalisés', page: 'conseils' },
      { icon: NotebookPen, label: 'Journal de trading',     page: 'journal' },
    ],
  },
]

export function Sidebar({ currentPage, onNavigate }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0d1117] border-r border-gray-800/60 flex flex-col z-20 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm">MERKURE</span>
            <span className="text-[9px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">APP</span>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-2 py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-gray-600 tracking-widest px-2 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ icon: Icon, label, page, badge }) => {
                const active = currentPage === page
                return (
                  <button
                    key={page}
                    onClick={() => onNavigate(page)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all group ${
                      active
                        ? 'bg-indigo-600/15 text-indigo-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span className="ml-auto text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                        {badge}
                      </span>
                    )}
                    {active && !badge && <ChevronRight className="w-3 h-3 ml-auto text-indigo-500/50" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-white">Plan Free</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-2.5">Mode local-first actif</p>
          <button className="w-full text-[11px] font-medium text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg py-1.5 transition-colors">
            Gérer mon abonnement
          </button>
        </div>
      </div>
    </aside>
  )
}
