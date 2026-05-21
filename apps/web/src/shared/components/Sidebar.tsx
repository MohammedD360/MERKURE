'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard, Wallet, BriefcaseBusiness, TrendingUp, ArrowLeftRight,
  BarChart2, PieChart, FileText,
  Bot, Lightbulb, FlaskConical, ScanLine,
  BookOpen, NotebookPen,
  Zap, CreditCard,
} from 'lucide-react'
import type { ElementType } from 'react'
import type { Page } from '@/lib/navigation'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const sections: Array<{
  label: string
  items: Array<{ icon: ElementType; label: string; page: Page; badge?: string; soon?: boolean }>
}> = [
  {
    label: 'GESTION',
    items: [
      { icon: LayoutDashboard,   label: 'Dashboard',    page: 'dashboard' },
      { icon: Wallet,            label: 'Comptes',      page: 'comptes' },
      { icon: CreditCard,        label: 'Abonnement',   page: 'billing' },
      { icon: BriefcaseBusiness, label: 'Portefeuille', page: 'portefeuille', soon: true },
      { icon: TrendingUp,        label: 'Positions',    page: 'positions',    soon: true },
      { icon: ArrowLeftRight,    label: 'Transactions', page: 'transactions' },
    ],
  },
  {
    label: 'ANALYSE',
    items: [
      { icon: BarChart2, label: 'Performance',  page: 'performance' },
      { icon: PieChart,  label: 'Statistiques', page: 'statistiques', soon: true },
      { icon: FileText,  label: 'Rapports',     page: 'rapports' },
    ],
  },
  {
    label: 'IA & STRATÉGIE',
    items: [
      { icon: Bot,         label: 'Assistant IA',   page: 'assistant',   badge: 'BETA' },
      { icon: Lightbulb,   label: 'Stratégies',     page: 'strategies',  soon: true },
      { icon: FlaskConical,label: 'Backtesting',    page: 'backtesting', soon: true },
      { icon: ScanLine,    label: 'Market Scanner', page: 'scanner',     soon: true },
    ],
  },
  {
    label: 'APPRENTISSAGE',
    items: [
      { icon: BookOpen,    label: 'Conseils',        page: 'conseils', soon: true },
      { icon: NotebookPen, label: 'Journal',         page: 'journal',  badge: 'NEW' },
    ],
  },
]

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Plan Gratuit',
  STARTER: 'Plan Starter',
  PRO: 'Plan Pro',
  ELITE: 'Plan Elite',
  INSTITUTIONAL: 'Plan Institutionnel',
}

export function Sidebar({ currentPage, onNavigate }: Props) {
  const { data: user } = useCurrentUser()
  const planLabel = user?.plan ? (PLAN_LABELS[user.plan] ?? `Plan ${user.plan}`) : 'Plan —'

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col overflow-hidden">
      <div className="absolute inset-0 border-r border-[#172842] bg-[#07101f]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,92,255,0.12),transparent_36%)]" />

      <div className="relative flex-shrink-0 border-b border-[#172842] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] via-[#5f77ff] to-[#18c7ff] text-base font-black text-white shadow-[0_12px_30px_rgba(124,92,255,0.35)]">
            M
          </div>
          <span className="text-base font-black tracking-normal text-white">MERKURE</span>
        </div>
      </div>

      <nav className="scrollbar-none relative flex-1 space-y-7 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
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
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-[#7c5cff]/20 text-white'
                        : soon
                          ? 'cursor-default text-slate-700'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl border border-[#7c5cff]/25 bg-[#7c5cff]/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon className={`relative z-10 h-4 w-4 flex-shrink-0 transition-colors ${
                      active ? 'text-[#a798ff]' : soon ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-300'
                    }`} />
                    <span className="relative z-10 truncate">{label}</span>

                    {badge && (
                      <span className="relative z-10 ml-auto rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/20 px-2 py-0.5 text-[9px] font-bold text-[#b9a8ff]">
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

      <div className="relative flex-shrink-0 border-t border-[#172842] p-4">
        <div className="rounded-2xl border border-[#263a5b] bg-[#0b1527] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/10">
              <Zap className="h-4 w-4 text-[#fbbf24]" />
            </div>
            <span className="text-sm font-bold text-white/80">{planLabel}</span>
          </div>
          {user?.plan === 'FREE' || !user ? (
            <button
              onClick={() => onNavigate('billing')}
              className="w-full rounded-xl border border-[#7c5cff]/25 bg-[#7c5cff]/10 py-2 text-xs font-bold text-[#b9a8ff] transition-colors hover:bg-[#7c5cff]/20"
            >
              Passer à Pro →
            </button>
          ) : (
            <button
              onClick={() => onNavigate('billing')}
              className="w-full rounded-xl border border-[#263a5b] bg-transparent py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
            >
              Gérer l'abonnement →
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
