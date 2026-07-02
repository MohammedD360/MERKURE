import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OnboardingWizard } from './OnboardingWizard'
import * as api from './api'

// ─── Module mocks ─────────────────────────────────────────────────────────────

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('@/shared/components/BrandLogo', () => ({
  BrandLogo: () => <span>MERKURE</span>,
}))
vi.mock('./api', () => ({
  saveProfile:       vi.fn(),
  connectBroker:     vi.fn(),
  completeOnboarding: vi.fn(),
}))
// StepPlan calls apiFetch for billing plans — mock to avoid real network
vi.mock('@/lib/api-client', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
  getToken: () => null,
  setToken: vi.fn(),
  clearToken: vi.fn(),
}))
// Mock steps that use BrokerLogo to avoid deep dependency chain
vi.mock('./steps/StepBroker', () => ({
  StepBroker: ({ onSkip, onConnect }: { onSkip: () => void; onConnect: (p: unknown) => void }) => (
    <div>
      <button type="button" onClick={onSkip}>Passer cette étape</button>
      <button type="button" onClick={() => onConnect({ brokerType: 'MT5', accountType: 'LIVE', accountId: '123', label: 'test' })}>
        Connecter le compte
      </button>
    </div>
  ),
}))

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OnboardingWizard', () => {
  beforeEach(() => {
    mockPush.mockClear()
    vi.mocked(api.saveProfile).mockResolvedValue(undefined)
    vi.mocked(api.connectBroker).mockResolvedValue({ id: 'acct_test' })
    vi.mocked(api.completeOnboarding).mockResolvedValue(undefined)
  })

  it('affiche le step Profil au démarrage', () => {
    render(<OnboardingWizard />)
    expect(screen.getByText('Votre profil de trader')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
  })

  it('passe au step Broker après sauvegarde du profil réussie', async () => {
    const user = userEvent.setup()
    render(<OnboardingWizard />)

    await user.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => {
      expect(api.saveProfile).toHaveBeenCalled()
      expect(screen.getByText('Connecter un broker')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si saveProfile échoue', async () => {
    vi.mocked(api.saveProfile).mockRejectedValueOnce(new Error('save_profile_failed'))

    const user = userEvent.setup()
    render(<OnboardingWizard />)

    await user.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => {
      expect(screen.getByText(/erreur lors de la sauvegarde/i)).toBeInTheDocument()
    })
  })

  it('passe directement au step Plan via "Passer cette étape"', async () => {
    const user = userEvent.setup()
    render(<OnboardingWizard />)

    // Aller au step Broker
    await user.click(screen.getByRole('button', { name: /continuer/i }))
    await waitFor(() => screen.getByText('Connecter un broker'))

    // Passer le step Broker
    await user.click(screen.getByRole('button', { name: /passer cette étape/i }))

    await waitFor(() => {
      expect(screen.getByText('Choisissez votre plan')).toBeInTheDocument()
    })
  })

  it('appelle completeOnboarding et passe au step Done quand FREE est choisi', async () => {
    const user = userEvent.setup()
    render(<OnboardingWizard />)

    // Profil → Broker → Plan
    await user.click(screen.getByRole('button', { name: /continuer/i }))
    await waitFor(() => screen.getByText('Connecter un broker'))
    await user.click(screen.getByRole('button', { name: /passer cette étape/i }))
    await waitFor(() => screen.getByText('Choisissez votre plan'))

    // Sélectionner le plan Gratuit
    const freeButton = await screen.findByRole('button', { name: /continuer en gratuit/i })
    await user.click(freeButton)

    await waitFor(() => {
      expect(api.completeOnboarding).toHaveBeenCalled()
      expect(screen.getByText("C'est parti !")).toBeInTheDocument()
    })
  })

  it('navigue vers /app/dashboard en cliquant sur "Accéder au dashboard"', async () => {
    const user = userEvent.setup()
    render(<OnboardingWizard />)

    // Raccourcis: profil → broker (passer) → plan (gratuit) → done
    await user.click(screen.getByRole('button', { name: /continuer/i }))
    await waitFor(() => screen.getByText('Connecter un broker'))
    await user.click(screen.getByRole('button', { name: /passer cette étape/i }))
    await waitFor(() => screen.getByText('Choisissez votre plan'))
    const freeButton = await screen.findByRole('button', { name: /continuer en gratuit/i })
    await user.click(freeButton)
    await waitFor(() => screen.getByText("C'est parti !"))

    await user.click(screen.getByRole('button', { name: /accéder au dashboard/i }))

    expect(mockPush).toHaveBeenCalledWith('/app/dashboard')
  })

  it('connecte un broker puis avance au step Plan après polling', async () => {
    // Le polling interroge GET /api/v1/accounts/:id — simuler un succès direct
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ syncStatus: 'SUCCESS' }),
    } as Response)

    const user = userEvent.setup()
    render(<OnboardingWizard />)

    await user.click(screen.getByRole('button', { name: /continuer/i }))
    await waitFor(() => screen.getByText('Connecter un broker'))

    await user.click(screen.getByRole('button', { name: /connecter le compte/i }))

    await waitFor(() => {
      expect(api.connectBroker).toHaveBeenCalled()
      expect(screen.getByText('Choisissez votre plan')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
