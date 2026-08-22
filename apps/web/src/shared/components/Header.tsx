'use client'

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, ChevronDown, Menu, Moon, RefreshCw, Sun, Command } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { clearToken } from '@/lib/api-client'
import { getPlanDisplayLabel } from '@/lib/plans'
import { useAlerts } from '@/lib/hooks/use-alerts'
import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'
import { useKpiSummary } from '@/lib/hooks/use-kpis'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AppTheme } from '@/lib/hooks/use-app-theme'

interface HeaderProps {
  title:       string
  description: string
  onMenuClick?: () => void
  theme?:         AppTheme
  onToggleTheme?: () => void
  /** false pendant le rendu serveur : on n'affiche pas encore d'icône orientée */
  themeReady?:    boolean
}

const SEARCH_ITEMS = [
  { title: "Vue d'ensemble", description: 'Performance, risque et comptes', href: "/app/dashboard", keywords: ["dashboard", "tableau de bord", "pilotage"] },
  { title: "Comptes", description: "Brokers connectés et synchronisation", href: "/app/accounts", keywords: ["broker", "connexion", "sync"] },
  { title: "Portefeuille", description: "Exposition, positions ouvertes et equity", href: "/app/portefeuille", keywords: ["capital", "exposition", "equity"] },
  { title: "Positions", description: "Risque et positions ouvertes", href: "/app/positions", keywords: ["risque", 'positions'] },
  { title: "Transactions", description: "Historique des trades", href: "/app/trades", keywords: ["trades", 'historique'] },
  { title: "Performance", description: "Analyse détaillée des résultats", href: "/app/performance", keywords: ["pnl", "drawdown", "analyse"] },
  { title: "Statistiques", description: "Bilan mensuel, instruments et séries", href: "/app/statistiques", keywords: ["stats", 'mensuel'] },
  { title: "Journal", description: "Revue de session et annotations", href: "/app/journal", keywords: ["notes", "mindset", "session"] },
  { title: "Plan de Trading", description: "Plan, règles, risque et checklist", href: "/app/trading-plan", keywords: ["plan", "playbook", "règles", "checklist"] },
  { title: "Rapports", description: "Exports et rapports PDF", href: "/app/reports", keywords: ["pdf", 'export'] },
  { title: "Validateur de Stratégie", description: "Contrôle des règles et du risque", href: "/app/ia/strategy-validator", keywords: ["stratégie", "validation", "setup"] },
  { title: "Chat IA", description: "Assistant Elite pour interroger vos données", href: "/app/ia/chat", keywords: ["chat", "assistant", "elite"] },
  { title: "Historique IA", description: "Archives des analyses et recommandations", href: "/app/ia/history", keywords: ["historique", "analyse", "ia"] },
  { title: "Biais comportementaux", description: "Revenge trading et overtrading", href: "/app/ia/biais", keywords: ["biais", "revenge", "overtrading"] },
  { title: "Coach IA", description: "Alertes de discipline", href: "/app/ia/coach", keywords: ["coach", 'discipline'] },
  { title: "Simulation", description: "Scénarios et what-if", href: "/app/ia/simulation", keywords: ["simulation", "what if", "backtest"] },
  { title: "Benchmark", description: "Comparaison anonymisée", href: "/app/ia/benchmark", keywords: ["benchmark", 'classement'] },
  { title: "Prop firms", description: "Compatibilité avec votre profil", href: "/app/ia/propfirm", keywords: ["prop firm", 'challenge'] },
  { title: "Bot Trading", description: "Supervision des automatisations", href: "/app/bots", keywords: ["bot", "trading automatique", "algo"] },
  { title: "Créer un Bot", description: "Configurer une automatisation", href: "/app/bots/create", keywords: ["bot", "créer", "automatisation"] },
  { title: "Performance des Bots", description: "Résultats et stabilité des bots", href: "/app/bots/performance", keywords: ["bot", "performance", "drawdown"] },
  { title: "Trades Auto", description: "Historique des exécutions automatiques", href: "/app/bots/history", keywords: ["bot", "historique", "trades auto"] },
  { title: "Alertes", description: "Notifications de risque et synchronisation", href: "/app/alerts", keywords: ["notification", 'cloche'] },
  { title: "Abonnement", description: "Plan et facturation", href: "/app/billing", keywords: ["billing", "tarif", "stripe"] },
  { title: "Paramètres", description: "Préférences produit", href: "/app/settings", keywords: ["settings", 'préférences'] },
  { title: "Profil", description: "Identité, photo et sécurité", href: "/app/profile", keywords: ["avatar", 'mot de passe'] },
]

/** Pastille façon ticker de marché : libellé + valeur + variation. */
function TickerPill({
  label,
  value,
  delta,
  deltaTone = 'neutral',
}: {
  label: string
  value: string
  delta?: string | undefined
  deltaTone?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-border px-4">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
      {delta && (
        <span
          className={cn(
            'text-sm',
            deltaTone === 'up' ? 'text-green-500' : deltaTone === 'down' ? 'text-red-500' : 'text-muted-foreground',
          )}
        >
          {delta}
        </span>
      )}
    </div>
  )
}

