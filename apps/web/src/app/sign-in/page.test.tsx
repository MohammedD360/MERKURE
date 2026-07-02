import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SignInPage from './page'
import { setToken } from '@/lib/api-client'

// ─── Module mocks ─────────────────────────────────────────────────────────────

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('@clerk/nextjs', () => ({ SignIn: () => null }))
vi.mock('@/lib/auth-mode', () => ({ isClerkEnabled: false }))
vi.mock('@/lib/api-client', () => ({
  setToken: vi.fn(),
  getToken: () => null,
  clearToken: vi.fn(),
  apiFetch: vi.fn(),
}))
vi.mock('@/shared/components/AuthShell', () => ({
  AuthShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/shared/components/GoogleAuthButton', () => ({
  GoogleAuthButton: () => <button type="button">Google</button>,
}))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SignInPage (mode JWT)', () => {
  beforeEach(() => {
    mockPush.mockClear()
    vi.mocked(setToken).mockClear()
  })

  it('affiche les champs email, mot de passe et le bouton de connexion', () => {
    render(<SignInPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('navigue vers /app/dashboard après connexion réussie', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok_abc123' }),
    } as Response)

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'motdepasse42')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('tok_abc123')
      expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
    })
  })

  it('affiche "Email ou mot de passe incorrect" pour invalid_credentials', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_credentials' }),
    } as Response)

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'mauvais')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument()
    })
  })

  it('affiche une erreur générique pour une réponse serveur non-credentials', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'server_error' }),
    } as Response)

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'test1234')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument()
    })
  })

  it('affiche "Impossible de joindre le serveur" si fetch rejette', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'test1234')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/impossible de joindre le serveur/i)).toBeInTheDocument()
    })
  })

  it('bascule la visibilité du mot de passe', async () => {
    const user = userEvent.setup()
    render(<SignInPage />)

    const input = screen.getByLabelText('Mot de passe')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /afficher/i }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /masquer/i }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('désactive le bouton pendant la soumission', async () => {
    let resolveFetch!: (v: unknown) => void
    global.fetch = vi.fn().mockReturnValueOnce(
      new Promise((r) => { resolveFetch = r }),
    )

    const user = userEvent.setup()
    render(<SignInPage />)

    await user.type(screen.getByLabelText('Email'), 'alice@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'test1234')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByRole('button', { name: /connexion/i })).toBeDisabled()

    // Cleanup — résoudre la promesse pour éviter les fuites
    resolveFetch({ ok: false, json: async () => ({ error: 'err' }) })
  })
})
