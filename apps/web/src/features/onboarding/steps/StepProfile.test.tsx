import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { StepProfile } from './StepProfile'
import type { ProfilePayload } from '../api'

describe('StepProfile', () => {
  it('affiche les 4 styles de trading', () => {
    render(<StepProfile data={{}} onChange={vi.fn()} />)
    expect(screen.getByText('Scalper')).toBeInTheDocument()
    expect(screen.getByText('Day Trader')).toBeInTheDocument()
    expect(screen.getByText('Swing Trader')).toBeInTheDocument()
    expect(screen.getByText('Investisseur')).toBeInTheDocument()
  })

  it('appelle onChange avec le style sélectionné', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StepProfile data={{}} onChange={onChange} />)

    await user.click(screen.getByText('Scalper'))
    expect(onChange).toHaveBeenCalledWith({ style: 'SCALPER' })
  })

  it('appelle onChange avec le niveau de risque sélectionné', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StepProfile data={{}} onChange={onChange} />)

    await user.click(screen.getByText('Conservateur'))
    expect(onChange).toHaveBeenCalledWith({ riskAppetite: 'LOW' })
  })

  it('ajoute un marché au tableau en cliquant dessus', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StepProfile data={{}} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Forex' }))
    expect(onChange).toHaveBeenCalledWith({ markets: ['Forex'] })
  })

  it('retire un marché du tableau si déjà sélectionné', async () => {
    const data: ProfilePayload = { markets: ['Forex', 'Crypto'] }
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StepProfile data={data} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Forex' }))
    expect(onChange).toHaveBeenCalledWith({ markets: ['Crypto'] })
  })

  it('appelle onChange avec les années d\'expérience sélectionnées', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StepProfile data={{}} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith({ experienceYears: 3 })
  })

  it('affiche "< 1" pour 0 an et "15+" pour 15 ans', () => {
    render(<StepProfile data={{}} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '< 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '15+' })).toBeInTheDocument()
  })
})
