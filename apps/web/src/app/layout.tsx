import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { DM_Sans, Instrument_Serif } from 'next/font/google'

import { isClerkEnabled } from '@/lib/auth-mode'
import { Providers } from './providers'
import '../index.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-primary',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MERKURE',
  description: 'MERKURE - analytics, risk management and trading journal for serious traders.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = <Providers>{children}</Providers>

  return (
    <html lang="fr" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className={dmSans.className}>{isClerkEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  )
}
