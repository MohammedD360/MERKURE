'use client'

import {
  LayoutDashboard, Wallet, BriefcaseBusiness, TrendingUp, ArrowLeftRight,
  BarChart2, PieChart, FileText,
  NotebookPen, Sparkles, Brain, Target,
  CreditCard, Bell, Settings2, X,
} from 'lucide-react'
import type { ElementType } from 'react'
import type { Page } from '@/lib/navigation'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { getPlanDisplayLabel } from '@/lib/plans'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  mobileOpen?: boolean
  onClose?: () => void
}

const sections: Array<{
  label: string
  items: Array<{ icon: ElementType; label: string; page: Page; badge?: string; soon?: boolean }>
}> = [
  {
    label: 'Pilotage',
    items: [
      { icon: LayoutDashboard,   label: 'Dashboard',    page: 'dashboard' },
      { icon: Wallet,            label: 'Comptes',      page: 'comptes' },
      { icon: BriefcaseBusiness, label: 'Portefeuille', page: 'portefeuille' },
      { icon: TrendingUp,        label: 'Positions',    page: 'positions' },
      { icon: ArrowLeftRight,    label: 'Transactions', page: 'transactions' },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { icon: BarChart2,   label: 'Performance',  page: 'performance' },
      { icon: PieChart,    label: 'Statistiques', page: 'statistiques' },
      { icon: NotebookPen, label: 'Journal',       page: 'journal' },
      { icon: FileText,    label: 'Rapports',      page: 'rapports' },
    ],
  },
  {
    label: 'IA',
    items: [
      { icon: Sparkles,       label: 'Vue IA',          page: 'ia', badge: 'NEW' },
      { icon: Brain,          label: 'Biais',           page: 'iaBiais' },
      { icon: FileText,       label: 'Rapport IA',      page: 'iaRapport' },
      { icon: Bell,           label: 'Coach',           page: 'iaCoach' },
      { icon: ArrowLeftRight, label: 'Simulation',      page: 'iaSimulation' },
      { icon: BarChart2,      label: 'Benchmark',       page: 'iaBenchmark' },
      { icon: Target,         label: 'Prop firms',      page: 'iaPropfirm' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { icon: CreditCard, label: 'Abonnement', page: 'billing' },
      { icon: Bell,       label: 'Alertes',    page: 'alerts' },
      { icon: Settings2,  label: 'Paramètres', page: 'settings' },
    ],
  },
]

function MerkureLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg className="h-8 w-8 shrink-0 text-white" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M12 27V13l8 8 8-8v14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-base font-black tracking-[0.12em] text-white">MERKURE</span>
    </div>
  )
}

export function Sidebar({ currentPage, onNavigate, mobileOpen = false, onClose }: Props) {
  const { data: user } = useCurrentUser()
  const planLabel = user?.plan ? getPlanDisplayLabel(user.plan) : 'Plan —'

  return (
    <aside className={`fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-hidden transition-transform duration-200 lg:translate-x-0 ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="absolute inset-0 border-r border-slate-800 bg-[#070b12]" />

      <div className="relative flex-shrink-0 border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-3">
          <MerkureLogo />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-white lg:hidden"
            aria-label="Fermer la navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="scrollbar-none relative flex-1 space-y-7 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map(({ icon: Icon, label, page, badge, soon }) => {
                const active = currentPage === page
                return (
                  <button
                    key={page}
                    onClick={() => !soon && onNavigate(page)}
                    disabled={soon}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? 'border border-slate-700 bg-slate-900 text-white'
                        : soon
                          ? 'cursor-default text-slate-700'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`relative z-10 h-4 w-4 flex-shrink-0 transition-colors ${
                      active ? 'text-emerald-400' : soon ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span className="relative z-10 truncate">{label}</span>

                    {badge && (
                      <span className="relative z-10 ml-auto rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                        {badge}
                      </span>
                    )}
                    {soon && (
                      <span className="relative z-10 ml-auto rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-slate-600">
                        SOON
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative flex-shrink-0 border-t border-slate-800 p-4">
        <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-white/80">{planLabel}</span>
          </div>
          {user?.plan === 'FREE' || !user ? (
            <button
              onClick={() => onNavigate('billing')}
              className="w-full rounded-lg border border-slate-700 bg-white py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-slate-200"
            >
              Passer à Pro →
            </button>
          ) : (
            <button
              onClick={() => onNavigate('billing')}
              className="w-full rounded-lg border border-slate-800 bg-transparent py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
            >
              Gérer l'abonnement →
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
