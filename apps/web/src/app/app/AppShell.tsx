'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import type { Page } from '@/lib/navigation'
import { Header } from '@/shared/components/Header'
import { Sidebar } from '@/shared/components/Sidebar'
import { useWebSocket } from '@/lib/hooks/use-websocket'

const pageToPath: Partial<Record<Page, string>> = {
  dashboard:     '/app/dashboard',
  comptes:       '/app/accounts',
  portefeuille:  '/app/portefeuille',
  positions:     '/app/positions',
  transactions:  '/app/trades',
  performance:   '/app/performance',
  statistiques:  '/app/statistiques',
  journal:       '/app/journal',
  billing:       '/app/billing',
  alerts:        '/app/alerts',
  settings:      '/app/settings',
  profile:       '/app/profile',
  rapports:      '/app/reports',
  ia:            '/app/ia',
  iaBiais:       '/app/ia/biais',
  iaRapport:     '/app/ia/rapport',
  iaCoach:       '/app/ia/coach',
  iaSimulation:  '/app/ia/simulation',
  iaBenchmark:   '/app/ia/benchmark',
  iaPropfirm:    '/app/ia/propfirm',
}

type KnownPage = 'dashboard' | 'comptes' | 'portefeuille' | 'positions' | 'transactions' | 'performance' | 'statistiques' | 'journal' | 'billing' | 'alerts' | 'settings' | 'profile' | 'rapports' | 'ia' | 'iaBiais' | 'iaRapport' | 'iaCoach' | 'iaSimulation' | 'iaBenchmark' | 'iaPropfirm'

const headerCopy: Record<KnownPage, { title: string; description: string }> = {
  positions: {
    title:       'Positions',
    description: 'Gestion du risque et suivi des positions ouvertes',
  },
  portefeuille: {
    title:       'Portefeuille',
    description: 'Positions ouvertes, exposition et historique equity',
  },
  dashboard: {
    title:       'Vue d’ensemble',
    description: 'Performance, risque et synchronisation des comptes',
  },
  comptes: {
    title:       'Comptes',
    description: 'Comptes brokers connectés et synchronisation',
  },
  transactions: {
    title:       'Transactions',
    description: 'Historique des trades, filtres et annotations',
  },
  performance: {
    title:       'Performance',
    description: 'Analyse détaillée de vos résultats de trading',
  },
  statistiques: {
    title:       'Statistiques',
    description: 'Bilan mensuel, instruments et analyse des séries',
  },
  journal: {
    title:       'Journal de trading',
    description: 'Plan pré-marché, revue post-séance et suivi de votre mindset',
  },
  billing: {
    title:       'Abonnement',
    description: 'Gérez votre plan et votre facturation',
  },
  alerts: {
    title:       'Alertes',
    description: 'Notifications de risque et erreurs de synchronisation',
  },
  settings: {
    title:       'Paramètres',
    description: 'Profil et sécurité du compte',
  },
  profile: {
    title:       'Profil',
    description: 'Identité, photo de profil et préférences du compte',
  },
  rapports: {
    title:       'Rapports',
    description: 'Rapports hebdomadaires PDF',
  },
  ia: {
    title:       'Intelligence IA',
    description: 'Modules IA, rapports et coaching comportemental',
  },
  iaBiais: {
    title:       'Biais comportementaux',
    description: 'Détection des erreurs récurrentes et patterns émotionnels',
  },
  iaRapport: {
    title:       'Rapport IA',
    description: 'Synthèse narrative de vos performances et actions prioritaires',
  },
  iaCoach: {
    title:       'Coach de discipline',
    description: 'Alertes de discipline et prévention des décisions impulsives',
  },
  iaSimulation: {
    title:       'Simulation IA',
    description: 'Scénarios what-if pour mesurer l’impact de vos règles',
  },
  iaBenchmark: {
    title:       'Benchmark IA',
    description: 'Comparaison anonymisée et lecture de votre niveau relatif',
  },
  iaPropfirm: {
    title:       'Prop firms',
    description: 'Compatibilité entre votre profil de trading et les règles prop firm',
  },
}

function getCurrentPage(pathname: string): KnownPage {
  if (pathname.startsWith('/app/accounts'))      return 'comptes'
  if (pathname.startsWith('/app/portefeuille')) return 'portefeuille'
  if (pathname.startsWith('/app/positions'))   return 'positions'
  if (pathname.startsWith('/app/trades'))      return 'transactions'
  if (pathname.startsWith('/app/performance'))  return 'performance'
  if (pathname.startsWith('/app/statistiques')) return 'statistiques'
  if (pathname.startsWith('/app/journal'))     return 'journal'
  if (pathname.startsWith('/app/billing'))     return 'billing'
  if (pathname.startsWith('/app/alerts'))      return 'alerts'
  if (pathname.startsWith('/app/profile'))     return 'profile'
  if (pathname.startsWith('/app/settings'))    return 'settings'
  if (pathname.startsWith('/app/reports'))     return 'rapports'
  if (pathname.startsWith('/app/ia/biais'))      return 'iaBiais'
  if (pathname.startsWith('/app/ia/rapport'))    return 'iaRapport'
  if (pathname.startsWith('/app/ia/coach'))      return 'iaCoach'
  if (pathname.startsWith('/app/ia/simulation')) return 'iaSimulation'
  if (pathname.startsWith('/app/ia/benchmark'))  return 'iaBenchmark'
  if (pathname.startsWith('/app/ia/propfirm'))   return 'iaPropfirm'
  if (pathname.startsWith('/app/ia'))          return 'ia'
  return 'dashboard'
}

function WebSocketProvider() {
  useWebSocket()
  return null
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname    = usePathname()
  const router      = useRouter()
  const currentPage = getCurrentPage(pathname)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (page: Page) => {
    router.push(pageToPath[page] ?? '/app/dashboard')
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--shell-bg)] text-slate-100 transition-colors duration-200">
      <WebSocketProvider />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer la navigation"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="min-h-screen lg:pl-64">
        <Header {...headerCopy[currentPage]} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
