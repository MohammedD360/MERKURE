'use client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function GoogleSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8v5.6h7.6c4.5-4.1 7-10.2 7-16.4z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.6c-2.2 1.5-5 2.3-8.3 2.3-6.4 0-11.8-4.3-13.7-10H2.4v5.8C6.4 42.6 14.6 48 24 48z"/>
      <path fill="#FBBC05" d="M10.3 28.9A14.4 14.4 0 0 1 9.8 24c0-1.7.3-3.3.7-4.9v-5.8H2.4A24 24 0 0 0 0 24c0 3.9.9 7.5 2.4 10.7l7.9-5.8z"/>
      <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36 2.1 30.5 0 24 0 14.6 0 6.4 5.4 2.4 13.3l7.9 5.8C12.2 13.8 17.6 9.5 24 9.5z"/>
    </svg>
  )
}

interface Props {
  label?: string
  variant?: 'prominent' | 'subtle'
}

export function GoogleAuthButton({ label = 'Continuer avec Google', variant = 'subtle' }: Props) {
  return (
    <a
      href={`${API}/api/v1/auth/google`}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-[hsl(var(--border))] bg-white text-sm font-medium text-foreground shadow-sm transition-all hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))] hover:shadow-md active:scale-[0.99]"
    >
      <GoogleSvg />
      {label}
    </a>
  )
}
