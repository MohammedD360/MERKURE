import type { ReactNode } from 'react'

export default function BotsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bot-terminal terminal-grid-bg min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  )
}
