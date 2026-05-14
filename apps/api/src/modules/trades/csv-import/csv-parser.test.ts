import { describe, it, expect } from 'vitest'
import { parseCsvTrades } from './csv-parser.js'

const BASE_CSV = `symbol,direction,open time,open price,close time,close price,lot size,pnl,commission,swap
EURUSD,buy,2026-01-10 09:00:00,1.08500,2026-01-10 15:30:00,1.09000,0.10,50.00,-2.00,0.00
GBPUSD,sell,2026-01-10 10:00:00,1.26000,2026-01-10 14:00:00,1.25500,0.05,25.00,-1.00,0.00
XAUUSD,buy,2026-01-10 11:00:00,2000.00,,,-0.20,,-3.00,0.00`

describe('parseCsvTrades', () => {
  it('parse un CSV standard correctement', () => {
    const { trades, skipped, errors } = parseCsvTrades(BASE_CSV)
    expect(trades).toHaveLength(3)
    expect(skipped).toBe(0)
    expect(errors).toHaveLength(0)
  })

  it('normalise les symboles en majuscules', () => {
    const { trades } = parseCsvTrades(BASE_CSV)
    expect(trades[0]!.symbol).toBe('EURUSD')
    expect(trades[1]!.symbol).toBe('GBPUSD')
  })

  it('mappe buy→LONG et sell→SHORT', () => {
    const { trades } = parseCsvTrades(BASE_CSV)
    expect(trades[0]!.direction).toBe('LONG')
    expect(trades[1]!.direction).toBe('SHORT')
  })

  it('détecte le statut CLOSED/OPEN selon closeTime', () => {
    const { trades } = parseCsvTrades(BASE_CSV)
    expect(trades[0]!.status).toBe('CLOSED')
    expect(trades[2]!.status).toBe('OPEN')
  })

  it('retourne pnl null quand la cellule est vide', () => {
    const { trades } = parseCsvTrades(BASE_CSV)
    expect(trades[2]!.pnl).toBeNull()
  })

  it('auto-détecte le délimiteur point-virgule', () => {
    const csv = `symbol;direction;open time;open price\nEURUSD;buy;2026-01-10;1.0850`
    const { trades, errors } = parseCsvTrades(csv)
    expect(errors).toHaveLength(0)
    expect(trades).toHaveLength(1)
  })

  it('accepte les alias de colonnes MT4 (DD.MM.YYYY)', () => {
    const csv = `instrument,type,open_time,open_price\nEURUSD,buy,10.01.2026 09:00:00,1.0850`
    const { trades } = parseCsvTrades(csv)
    expect(trades).toHaveLength(1)
    expect(trades[0]!.symbol).toBe('EURUSD')
    expect(trades[0]!.openTime).toBeInstanceOf(Date)
  })

  it('skippe les lignes avec direction inconnue et remonte une erreur', () => {
    const csv = `symbol,direction,open time,open price\nEURUSD,UNKNOWN,2026-01-10,1.0850`
    const { trades, skipped, errors } = parseCsvTrades(csv)
    expect(trades).toHaveLength(0)
    expect(skipped).toBe(1)
    expect(errors[0]).toContain('direction')
  })

  it('renvoie une erreur si les colonnes obligatoires manquent', () => {
    const csv = `date,price\n2026-01-10,1.085`
    const { trades, errors } = parseCsvTrades(csv)
    expect(trades).toHaveLength(0)
    expect(errors[0]).toContain('Colonnes obligatoires')
  })

  it('renvoie une erreur sur un CSV vide', () => {
    const { trades, errors } = parseCsvTrades('  \n  ')
    expect(trades).toHaveLength(0)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('gère les nombres avec virgule comme séparateur décimal', () => {
    const csv = `symbol,direction,open time,open price,pnl\nEURUSD,buy,2026-01-10,1.0850,"1,234.56"`
    const { trades } = parseCsvTrades(csv)
    expect(trades[0]!.pnl).toBeCloseTo(1234.56)
  })
})
