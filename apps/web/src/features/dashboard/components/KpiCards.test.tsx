import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { KpiCards } from './KpiCards'
import { useKpiSummary } from '@/lib/hooks/use-kpis'

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/hooks/use-kpis', () => ({
  useKpiSummary: vi.fn(),
}))

// shadcn/ui components — rendu simple sans styles
vi.mock('@/components/ui/card', () => ({
  Card:        ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}))
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

// ─── Données de test ──────────────────────────────────────────────────────────

type KpiSummaryData = {
  totalPnl: number
  nbTrades: number
  winRate: number
  maxDrawdown: number
  profitFactor: number
  bestDay: { pnl: number; date: string } | null
}

const MOCK_DATA: KpiSummaryData = {
  totalPnl:     1500.25,
  nbTrades:     42,
  winRate:      0.64,
  maxDrawdown:  -0.04,  // 4% → "Risque contenu"
  profitFactor: 1.8,    // → "Solide"
  bestDay:      { pnl: 320.5, date: '2024-11-15T00:00:00Z' },
}

function mockQuery(data: KpiSummaryData | undefined, isLoading = false) {
  vi.mocked(useKpiSummary).mockReturnValue({
    data,
    isLoading,
    isError: false,
    error: null,
  } as ReturnType<typeof useKpiSummary>)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('KpiCards', () => {
  beforeEach(() => {
    vi.mocked(useKpiSummary).mockClear()
  })

  it('affiche des skeletons pendant le chargement', () => {
    mockQuery(undefined, true)
    render(<KpiCards />)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('affiche "—" dans toutes les cartes quand data est undefined', () => {
    mockQuery(undefined, false)
    render(<KpiCards />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('affiche le P&L en vert avec signe + quand positif', () => {
    mockQuery(MOCK_DATA)
    render(<KpiCards />)
    // formatMoney(1500.25, true) en fr-FR → "+1 500,25 €"
    expect(screen.getByText(/\+.*1.500/, { selector: 'p' })).toBeInTheDocument()
  })

  it('affiche le P&L en rouge quand négatif', () => {
    mockQuery({ ...MOCK_DATA, totalPnl: -250.5 })
    render(<KpiCards />)
    const pnlEl = screen.getByText(/-.*250/, { selector: 'p' })
    expect(pnlEl).toHaveClass('text-red-500')
  })

  describe('labels drawdown', () => {
    it('affiche "Risque contenu" pour un drawdown ≤ 5%', () => {
      mockQuery({ ...MOCK_DATA, maxDrawdown: -0.04 })
      render(<KpiCards />)
      expect(screen.getByText('Risque contenu')).toBeInTheDocument()
    })

    it('affiche "À surveiller" pour un drawdown entre 5% et 12%', () => {
      mockQuery({ ...MOCK_DATA, maxDrawdown: -0.08 })
      render(<KpiCards />)
      expect(screen.getByText('À surveiller')).toBeInTheDocument()
    })

    it('affiche "Risque élevé" pour un drawdown > 12%', () => {
      mockQuery({ ...MOCK_DATA, maxDrawdown: -0.15 })
      render(<KpiCards />)
      expect(screen.getByText('Risque élevé')).toBeInTheDocument()
    })
  })

  describe('labels profit factor', () => {
    it('affiche "Solide" pour un profit factor ≥ 1.5', () => {
      mockQuery({ ...MOCK_DATA, profitFactor: 1.8 })
      render(<KpiCards />)
      expect(screen.getByText('Solide')).toBeInTheDocument()
    })

    it('affiche "Neutre" pour un profit factor entre 1 et 1.5', () => {
      mockQuery({ ...MOCK_DATA, profitFactor: 1.2 })
      render(<KpiCards />)
      expect(screen.getByText('Neutre')).toBeInTheDocument()
    })

    it('affiche "Faible" pour un profit factor < 1', () => {
      mockQuery({ ...MOCK_DATA, profitFactor: 0.8 })
      render(<KpiCards />)
      expect(screen.getByText('Faible')).toBeInTheDocument()
    })
  })

  it('affiche le nombre de trades et le win rate', () => {
    mockQuery(MOCK_DATA)
    render(<KpiCards />)
    expect(screen.getByText('42')).toBeInTheDocument()
    // winRate 0.64 → "64,0 %"
    expect(screen.getByText(/64,0\s*%\s*de réussite/)).toBeInTheDocument()
  })

  it('affiche le meilleur jour avec sa date', () => {
    mockQuery(MOCK_DATA)
    render(<KpiCards />)
    // bestDay.pnl = 320.5 → formatMoney(320.5, true) → "+320,50 €"
    expect(screen.getByText(/\+.*320/, { selector: 'p' })).toBeInTheDocument()
    // date 2024-11-15 → "15 nov. 2024"
    expect(screen.getByText(/nov\. 2024/, { selector: 'p' })).toBeInTheDocument()
  })

  it('passe la bonne période à useKpiSummary', () => {
    mockQuery(MOCK_DATA)
    render(<KpiCards period="7d" />)
    expect(useKpiSummary).toHaveBeenCalledWith('7d', undefined)
  })

  it('passe accountId à useKpiSummary si fourni', () => {
    mockQuery(MOCK_DATA)
    render(<KpiCards period="30d" accountId="acct_abc" />)
    expect(useKpiSummary).toHaveBeenCalledWith('30d', 'acct_abc')
  })
})
