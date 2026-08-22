'use client'

import {
  BarChart3, BookOpen, BrainCircuit, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, ClipboardList, History, LayoutDashboard, LineChart, LogOut,
  MessageSquare, Settings2, Sparkles, X, Zap,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useState } from 'react'
import type { Page } from '@/lib/navigation'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { getPlanDisplayLabel } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { BrandIcon } from '@/shared/components/BrandLogo'

interface Props {
  currentPage: Page
  onNavigate:  (page: Page) => void
  mobileOpen?: boolean
  onClose?:    () => void
  /** Rail déplié (desktop) — piloté par AppShell */
  expanded?:   boolean
  onToggleExpanded?: () => void
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

type NavEntry = NavLeaf | NavGroup

/** Sections nommées, façon « Main / Trading & Bots / … » de la référence. */
type NavSection = { section: string; entries: NavEntry[] }

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Pilotage',
    entries: [
      { icon: LayoutDashboard, label: "Vue d'ensemble", page: 'dashboard' },
      { icon: LineChart,       label: 'Performance',     page: 'performance' },
      { icon: BarChart3,       label: 'Statistiques',    page: 'statistiques' },
    ],
  },
  {
    section: 'Trading',
    entries: [
      { icon: BookOpen,      label: 'Journal de Trading', page: 'journal' },
      { icon: ClipboardList, label: 'Plan de Trading',    page: 'tradingPlan' },
      { icon: Clock3,        label: 'Comptes',            page: 'comptes' },
    ],
  },
  {
    section: 'IA & Analyses',
    entries: [
      {
        type: 'group',
        icon: Sparkles,
        label: 'Assistant IA',
        badge: 'IA',
        defaultOpen: true,
        items: [
          { icon: Sparkles,      label: 'Accueil IA', page: 'iaHome' },
          { icon: BrainCircuit,  label: 'Validateur de Stratégie', page: 'iaStrategyValidator' },
          { icon: MessageSquare, label: 'Chat IA', page: 'iaChat', badge: 'Elite' },
          { icon: History,       label: 'Historique', page: 'iaHistory' },
        ],
      },
    ],
  },
]

const BOTTOM_ENTRIES: NavLeaf[] = [
  { icon: Settings2, label: 'Paramètres', page: 'settings' },
]

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'type' in entry && entry.type === 'group'
}

function getEntryPages(entry: NavEntry): Page[] {
  return isNavGroup(entry) ? entry.items.map((item) => item.page) : [entry.page]
}

/** Bouton d'un rail replié : icône centrée + tooltip au survol. */
function RailButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: ElementType
  label: string
  active: boolean
  disabled?: boolean | undefined
  onClick: () => void
}) {
  return (
    <div className="group relative flex justify-center">
      <button
        type="button"
        onClick={() => !disabled && onClick()}
        disabled={disabled}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          active
            ? 'bg-primary/15 text-primary'
            : disabled
              ? 'cursor-default text-muted-foreground/40'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md group-hover:block"
      >
        {label}
      </span>
    </div>
  )
}

