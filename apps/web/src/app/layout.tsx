import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'

import { isClerkEnabled } from '@/lib/auth-mode'
import { Providers } from './providers'
import '../index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MERKURE',
  description: 'MERKURE - analytics, risk management and trading journal for serious traders.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = <Providers>{children}</Providers>

  return (
    <html lang="fr">
      <body className={inter.className}>{isClerkEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  )
}
