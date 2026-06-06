'use client'

import {
  LayoutDashboard, Wallet, BriefcaseBusiness, ArrowLeftRight,
  BarChart2, PieChart, FileText, NotebookPen, Sparkles, Target,
  Bell, Settings2, X, ChevronDown, ArrowLeft,
} from 'lucide-react'
import type { ElementType } from 'react'
import type { Page } from '@/lib/navigation'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { getPlanDisplayLabel } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/shared/components/BrandLogo'

interface Props {
  currentPage: Page
  onNavigate:  (page: Page) => void
  mobileOpen?: boolean
  onClose?:    () => void
}

const sections: Array<{
  label: string
  items: Array<{ icon: ElementType; label: string; page: Page; badge?: string; soon?: boolean }>
}> = [
  {
    label: '',
    items: [
      { icon: LayoutDashboard,   label: 'Overview',  page: 'dashboard' },
      { icon: Wallet,            label: 'Accounts',  page: 'comptes' },
      { icon: BriefcaseBusiness, label: 'Portfolio', page: 'portefeuille' },
      { icon: ArrowLeftRight,    label: 'Trades',    page: 'transactions' },
      { icon: NotebookPen,       label: 'Journal',   page: 'journal' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { icon: BarChart2,   label: 'Performance',  page: 'performance' },
      { icon: PieChart,    label: 'Statistics',   page: 'statistiques' },
      { icon: FileText,    label: 'Reports',      page: 'rapports' },
      { icon: Sparkles,    label: 'AI Coach',     page: 'iaCoach', badge: 'AI' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: ArrowLeftRight, label: 'Simulation', page: 'iaSimulation' },
      { icon: BarChart2,      label: 'Benchmark',  page: 'iaBenchmark' },
      { icon: Target,         label: 'Prop Firms', page: 'iaPropfirm' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { icon: Bell,       label: 'Alerts',       page: 'alerts' },
      { icon: Settings2,  label: 'Settings',     page: 'settings' },
      { icon: Sparkles,   label: 'Integrations', page: 'ia' },
    ],
  },
]

export function Sidebar({ currentPage, onNavigate, mobileOpen = false, onClose }: Props) {
  const { data: user } = useCurrentUser()
  const planLabel = user?.plan ? getPlanDisplayLabel(user.plan) : null
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : 'Alexandre L.'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-hidden',
      'border-r border-white/10 bg-[#070b12]',
      'transition-transform duration-200 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>

      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center justify-between px-5">
        <BrandLogo
          className="gap-3 text-white"
          iconClassName="h-8 w-8 text-violet-500"
          textClassName="text-lg font-black tracking-[0.12em]"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-white lg:hidden"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              {section.label && (
                <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ icon: Icon, label, page, badge, soon }) => {
                  const active = currentPage === page
                  return (
                    <button
                      key={page}
                      onClick={() => !soon && onNavigate(page)}
                      disabled={soon}
                      className={cn(
                        'group flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors',
                        active
                          ? 'bg-violet-600/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.12)]'
                          : soon
                            ? 'cursor-default text-slate-700'
                            : 'text-slate-300/80 hover:bg-white/[0.04] hover:text-white',
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active
                          ? 'text-violet-400'
                          : soon
                            ? 'text-slate-800'
                            : 'text-slate-400 group-hover:text-slate-200',
                      )} />
                      <span className="flex-1 truncate font-semibold">{label}</span>

                      {badge && (
                        <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-black text-white">
                          {badge}
                        </span>
                      )}
                      {soon && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-medium text-[hsl(var(--sidebar-foreground)/0.2)]">
                          bientôt
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer: user info */}
      <div className="shrink-0 space-y-4 p-3">
        <div className="rounded-lg border border-white/10 bg-[#0a0f18] p-3">
          <button
            onClick={() => onNavigate('profile')}
            className="flex w-full items-center gap-3 text-left"
          >
            {user?.avatarUrl ? (
              <div
                className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center ring-1 ring-white/10"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-sm font-black text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {displayName}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-400">{planLabel ?? 'Plan Pro'}</p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        </div>
        <button
          type="button"
          className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10">
            <ArrowLeft className="h-4 w-4" />
          </span>
          Collapse
        </button>
      </div>
    </aside>
  )
}
