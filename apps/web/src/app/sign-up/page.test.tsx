import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SignUpPage from './page'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  opts: { firstName?: string; lastName?: string; email?: string; password?: string; confirm?: string },
) {
  const { firstName = 'Alice', lastName = 'Dupont', email = 'alice@test.com', password = 'Secure123!', confirm = password } = opts
  await user.type(screen.getByLabelText('Prénom'), firstName)
  await user.type(screen.getByLabelText('Nom'), lastName)
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Mot de passe'), password)
  await user.type(screen.getByLabelText('Confirmer le mot de passe'), confirm)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SignUpPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    vi.mocked(setToken).mockClear()
  })

  describe('jaugeur de robustesse du mot de passe', () => {
    it('score 1 (Trop court) pour un mot de passe < 8 caractères', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      await user.type(screen.getByLabelText('Mot de passe'), 'abc')
      expect(await screen.findByText('Trop court')).toBeInTheDocument()
    })

    it('score 2 (Faible) pour un mot de passe basique ≥ 8 caractères', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      await user.type(screen.getByLabelText('Mot de passe'), 'abcdefgh')
      expect(await screen.findByText('Faible')).toBeInTheDocument()
    })

    it('score 3 (Correct) avec majuscule et chiffre', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      await user.type(screen.getByLabelText('Mot de passe'), 'Abcdef12')
      // Le label est suivi du hint "— ajoutez un caractère spécial…"
      expect(await screen.findByText(/^Correct/)).toBeInTheDocument()
    })

    it('score 4 (Fort) avec majuscule, chiffre et caractère spécial', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      await user.type(screen.getByLabelText('Mot de passe'), 'Abcdef12!')
      // strength >= 3 ajoute toujours le hint ; on ancre sur "Fort"
      expect(await screen.findByText(/^Fort/)).toBeInTheDocument()
    })
  })

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    global.fetch = vi.fn()
    const user = userEvent.setup()
    render(<SignUpPage />)

    await fillForm(user, { password: 'Secure123!', confirm: 'Different1!' })
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument()
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('désactive le bouton si la confirmation ne correspond pas', async () => {
    const user = userEvent.setup()
    render(<SignUpPage />)

    await user.type(screen.getByLabelText('Mot de passe'), 'Secure123!')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'Autre')

    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeDisabled()
  })

  it('redirige vers /onboarding après inscription réussie', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok_new_user' }),
    } as Response)

    const user = userEvent.setup()
    render(<SignUpPage />)

    await fillForm(user, {})
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith('tok_new_user')
      expect(mockPush).toHaveBeenCalledWith('/onboarding')
    })
  })

  it('affiche "Un compte existe déjà" pour email_already_exists', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'email_already_exists' }),
    } as Response)

    const user = userEvent.setup()
    render(<SignUpPage />)

    await fillForm(user, {})
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByText(/un compte existe déjà avec cet email/i)).toBeInTheDocument()
    })
  })

  it('affiche "Impossible de joindre le serveur" si fetch rejette', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network'))

    const user = userEvent.setup()
    render(<SignUpPage />)

    await fillForm(user, {})
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }))

    await waitFor(() => {
      expect(screen.getByText(/impossible de joindre le serveur/i)).toBeInTheDocument()
    })
  })
})
