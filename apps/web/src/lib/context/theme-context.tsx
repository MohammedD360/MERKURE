'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { APP_THEME_STORAGE_KEY, type AppTheme } from '@/lib/hooks/use-app-theme'

interface ThemeContextValue {
  theme:       AppTheme
  toggleTheme: () => void
  /** false au premier rendu : ne pas afficher d'élément orienté par le thème. */
  mounted:     boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:       'dark',
  toggleTheme: () => {},
  mounted:     false,
})

function currentTheme(): AppTheme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.appTheme === 'light' ? 'light' : 'dark'
}

/**
 * Source unique du thème de l'app.
 * L'attribut `data-app-theme` est posé sur <html> avant l'hydratation par
 * APP_THEME_INIT_SCRIPT ; ce provider ne fait que le refléter et le basculer,
 * de sorte que le bouton du header et le réglage « Affichage » des Paramètres
 * pilotent exactement la même chose.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(currentTheme())
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const next: AppTheme = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.appTheme = next
    try {
      window.localStorage.setItem(APP_THEME_STORAGE_KEY, next)
    } catch {
      /* stockage indisponible : le thème reste actif pour la session */
    }
    setTheme(next)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
