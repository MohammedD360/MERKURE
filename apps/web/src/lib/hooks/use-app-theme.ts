'use client'

export type AppTheme = 'dark' | 'light'

export const APP_THEME_STORAGE_KEY = 'merkure_app_theme'

/**
 * Script injecté dans <head> : pose l'attribut avant le premier paint, donc
 * avant l'hydratation. C'est lui qui évite à la fois le flash de thème et
 * l'écart SSR/client (le shell garde une classe stable, voir `.app-shell`).
 */
export const APP_THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${APP_THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.appTheme=t}}catch(e){}`

/**
 * L'état vit dans ThemeProvider (`@/lib/context/theme-context`), monté au
 * niveau racine : un seul thème pour le bouton du header et le réglage
 * « Affichage » des Paramètres.
 */
export { useTheme as useAppTheme } from '@/lib/context/theme-context'