export function Sidebar({
  currentPage,
  onNavigate,
  mobileOpen = false,
  onClose,
  expanded = false,
  onToggleExpanded,
}: Props) {
  const { data: user } = useCurrentUser()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const planLabel = user?.plan ? getPlanDisplayLabel(user.plan) : null
  const isPro = user?.plan && user.plan !== 'FREE'
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : 'Trader'
  const initials = displayName.slice(0, 2).toUpperCase()

  // Sur mobile le tiroir s'ouvre toujours déplié.
  const open = expanded || mobileOpen

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-card',
        'transition-all duration-300 ease-in-out',
        open ? 'w-64' : 'w-[72px]',
        mobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full',
      )}
    >
      {/* Bouton de repli — pastille ronde à cheval sur la bordure */}
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-label={expanded ? 'Replier la navigation' : 'Déplier la navigation'}
        className="absolute -right-3 top-6 z-30 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground lg:flex"
      >
        {expanded ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Logo */}
      <div className={cn('flex h-16 shrink-0 items-center gap-3', open ? 'px-4' : 'justify-center px-0')}>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          <BrandIcon className="h-[22px] w-[22px]" />
        </div>
        {open && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold leading-tight text-foreground">MERKURE</p>
            <p className="truncate text-xs text-muted-foreground">Trading Analytics</p>
          </div>
        )}
        {mobileOpen && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:thin]', open ? 'px-3' : 'px-0')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.section} className={cn(open ? 'mb-1' : 'mb-2')}>
            {open ? (
              <p className="px-3 py-2 text-xs font-normal text-muted-foreground">{section.section}</p>
            ) : (
              <div className="mx-4 my-2 h-px bg-border first:hidden" />
            )}

            <div className={cn(open ? 'space-y-1' : 'space-y-1')}>
              {section.entries.map((entry) => {
                const entryPages = getEntryPages(entry)
                const activeGroup = entryPages.includes(currentPage)

                if (isNavGroup(entry)) {
                  const Icon = entry.icon
                  const groupOpen = openGroups[entry.label] ?? entry.defaultOpen ?? activeGroup

                  if (!open) {
                    const firstItem = entry.items[0]
                    return (
                      <RailButton
                        key={entry.label}
                        icon={Icon}
                        label={entry.label}
                        active={activeGroup}
                        onClick={() => firstItem && onNavigate(firstItem.page)}
                      />
                    )
                  }

                  return (
                    <div key={entry.label} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setOpenGroups((state) => ({ ...state, [entry.label]: !groupOpen }))}
                        aria-expanded={groupOpen}
                        className={cn(
                          'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                          activeGroup
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 truncate text-left">{entry.label}</span>
                        {entry.badge && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                            {entry.badge}
                          </span>
                        )}
                        <ChevronDown
                          className="h-4 w-4 shrink-0 transition-transform duration-200"
                          style={{ transform: groupOpen ? 'rotate(180deg)' : undefined }}
                        />
                      </button>

                      {groupOpen && (
                        <div className="space-y-1 pl-4">
                          {entry.items.map(({ icon: ItemIcon, label, page, badge, disabled }) => {
                            const active = currentPage === page
                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() => !disabled && onNavigate(page)}
                                disabled={disabled}
                                className={cn(
                                  'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                                  active
                                    ? 'bg-primary/15 font-medium text-primary'
                                    : disabled
                                      ? 'cursor-default text-muted-foreground/40'
                                      : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                                )}
                              >
                                <ItemIcon className="h-4 w-4 shrink-0" />
                                <span className="flex-1 truncate text-left">{label}</span>
                                {badge && (
                                  <span className="rounded border border-border px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
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

                if (!open) {
                  return (
                    <RailButton
                      key={entry.page + entry.label}
                      icon={Icon}
                      label={entry.label}
                      active={active}
                      disabled={entry.disabled}
                      onClick={() => onNavigate(entry.page)}
                    />
                  )
                }

                return (
                  <button
                    key={entry.page + entry.label}
                    type="button"
                    onClick={() => !entry.disabled && onNavigate(entry.page)}
                    disabled={entry.disabled}
                    className={cn(
                      'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/15 text-primary'
                        : entry.disabled
                          ? 'cursor-default text-muted-foreground/40'
                          : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 truncate text-left">{entry.label}</span>
                    {entry.badge && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                        {entry.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Upsell (plans gratuits uniquement) */}
      {!isPro && open && (
        <div className="mx-3 mb-3 rounded-lg border border-border bg-secondary/40 p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">Passer à Pro</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            IA complète, alertes temps réel et rapports avancés.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voir les plans <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bas de rail : réglages, déconnexion, utilisateur */}
      <div className="shrink-0 border-t border-border py-2">
        <div className={cn(open ? 'space-y-1 px-3' : 'space-y-1')}>
          {BOTTOM_ENTRIES.map(({ icon: Icon, label, page }) => {
            const active = currentPage === page
            return open ? (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                className={cn(
                  'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                  active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate text-left">{label}</span>
              </button>
            ) : (
              <RailButton key={page} icon={Icon} label={label} active={active} onClick={() => onNavigate(page)} />
            )
          })}

          {open ? (
            <a
              href="/sign-in"
              className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 truncate text-left">Déconnexion</span>
            </a>
          ) : (
            <RailButton icon={LogOut} label="Déconnexion" active={false} onClick={() => { window.location.href = '/sign-in' }} />
          )}
        </div>

        <div className={cn('mt-2 border-t border-border pt-2', open ? 'px-3' : 'px-0')}>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg transition-colors hover:bg-secondary/70',
              open ? 'px-3 py-2' : 'justify-center py-2',
            )}
            aria-label={`Profil de ${displayName}`}
          >
            {user?.avatarUrl ? (
              <div
                className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {initials}
              </div>
            )}
            {open && (
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{planLabel ?? 'Plan Gratuit'}</p>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
