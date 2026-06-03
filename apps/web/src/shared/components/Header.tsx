'use client'

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, ChevronDown, Menu, Sun, Moon } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { clearToken } from '@/lib/api-client'
import { useTheme } from '@/lib/context/theme-context'
import { getPlanDisplayLabel } from '@/lib/plans'
import { useAlerts } from '@/lib/hooks/use-alerts'

interface HeaderProps {
  title:       string
  description: string
  onMenuClick?: () => void
}

const SEARCH_ITEMS = [
  { title: 'Vue d’ensemble', description: 'Performance, risque et comptes', href: '/app/dashboard', keywords: ['dashboard', 'tableau de bord', 'pilotage'] },
  { title: 'Comptes', description: 'Brokers connectés et synchronisation', href: '/app/accounts', keywords: ['broker', 'connexion', 'sync'] },
  { title: 'Portefeuille', description: 'Exposition, positions ouvertes et equity', href: '/app/portefeuille', keywords: ['capital', 'exposition', 'equity'] },
  { title: 'Positions', description: 'Risque et positions ouvertes', href: '/app/positions', keywords: ['risque', 'positions'] },
  { title: 'Transactions', description: 'Historique des trades', href: '/app/trades', keywords: ['trades', 'historique'] },
  { title: 'Performance', description: 'Analyse détaillée des résultats', href: '/app/performance', keywords: ['pnl', 'drawdown', 'analyse'] },
  { title: 'Statistiques', description: 'Bilan mensuel, instruments et séries', href: '/app/statistiques', keywords: ['stats', 'mensuel'] },
  { title: 'Journal', description: 'Revue de session et annotations', href: '/app/journal', keywords: ['notes', 'mindset', 'session'] },
  { title: 'Rapports', description: 'Exports et rapports PDF', href: '/app/reports', keywords: ['pdf', 'export'] },
  { title: 'Vue IA', description: 'Modules IA et coaching comportemental', href: '/app/ia', keywords: ['ia', 'intelligence artificielle'] },
  { title: 'Biais comportementaux', description: 'Revenge trading et overtrading', href: '/app/ia/biais', keywords: ['biais', 'revenge', 'overtrading'] },
  { title: 'Rapport IA', description: 'Synthèse narrative hebdomadaire', href: '/app/ia/rapport', keywords: ['rapport', 'hebdomadaire'] },
  { title: 'Coach IA', description: 'Alertes de discipline', href: '/app/ia/coach', keywords: ['coach', 'discipline'] },
  { title: 'Simulation', description: 'Scénarios et what-if', href: '/app/ia/simulation', keywords: ['simulation', 'what if', 'backtest'] },
  { title: 'Benchmark', description: 'Comparaison anonymisée', href: '/app/ia/benchmark', keywords: ['benchmark', 'classement'] },
  { title: 'Prop firms', description: 'Compatibilité avec votre profil', href: '/app/ia/propfirm', keywords: ['prop firm', 'challenge'] },
  { title: 'Alertes', description: 'Notifications de risque et synchronisation', href: '/app/alerts', keywords: ['notification', 'cloche'] },
  { title: 'Abonnement', description: 'Plan et facturation', href: '/app/billing', keywords: ['billing', 'tarif', 'stripe'] },
  { title: 'Paramètres', description: 'Préférences produit', href: '/app/settings', keywords: ['settings', 'préférences'] },
  { title: 'Profil', description: 'Identité, photo et sécurité', href: '/app/profile', keywords: ['avatar', 'mot de passe'] },
]

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const { data: user } = useCurrentUser()
  const { data: unreadAlertsData } = useAlerts(true)
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const unreadAlertsCount = unreadAlertsData?.total ?? 0

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : (user?.email?.split('@')[0] ?? '—')
  const initials  = displayName.slice(0, 2).toUpperCase()
  const modeLabel = user?.authMode === 'clerk' ? getPlanDisplayLabel(user.plan) : 'Mode démo'
  const avatarStyle = user?.avatarUrl
    ? { backgroundImage: `url(${user.avatarUrl})` }
    : undefined

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0)
    } else {
      setSearchQuery('')
    }
  }, [searchOpen])

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const items = query
      ? SEARCH_ITEMS.filter((item) => {
          const haystack = [
            item.title,
            item.description,
            ...item.keywords,
          ].join(' ').toLowerCase()
          return haystack.includes(query)
        })
      : SEARCH_ITEMS.slice(0, 8)

    return items.slice(0, 8)
  }, [searchQuery])

  const navigateTo = (href: string) => {
    setSearchOpen(false)
    setMenuOpen(false)
    router.push(href)
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const firstResult = searchResults[0]
    if (firstResult) navigateTo(firstResult.href)
  }

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('merkure_token') : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/logout`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch { /* best-effort */ }
    clearToken()
    router.push('/sign-in')
  }

  const btnBase = isLight
    ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white'

  return (
    <header
      className="sticky top-0 z-10 flex min-h-16 flex-shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur sm:px-6 transition-colors duration-200"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors lg:hidden ${btnBase}`}
          aria-label="Ouvrir la navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1
            className="truncate text-lg font-bold leading-none sm:text-xl"
            style={{ color: 'var(--text-base)' }}
          >
            {title}
          </h1>
          <p
            className="mt-1.5 hidden truncate text-sm sm:block"
            style={{ color: 'var(--text-subtle)' }}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div ref={searchRef} className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${btnBase}`}
            aria-label="Rechercher une page"
            aria-expanded={searchOpen}
            title="Rechercher une page (Ctrl K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {searchOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
              style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}
            >
              <form onSubmit={handleSearchSubmit} className="border-b p-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border-color)', background: 'var(--app-bg)' }}>
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Rechercher une page, un module, un rapport..."
                    className="w-full bg-transparent text-sm font-semibold text-[var(--text-base)] outline-none placeholder:text-slate-600"
                  />
                </div>
              </form>

              <div className="max-h-80 overflow-y-auto p-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => navigateTo(item.href)}
                      className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black" style={{ color: 'var(--text-base)' }}>{item.title}</span>
                        <span className="mt-0.5 block truncate text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>{item.description}</span>
                      </span>
                      <span className="text-xs font-black text-slate-600 transition-colors group-hover:text-[#56bf6b]">Entrer</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-black" style={{ color: 'var(--text-base)' }}>Aucun résultat</p>
                    <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>Essayez “journal”, “alertes” ou “simulation”.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${btnBase}`}
          title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => router.push('/app/alerts')}
          className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${btnBase}`}
          aria-label={unreadAlertsCount > 0 ? `Voir ${unreadAlertsCount} alertes non lues` : 'Voir les alertes'}
          title={unreadAlertsCount > 0 ? `${unreadAlertsCount} alerte${unreadAlertsCount > 1 ? 's' : ''} non lue${unreadAlertsCount > 1 ? 's' : ''}` : 'Aucune alerte non lue'}
        >
          <Bell className="h-4 w-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#56bf6b] px-1 text-[10px] font-black text-white">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </button>

        <div className="mx-1 hidden h-8 w-px sm:block" style={{ background: 'var(--border-color)' }} />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-black/[0.04] sm:px-2"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold leading-none" style={{ color: 'var(--text-base)' }}>{displayName}</div>
              <div className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>{modeLabel}</div>
            </div>
            <div
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 bg-cover bg-center text-xs font-bold text-white"
              style={avatarStyle}
              aria-label={`Profil de ${displayName}`}
            >
              {!user?.avatarUrl && initials}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200" style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
              style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--text-base)' }}>{user?.email ?? '—'}</div>
                <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-subtle)' }}>{modeLabel}</div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push('/app/profile')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors hover:bg-black/[0.04]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <User className="h-3.5 w-3.5" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-[#ff5e70]/80 transition-colors hover:bg-[#ff5e70]/[0.06] hover:text-[#ff5e70]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
