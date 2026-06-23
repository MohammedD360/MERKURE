'use client'

import {
  BarChart3, Bot, BookOpen, BrainCircuit, ChevronDown, ChevronRight,
  Clock3, ClipboardList, FileText, History, LayoutDashboard, LineChart,
  MessageSquare, PlusCircle, Settings2, Sparkles, Trophy, X, Zap,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useState } from 'react'
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

type NavLeaf = {
  icon: ElementType
  label: string
  page: Page
  badge?: string
  disabled?: boolean
}

type NavGroup = {
  type: 'group'
  icon: ElementType
  label: string
  badge?: string
  defaultOpen?: boolean
  items: NavLeaf[]
}

type NavEntry =
  | NavLeaf
  | NavGroup

const NAV_ITEMS: NavEntry[] = [
  {
    type: 'group',
    icon: LayoutDashboard,
    label: 'Dashboard',
    defaultOpen: true,
    items: [
      { icon: LayoutDashboard, label: "Vue d'ensemble", page: 'dashboard' },
      { icon: LineChart,       label: 'Performance',     page: 'performance' },
      { icon: BarChart3,       label: 'Statistiques',    page: 'statistiques' },
      { icon: BookOpen,        label: 'Journal de Trading', page: 'journal' },
      { icon: ClipboardList,   label: 'Plan de Trading',    page: 'tradingPlan' },
    ],
  },
  {
    type: 'group',
    icon: Sparkles,
    label: 'IA & Analyses',
    badge: 'IA',
    items: [
      { icon: FileText,     label: 'Rapport de Performance', page: 'iaRapport' },
      { icon: BrainCircuit, label: 'Validateur de Stratégie', page: 'iaStrategyValidator' },
      { icon: MessageSquare,label: 'Chat IA', page: 'iaChat', badge: 'Elite' },
      { icon: History,      label: 'Historique', page: 'iaHistory' },
    ],
  },
  { icon: Trophy, label: 'Prop Firm', page: 'iaPropfirm' },
  { icon: Clock3, label: 'Comptes',   page: 'comptes' },
  {
    type: 'group',
    icon: Bot,
    label: 'Bot Trading',
    badge: 'Nouveau',
    items: [
      { icon: Bot,        label: 'Mes Bots', page: 'botTrading' },
      { icon: PlusCircle, label: 'Créer un Bot', page: 'botCreate' },
      { icon: LineChart,  label: 'Performance des Bots', page: 'botPerformance' },
      { icon: History,    label: 'Historique des Trades Auto', page: 'botHistory' },
    ],
  },
  { icon: Settings2, label: 'Paramètres', page: 'settings' },
]

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'type' in entry && entry.type === 'group'
}

function getEntryPages(entry: NavEntry): Page[] {
  return isNavGroup(entry)
    ? entry.items.map((item) => item.page)
    : [entry.page]
}

