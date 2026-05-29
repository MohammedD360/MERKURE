'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, LogOut, User, ChevronDown, Menu, Sun, Moon } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { clearToken } from '@/lib/api-client'
import { useTheme } from '@/lib/context/theme-context'

interface HeaderProps {
  title:       string
  description: string
  onMenuClick?: () => void
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()
  const { data: user } = useCurrentUser()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : (user?.email?.split('@')[0] ?? '—')
  const initials  = displayName.slice(0, 2).toUpperCase()
  const modeLabel = user?.authMode === 'clerk' ? `Plan ${user.plan}` : 'Mode démo'
  const avatarStyle = user?.avatarUrl
    ? { backgroundImage: `url(${user.avatarUrl})` }
    : undefined

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

  const btnBase = isLight
    ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white'

  return (
    <header
      className="sticky top-0 z-10 flex min-h-16 flex-shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur sm:px-6 transition-colors duration-200"
      style={{
        background: 'var(--header-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors lg:hidden ${btnBase}`}
          aria-label="Ouvrir la navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1
            className="truncate text-lg font-bold leading-none sm:text-xl"
            style={{ color: 'var(--text-base)' }}
          >
            {title}
          </h1>
          <p
            className="mt-1.5 hidden truncate text-sm sm:block"
            style={{ color: 'var(--text-subtle)' }}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button className={`hidden h-10 w-10 items-center justify-center rounded-lg border transition-colors sm:flex ${btnBase}`}>
          <Search className="h-4 w-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${btnBase}`}
          title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
        >
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${btnBase}`}>
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
        </button>

        <div className="mx-1 hidden h-8 w-px sm:block" style={{ background: 'var(--border-color)' }} />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-black/[0.04] sm:px-2"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold leading-none" style={{ color: 'var(--text-base)' }}>{displayName}</div>
              <div className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>{modeLabel}</div>
            </div>
            <div
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 bg-cover bg-center text-xs font-bold text-white"
              style={avatarStyle}
              aria-label={`Profil de ${displayName}`}
            >
              {!user?.avatarUrl && initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--header-bg)] bg-emerald-400" />
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 transition-transform duration-200" style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
              style={{ background: 'var(--surface-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--text-base)' }}>{user?.email ?? '—'}</div>
                <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-subtle)' }}>{modeLabel}</div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push('/app/profile')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors hover:bg-black/[0.04]"
                  style={{ color: 'var(--text-muted)' }}
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
