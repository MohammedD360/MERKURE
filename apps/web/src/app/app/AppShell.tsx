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
}

type KnownPage = 'dashboard' | 'comptes' | 'transactions'

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
}

function getCurrentPage(pathname: string): KnownPage {
  if (pathname.startsWith('/app/accounts')) return 'comptes'
  if (pathname.startsWith('/app/trades'))   return 'transactions'
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
    <div className="min-h-screen bg-[#090d14] text-gray-100">
      <WebSocketProvider />
      <Sidebar currentPage={currentPage} onNavigate={navigate} />
      <div className="min-h-screen pl-56">
        <Header {...headerCopy[currentPage]} />
        <main>{children}</main>
      </div>
    </div>
  )
}