export function Sidebar({ currentPage, onNavigate, mobileOpen = false, onClose }: Props) {
  const { data: user } = useCurrentUser()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const planLabel  = user?.plan ? getPlanDisplayLabel(user.plan) : null
  const isPro      = user?.plan && user.plan !== 'FREE'
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : 'Trader'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-hidden',
      'border-r border-[hsl(var(--border))] bg-background',
      'transition-transform duration-200 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>

      {/* Logo */}
      <div className="flex h-[70px] shrink-0 items-center justify-between px-5">
        <BrandLogo
          className="gap-3 text-foreground"
          iconClassName="h-8 w-8 text-[hsl(var(--primary))]"
          textClassName="text-lg font-black tracking-[0.12em]"
        />
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--foreground-soft))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground lg:hidden"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((entry) => {
            const entryPages = getEntryPages(entry)
            const activeGroup = entryPages.includes(currentPage)

            if (isNavGroup(entry)) {
              const Icon = entry.icon
              const open = openGroups[entry.label] ?? activeGroup ?? entry.defaultOpen ?? false

              return (
                <div key={entry.label} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setOpenGroups((state) => ({ ...state, [entry.label]: !open }))}
                    className={cn(
                      'group flex min-h-[42px] w-full items-center gap-3 rounded-md px-3 text-sm transition-colors',
                      activeGroup
                        ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                        : 'text-foreground/60 hover:bg-[hsl(var(--accent))] hover:text-foreground',
                    )}
                    aria-expanded={open}
                  >
                    <Icon className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      activeGroup ? 'text-[hsl(var(--primary))]' : 'text-foreground/40 group-hover:text-foreground/70',
                    )} />
                    <span className="flex-1 truncate text-left font-semibold">{entry.label}</span>
                    {entry.badge && (
                      <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-black text-white">
                        {entry.badge}
                      </span>
                    )}
                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform"
                      style={{ transform: open ? 'rotate(180deg)' : undefined }}
                    />
                  </button>

                  {open && (
                    <div className="space-y-0.5 pl-4">
                      {entry.items.map(({ icon: ItemIcon, label, page, badge, disabled }) => {
                        const active = currentPage === page
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => !disabled && onNavigate(page)}
                            disabled={disabled}
                            className={cn(
                              'group relative flex min-h-[36px] w-full items-center gap-2.5 rounded-md px-3 text-xs transition-colors',
                              active
                                ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                                : disabled
                                  ? 'cursor-default text-foreground/30'
                                  : 'text-foreground/55 hover:bg-[hsl(var(--accent))] hover:text-foreground',
                            )}
                          >
                            {active && (
                              <span className="absolute inset-y-1 left-0 w-[2px] rounded-r-full bg-[hsl(var(--primary))]" />
                            )}
                            <ItemIcon className={cn(
                              'h-3.5 w-3.5 shrink-0',
                              active ? 'text-[hsl(var(--primary))]' : 'text-foreground/35 group-hover:text-foreground/60',
                            )} />
                            <span className="flex-1 truncate text-left font-semibold">{label}</span>
                            {badge && (
                              <span className="rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                                {badge}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const Icon = entry.icon
            const active = currentPage === entry.page

            return (
              <button
                key={entry.page + entry.label}
                type="button"
                onClick={() => !entry.disabled && onNavigate(entry.page)}
                disabled={entry.disabled}
                className={cn(
                  'group relative flex min-h-[42px] w-full items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  active
                    ? 'bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                    : entry.disabled
                      ? 'cursor-default text-foreground/30'
                      : 'text-foreground/60 hover:bg-[hsl(var(--accent))] hover:text-foreground',
                )}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[hsl(var(--primary))]" />
                )}
                <Icon className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-[hsl(var(--primary))]' : 'text-foreground/40 group-hover:text-foreground/70',
                )} />
                <span className="flex-1 truncate text-left font-semibold">{entry.label}</span>
                {entry.badge && (
                  <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-black text-white">
                    {entry.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Premium CTA (FREE users only) */}
      {!isPro && (
        <div className="mx-3 mb-3 overflow-hidden rounded-xl p-4" style={{
          background: 'linear-gradient(135deg, hsl(244 42% 22%) 0%, hsl(244 42% 14%) 100%)',
          border: '1px solid hsl(var(--primary)/0.35)',
        }}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
            <p className="text-xs font-black text-white">Passer à Pro</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/70">
            Débloquez l'IA complète, les alertes temps réel et les rapports avancés.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#6B63D4' }}
          >
            Voir les plans <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Footer: user info */}
      <div className="shrink-0 p-3">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="flex w-full items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--accent))]"
        >
          {user?.avatarUrl ? (
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center ring-1 ring-[hsl(var(--border))]"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-sm font-black text-[hsl(var(--primary))]">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
            <p className="mt-0.5 text-[10px] text-[hsl(var(--foreground-soft))]">{planLabel ?? 'Plan Gratuit'}</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--foreground-soft))]" />
        </button>
      </div>
    </aside>
  )
}
