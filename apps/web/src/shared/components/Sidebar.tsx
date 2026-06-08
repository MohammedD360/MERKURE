'use client'

import {
  LayoutDashboard, Sparkles, ShieldAlert, Trophy,
  GraduationCap, BookOpen, Settings2,
  X, ChevronDown, ChevronRight, Zap,
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

const NAV_ITEMS: Array<{ icon: ElementType; label: string; page: Page; badge?: string; soon?: boolean }> = [
  { icon: LayoutDashboard, label: 'Tableau de bord',    page: 'dashboard'   },
  { icon: Sparkles,        label: 'Trading & IA',       page: 'ia',         badge: 'IA' },
  { icon: ShieldAlert,     label: 'Gestion des Risques',page: 'performance' },
  { icon: Trophy,          label: 'Prop Firm Center',   page: 'iaPropfirm'  },
  { icon: GraduationCap,   label: 'Académie',           page: 'iaCoach',    soon: true  },
  { icon: BookOpen,        label: 'Ressources',         page: 'rapports'    },
  { icon: Settings2,       label: 'Paramètres',         page: 'settings'    },
]

export function Sidebar({ currentPage, onNavigate, mobileOpen = false, onClose }: Props) {
  const { data: user } = useCurrentUser()
  const planLabel  = user?.plan ? getPlanDisplayLabel(user.plan) : null
  const isPro      = user?.plan && user.plan !== 'FREE'
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : 'Trader'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-30 flex h-screen w-64 flex-col overflow-hidden',
      'border-r border-white/[0.06] bg-[#080B14]',
      'transition-transform duration-200 lg:translate-x-0',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
    )}>

      {/* Logo */}
      <div className="flex h-[70px] shrink-0 items-center justify-between px-5">
        <BrandLogo
          className="gap-3 text-white"
          iconClassName="h-8 w-8 text-[#534AB7]"
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
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, page, badge, soon }) => {
            const active = currentPage === page
            return (
              <button
                key={page + label}
                type="button"
                onClick={() => !soon && onNavigate(page)}
                disabled={soon}
                className={cn(
                  'group relative flex min-h-[42px] w-full items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  active
                    ? 'bg-[#534AB7]/15 text-white'
                    : soon
                      ? 'cursor-default text-slate-700'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                )}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[#534AB7]" />
                )}

                <Icon className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-[#7B6FCC]' : soon ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-300',
                )} />

                <span className="flex-1 truncate font-semibold">{label}</span>

                {badge && !soon && (
                  <span className="rounded-full bg-[#534AB7] px-2 py-0.5 text-[9px] font-black text-white">
                    {badge}
                  </span>
                )}
                {soon && (
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                    bientôt
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
          background: 'linear-gradient(135deg, #1a1540 0%, #0D1021 100%)',
          border: '1px solid rgba(83,74,183,0.35)',
        }}>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-[#7B6FCC]" />
            <p className="text-xs font-black text-white">Passer à Pro</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            Débloquez l'IA complète, les alertes temps réel et les rapports avancés.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('billing')}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#534AB7' }}
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
          className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.04]"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {user?.avatarUrl ? (
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center ring-1 ring-white/10"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#534AB7]/30 text-sm font-black text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-bold text-white">{displayName}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">{planLabel ?? 'Plan Gratuit'}</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-600" />
        </button>
      </div>
    </aside>
  )
}
