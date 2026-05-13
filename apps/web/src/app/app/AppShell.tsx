'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import type { Page } from '@/lib/navigation'
import { Header } from '@/shared/components/Header'
import { Sidebar } from '@/shared/components/Sidebar'

const pageToPath: Partial<Record<Page, string>> = {
  dashboard: '/app/dashboard',
  comptes: '/app/accounts',
}

const headerCopy: Record<'dashboard' | 'comptes', { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description: "Vue d'ensemble de votre performance",
  },
  comptes: {
    title: 'Comptes',
    description: 'Comptes brokers connectés et synchronisation',
  },
}

function getCurrentPage(pathname: string): 'dashboard' | 'comptes' {
  if (pathname.startsWith('/app/accounts')) return 'comptes'
  return 'dashboard'
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentPage = getCurrentPage(pathname)

  const navigate = (page: Page) => {
    router.push(pageToPath[page] ?? '/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#090d14] text-gray-100">
      <Sidebar currentPage={currentPage} onNavigate={navigate} />
      <div className="min-h-screen pl-56">
        <Header {...headerCopy[currentPage]} />
        <main>{children}</main>
      </div>
    </div>
  )
}
