'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import type { Page } from '@/lib/navigation'
import { Header } from '@/shared/components/Header'
import { Sidebar } from '@/shared/components/Sidebar'
import { useWebSocket } from '@/lib/hooks/use-websocket'

const pageToPath: Partial<Record<Page, string>> = {
  dashboard:    '/app/dashboard',
  comptes:      '/app/accounts',
  transactions: '/app/trades',
  performance:  '/app/performance',
  journal:      '/app/journal',
  billing:      '/app/billing',
  alerts:       '/app/alerts',
}

type KnownPage = 'dashboard' | 'comptes' | 'transactions' | 'performance' | 'journal' | 'billing' | 'alerts'

const headerCopy: Record<KnownPage, { title: string; description: string }> = {
  dashboard: {
    title:       'Dashboard',
    description: "Vue d'ensemble de votre performance",
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
  journal: {
    title:       'Journal IA',
    description: "Analyse quotidienne de vos trades par l'IA",
  },
  billing: {
    title:       'Abonnement',
    description: 'Gérez votre plan et votre facturation',
  },
  alerts: {
    title:       'Alertes',
    description: 'Notifications de risque et erreurs de synchronisation',
  },
}

function getCurrentPage(pathname: string): KnownPage {
  if (pathname.startsWith('/app/accounts'))    return 'comptes'
  if (pathname.startsWith('/app/trades'))      return 'transactions'
  if (pathname.startsWith('/app/performance')) return 'performance'
  if (pathname.startsWith('/app/journal'))     return 'journal'
  if (pathname.startsWith('/app/billing'))     return 'billing'
  if (pathname.startsWith('/app/alerts'))      return 'alerts'
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

  const navigate = (page: Page) => {
    router.push(pageToPath[page] ?? '/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#050b16] text-slate-100">
      <WebSocketProvider />
      <Sidebar currentPage={currentPage} onNavigate={navigate} />
      <div className="min-h-screen pl-64">
        <Header {...headerCopy[currentPage]} />
        <main>{children}</main>
      </div>
    </div>
  )
}
