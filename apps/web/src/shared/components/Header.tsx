'use client'

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, ChevronDown, Menu, RefreshCw, Upload, Command } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { clearToken } from '@/lib/api-client'
import { getPlanDisplayLabel } from '@/lib/plans'
import { useAlerts } from '@/lib/hooks/use-alerts'
import { useAccounts, useSyncAccount } from '@/lib/hooks/use-accounts'
import { cn } from '@/lib/utils'
import { CsvImportModal } from '@/features/trades/components/CsvImportModal'

interface HeaderProps {
  title:       string
  description: string
  onMenuClick?: () => void
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
  { title: "Rapports", description: "Exports et rapports PDF", href: "/app/reports", keywords: ["pdf", 'export'] },
  { title: "Vue IA", description: "Modules IA et coaching comportemental", href: "/app/ia", keywords: ["ia", 'intelligence artificielle'] },
  { title: "Rapport de Performance", description: "Synthèse IA de vos performances", href: "/app/ia/rapport", keywords: ["rapport", "performance", "ia"] },
  { title: "Validateur de Stratégie", description: "Contrôle des règles et du risque", href: "/app/ia/strategy-validator", keywords: ["stratégie", "validation", "setup"] },
  { title: "Chat IA", description: "Assistant Elite pour interroger vos données", href: "/app/ia/chat", keywords: ["chat", "assistant", "elite"] },
  { title: "Historique IA", description: "Archives des analyses et recommandations", href: "/app/ia/history", keywords: ["historique", "analyse", "ia"] },
  { title: "Biais comportementaux", description: "Revenge trading et overtrading", href: "/app/ia/biais", keywords: ["biais", "revenge", "overtrading"] },
  { title: "Coach IA", description: "Alertes de discipline", href: "/app/ia/coach", keywords: ["coach", 'discipline'] },
  { title: "Simulation", description: "Scénarios et what-if", href: "/app/ia/simulation", keywords: ["simulation", "what if", "backtest"] },
  { title: "Benchmark", description: "Comparaison anonymisée", href: "/app/ia/benchmark", keywords: ["benchmark", 'classement'] },
  { title: "Prop firms", description: "Compatibilité avec votre profil", href: "/app/ia/propfirm", keywords: ["prop firm", 'challenge'] },
  { title: "Académie", description: "Parcours et ressources de formation", href: "/app/academy", keywords: ["académie", "formation", "ressources"] },
  { title: "Bot Trading", description: "Supervision des automatisations", href: "/app/bots", keywords: ["bot", "trading automatique", "algo"] },
  { title: "Créer un Bot", description: "Configurer une automatisation", href: "/app/bots/create", keywords: ["bot", "créer", "automatisation"] },
  { title: "Performance des Bots", description: "Résultats et stabilité des bots", href: "/app/bots/performance", keywords: ["bot", "performance", "drawdown"] },
  { title: "Trades Auto", description: "Historique des exécutions automatiques", href: "/app/bots/history", keywords: ["bot", "historique", "trades auto"] },
  { title: "Alertes", description: "Notifications de risque et synchronisation", href: "/app/alerts", keywords: ["notification", 'cloche'] },
  { title: "Abonnement", description: "Plan et facturation", href: "/app/billing", keywords: ["billing", "tarif", "stripe"] },
  { title: "Paramètres", description: "Préférences produit", href: "/app/settings", keywords: ["settings", 'préférences'] },
  { title: "Profil", description: "Identité, photo et sécurité", href: "/app/profile", keywords: ["avatar", 'mot de passe'] },
]

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [csvOpen, setCsvOpen] = useState(false)
  const menuRef        = useRef<HTMLDivElement>(null)
  const searchRef      = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const { data: accounts = [] } = useAccounts()
  const sync = useSyncAccount()
  const { data: unreadAlertsData } = useAlerts(true)
  const unreadAlertsCount = unreadAlertsData?.total ?? 0

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
    'flex h-10 w-10 items-center justify-center rounded-md border border-[hsl(var(--border))]',
    'bg-white text-[hsl(var(--foreground-soft))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground',
  )

  return (
    <header className="sticky top-0 z-40 flex min-h-20 shrink-0 items-center justify-between gap-5 border-b border-[hsl(var(--border))] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* Left: hamburger + page title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(iconBtn, 'lg:hidden')}
          aria-label="Ouvrir la navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black leading-none tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 hidden truncate text-sm font-medium text-[hsl(var(--foreground-soft))] sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-2">

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className={cn(
              iconBtn,
              'w-10 justify-center gap-3 px-0 lg:w-64 lg:justify-start lg:px-4',
            )}
            aria-label="Rechercher une page"
            aria-expanded={searchOpen}
            title="Rechercher (Ctrl K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden flex-1 text-left text-sm font-medium text-[hsl(var(--foreground-soft))] lg:block">Rechercher...</span>
            <span className="hidden items-center gap-1 rounded border border-[hsl(var(--border))] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[hsl(var(--foreground-soft))] lg:inline-flex">
              <Command className="h-3 w-3" /> K
            </span>
          </button>

          {searchOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <form onSubmit={handleSearchSubmit} className="border-b border-border p-3">
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Rechercher une page…"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
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
                      <span className="text-xs text-muted-foreground/40 transition-colors group-hover:text-[hsl(var(--primary))]">↵</span>
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

        <button
          type="button"
          onClick={() => setCsvOpen(true)}
          className="hidden h-10 items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-white px-4 text-sm font-black text-foreground transition-colors hover:bg-[hsl(var(--accent))] xl:inline-flex"
        >
          <Upload className="h-4 w-4" />
          Importer CSV
        </button>

        <button
          type="button"
          onClick={handleSync}
          disabled={sync.isPending}
          className="hidden h-10 items-center gap-2 rounded-md bg-[hsl(var(--primary))] px-4 text-sm font-black text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.25)] transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-70 sm:inline-flex"
        >
          <RefreshCw className={cn("h-4 w-4", sync.isPending && "animate-spin")} />
          Synchroniser
        </button>

        {/* Bell */}
        <button
          type="button"
          onClick={() => router.push('/app/alerts')}
          className={cn(iconBtn, 'relative')}
          aria-label={unreadAlertsCount > 0 ? `${unreadAlertsCount} alertes non lues` : 'Alertes'}
        >
          <Bell className="h-4 w-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[9px] font-bold text-white">
              {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
            </span>
          )}
        </button>

        <div className="mx-2 hidden h-7 w-px bg-[hsl(var(--border))] sm:block" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-[hsl(var(--accent))]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] bg-cover bg-center text-sm font-black text-[hsl(var(--primary))]"
              style={avatarStyle}
              aria-label={`Profil de ${displayName}`}
            >
              {!user?.avatarUrl && initials}
            </div>
            <ChevronDown
              className="hidden h-3.5 w-3.5 text-[hsl(var(--foreground-soft))] transition-transform duration-200 sm:block"
              style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="border-b border-border px-4 py-3">
                <div className="truncate text-[11px] font-medium text-foreground">{user?.email ?? '—'}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{modeLabel}</div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => { setMenuOpen(false); router.push('/app/profile') }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <User className="h-3.5 w-3.5" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </header>
  )
}
