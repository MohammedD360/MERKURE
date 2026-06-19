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
  iaStrategyValidator: '/app/ia/strategy-validator',
  iaChat:        '/app/ia/chat',
  iaHistory:     '/app/ia/history',
  iaBenchmark:   '/app/ia/benchmark',
  iaPropfirm:    '/app/ia/propfirm',
  academy:       '/app/academy',
  botTrading:    '/app/bots',
  botCreate:     '/app/bots/create',
  botPerformance:'/app/bots/performance',
  botHistory:    '/app/bots/history',
}

type KnownPage = Page

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
    description: 'Dernière synchro : il y a 2 min  •  3 comptes connectés',
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
    description: 'Préférences produit, affichage et cadre de risque',
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
  iaStrategyValidator: {
    title:       'Validateur de stratégie',
    description: 'Contrôlez les règles, le risque et la cohérence de vos setups',
  },
  iaChat: {
    title:       'Chat IA',
    description: 'Assistant de trading réservé au plan Elite',
  },
  iaHistory: {
    title:       'Historique IA',
    description: 'Analyses, rapports et décisions assistées conservés dans le temps',
  },
  iaBenchmark: {
    title:       'Benchmark IA',
    description: 'Comparaison anonymisée et lecture de votre niveau relatif',
  },
  iaPropfirm: {
    title:       'Prop firms',
    description: 'Compatibilité entre votre profil de trading et les règles prop firm',
  },
  academy: {
    title:       'Académie',
    description: 'Parcours, ressources et formations contextualisées',
  },
  botTrading: {
    title:       'Bot Trading',
    description: 'Supervision de vos automatisations et règles de trading',
  },
  botCreate: {
    title:       'Créer un bot',
    description: 'Configurez une stratégie automatisée avec garde-fous de risque',
  },
  botPerformance: {
    title:       'Performance des bots',
    description: 'Résultats, stabilité et drawdown de vos automatisations',
  },
  botHistory: {
    title:       'Trades auto',
    description: 'Historique des exécutions automatisées et décisions associées',
  },
  assistant: {
    title:       'Assistant',
    description: 'Assistant de pilotage et analyse contextuelle',
  },
  strategies: {
    title:       'Stratégies',
    description: 'Bibliothèque de stratégies et règles de validation',
  },
  backtesting: {
    title:       'Backtesting',
    description: 'Tests historiques de vos hypothèses de trading',
  },
  scanner: {
    title:       'Scanner',
    description: 'Détection de configurations et opportunités',
  },
  conseils: {
    title:       'Conseils',
    description: 'Actions recommandées selon votre activité récente',
  },
}

function getCurrentPage(pathname: string): KnownPage {
  if (pathname.startsWith('/app/bots/create')) return 'botCreate'
  if (pathname.startsWith('/app/bots/performance')) return 'botPerformance'
  if (pathname.startsWith('/app/bots/history')) return 'botHistory'
  if (pathname.startsWith('/app/bots')) return 'botTrading'
  if (pathname.startsWith('/app/academy')) return 'academy'
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
  if (pathname.startsWith('/app/ia/strategy-validator')) return 'iaStrategyValidator'
  if (pathname.startsWith('/app/ia/chat'))       return 'iaChat'
  if (pathname.startsWith('/app/ia/history'))    return 'iaHistory'
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
    <div className="min-h-screen bg-background text-foreground">
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
