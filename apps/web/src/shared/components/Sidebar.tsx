'use client'

import {
  LayoutDashboard, Wallet, BriefcaseBusiness, TrendingUp, ArrowLeftRight,
  BarChart2, PieChart, FileText, NotebookPen, Sparkles, Brain, Target,
  CreditCard, Bell, Settings2, X, ChevronRight,
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
      { icon: Sparkles,       label: 'Vue IA',     page: 'ia', badge: 'NEW' },
      { icon: Brain,          label: 'Biais',      page: 'iaBiais' },
      { icon: FileText,       label: 'Rapport IA', page: 'iaRapport' },
      { icon: Bell,           label: 'Coach',      page: 'iaCoach' },
      { icon: ArrowLeftRight, label: 'Simulation', page: 'iaSimulation' },
      { icon: BarChart2,      label: 'Benchmark',  page: 'iaBenchmark' },
      { icon: Target,         label: 'Prop firms', page: 'iaPropfirm' },
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

export function Sidebar({ currentPage, onNavigate, mobileOpen = false, onClose }: Props) {
  const { data: user } = useCurrentUser()
  const planLabel = user?.plan ? getPlanDisplayLabel(user.plan) : null

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-hidden',
      'border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]',
      'transition-transform duration-200 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
        <BrandLogo
          className="gap-2.5 text-[hsl(var(--sidebar-foreground))]"
          iconClassName="h-7 w-7 text-[hsl(var(--sidebar-primary))]"
          textClassName="text-[15px] font-black tracking-[0.14em]"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--sidebar-foreground)/0.4)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))] lg:hidden transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
        <div className="space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--sidebar-foreground)/0.35)]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ icon: Icon, label, page, badge, soon }) => {
                  const active = currentPage === page
                  return (
                    <button
                      key={page}
                      onClick={() => !soon && onNavigate(page)}
                      disabled={soon}
                      className={cn(
                        'group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                        active
                          ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] font-medium'
                          : soon
                            ? 'cursor-default text-[hsl(var(--sidebar-foreground)/0.2)]'
                            : 'text-[hsl(var(--sidebar-foreground)/0.55)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]',
                      )}
                    >
                      <Icon className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active
                          ? 'text-[hsl(var(--sidebar-primary))]'
                          : soon
                            ? 'text-[hsl(var(--sidebar-foreground)/0.15)]'
                            : 'text-[hsl(var(--sidebar-foreground)/0.35)] group-hover:text-[hsl(var(--sidebar-foreground)/0.6)]',
                      )} />
                      <span className="flex-1 truncate">{label}</span>

                      {badge && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-[hsl(var(--sidebar-primary)/0.15)] text-[hsl(var(--sidebar-primary))]">
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
      {user && (
        <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] p-2">
          <button
            onClick={() => onNavigate('profile')}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-[hsl(var(--sidebar-accent))]"
          >
            {user.avatarUrl ? (
              <div
                className="h-7 w-7 shrink-0 rounded-full bg-cover bg-center ring-1 ring-[hsl(var(--sidebar-border))]"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sidebar-primary)/0.15)] text-[11px] font-bold text-[hsl(var(--sidebar-primary))]">
                {(user.firstName?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[hsl(var(--sidebar-foreground))]">
                {user.firstName
                  ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
                  : (user.email ?? '—')}
              </p>
              {planLabel && (
                <p className="text-[10px] text-[hsl(var(--sidebar-foreground)/0.35)]">{planLabel}</p>
              )}
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--sidebar-foreground)/0.25)]" />
          </button>
        </div>
      )}
    </aside>
  )
}