export function Header({ title, onMenuClick, theme = 'dark', onToggleTheme, themeReady = false }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef        = useRef<HTMLDivElement>(null)
  const searchRef      = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const { data: accounts = [] } = useAccounts()
  const sync = useSyncAccount()
  const { data: unreadAlertsData } = useAlerts(true)
  const unreadAlertsCount = unreadAlertsData?.total ?? 0
  const { data: kpis } = useKpiSummary('30d')
  const currency = useCurrency()

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : (user?.email?.split('@')[0] ?? '—')
  const initials  = displayName.slice(0, 2).toUpperCase()
  const modeLabel = user?.authMode === "clerk" ? getPlanDisplayLabel(user.plan) : "Mode démo"
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
      if (event.key === 'Escape') setSearchOpen(false)
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
          const haystack = [item.title, item.description, ...item.keywords].join(' ').toLowerCase()
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

  const handleSync = () => {
    const account = accounts.find((item) => item.isActive) ?? accounts[0]
    if (!account) {
      router.push('/app/accounts')
      return
    }
    sync.mutate(account.id)
  }

  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("merkure_token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/logout`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch { /* best-effort */ }
    clearToken()
    router.push('/sign-in')
  }

  const iconBtn = cn(
    'flex h-9 w-9 items-center justify-center rounded-md border border-border',
    'bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
  )

  const pnl = kpis?.totalPnl ?? null
  const winRate = kpis ? kpis.winRate * 100 : null

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:h-16 lg:px-6">

      {/* Gauche : menu mobile + recherche */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(iconBtn, 'lg:hidden')}
          aria-label="Ouvrir la navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div ref={searchRef} className="relative min-w-0 flex-1 sm:max-w-[340px]">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="flex h-10 w-10 min-w-0 max-w-full items-center justify-center overflow-hidden rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground sm:w-full sm:justify-start sm:gap-3 sm:px-4"
            aria-label="Rechercher une page"
            aria-expanded={searchOpen}
            title="Rechercher (⌘K)"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden min-w-0 flex-1 truncate text-left text-sm sm:block">Rechercher une page, un trade…</span>
            <span className="hidden shrink-0 items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs font-medium sm:inline-flex">
              <Command className="h-3 w-3" /> K
            </span>
          </button>

          {searchOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              <form onSubmit={handleSearchSubmit} className="border-b border-border p-3">
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Rechercher une page…"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
                      className="group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                      </span>
                      <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary">↵</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">Aucun résultat</p>
                    <p className="mt-1 text-xs text-muted-foreground">Essayez « journal », « alertes » ou « simulation ».</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centre : tickers de performance — masqués tant que la place manque */}
      <div className="hidden shrink-0 items-center gap-3 2xl:flex">
        <TickerPill
          label="P&L 30J"
          value={pnl == null ? '—' : formatMoney(pnl, { currency, signed: true })}
          delta={kpis && kpis.nbTrades > 0 ? `${kpis.nbTrades} trades` : undefined}
          deltaTone={pnl == null ? 'neutral' : pnl >= 0 ? 'up' : 'down'}
        />
        <TickerPill
          label="Win rate"
          value={winRate == null ? '—' : formatPercent(winRate)}
          delta={winRate == null ? undefined : winRate >= 50 ? '▲' : '▼'}
          deltaTone={winRate == null ? 'neutral' : winRate >= 50 ? 'up' : 'down'}
        />
      </div>

      {/* Droite : actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Fond sombre / clair */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={iconBtn}
            aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
            aria-pressed={theme === 'light'}
            title={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
          >
            {!themeReady ? (
              <span className="h-4 w-4" />
            ) : theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Cloche */}
        <button
          type="button"
          onClick={() => router.push('/app/alerts')}
          className={cn(iconBtn, 'relative')}
          aria-label={unreadAlertsCount > 0 ? `${unreadAlertsCount} alertes non lues` : 'Alertes'}
        >
          <Bell className="h-4 w-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleSync}
          disabled={sync.isPending}
          className="hidden h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:inline-flex"
        >
          <RefreshCw className={cn('h-4 w-4', sync.isPending && 'animate-spin')} />
          Synchroniser
        </button>

        {/* Menu utilisateur */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-accent"
            aria-label={`Profil de ${displayName}`}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary bg-cover bg-center text-xs font-semibold text-foreground"
              style={avatarStyle}
            >
              {!user?.avatarUrl && initials}
            </div>
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground lg:block">{displayName}</span>
            <ChevronDown
              className="hidden h-4 w-4 text-muted-foreground transition-transform duration-200 sm:block"
              style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <div className="truncate text-sm font-medium text-foreground">{displayName}</div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email ?? modeLabel}</div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => { setMenuOpen(false); router.push('/app/profile') }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-red-500 transition-colors hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <span className="sr-only">{title}</span>
    </header>
  )
}
