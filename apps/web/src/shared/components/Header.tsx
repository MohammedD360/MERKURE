'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { clearToken } from '@/lib/api-client'

interface HeaderProps {
  title:       string
  description: string
}

export function Header({ title, description }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()
  const { data: user } = useCurrentUser()

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : (user?.email?.split('@')[0] ?? '—')
  const initials  = displayName.slice(0, 2).toUpperCase()
  const modeLabel = user?.authMode === 'clerk' ? `Plan ${user.plan}` : 'Mode démo'

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('merkure_token') : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/auth/logout`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch { /* best-effort */ }
    clearToken()
    router.push('/sign-in')
  }

  return (
    <header className="sticky top-0 z-10 flex h-20 flex-shrink-0 items-center justify-between border-b border-[#172842] bg-[#050b16]/86 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-xl font-bold leading-none text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e2f4a] bg-[#081220] text-slate-400 transition-colors hover:bg-[#101b2e] hover:text-white">
          <Search className="h-4 w-4" />
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e2f4a] bg-[#081220] text-slate-400 transition-colors hover:bg-[#101b2e] hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#7c5cff] shadow-[0_0_10px_#7c5cff]" />
        </button>

        <div className="mx-2 h-8 w-px bg-[#1e2f4a]" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/[0.04]"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold leading-none text-white">{displayName}</div>
              <div className="mt-1 text-xs text-slate-500">{modeLabel}</div>
            </div>
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#273a5c] bg-gradient-to-br from-[#26355d] to-[#171f3d] text-xs font-bold text-white">
              {initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#050b16] bg-[#38e476]" />
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#1e2f4a] bg-[#081220] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="border-b border-[#1e2f4a] px-4 py-3">
                <div className="text-[12px] font-semibold text-white">{user?.email ?? '—'}</div>
                <div className="mt-0.5 text-[10px] text-slate-500">{modeLabel}</div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {}}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <User className="h-3.5 w-3.5" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-[#ff5e70]/80 transition-colors hover:bg-[#ff5e70]/[0.06] hover:text-[#ff5e70]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
