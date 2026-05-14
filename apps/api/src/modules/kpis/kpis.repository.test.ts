import { describe, it, expect } from 'vitest'

// Logique d'agrégation extraite du repository pour test unitaire pur (sans DB)

interface Snapshot {
  totalPnl:     number | null
  winRate:      number | null
  profitFactor: number | null
  nbTrades:     number | null
  date:         Date
}

function aggregateSummary(snapshots: Snapshot[]) {
  if (snapshots.length === 0) {
    return { totalPnl: 0, winRate: 0, profitFactor: null, nbTrades: 0, maxDrawdown: null }
  }

  const totalPnl    = snapshots.reduce((s, r) => s + (r.totalPnl ?? 0), 0)
  const totalTrades = snapshots.reduce((s, r) => s + (r.nbTrades ?? 0), 0)
  const winRate     = totalTrades > 0
    ? snapshots.reduce((s, r) => s + (r.winRate ?? 0) * (r.nbTrades ?? 0), 0) / totalTrades
    : 0

  const pfSnap      = [...snapshots].reverse().find(r => r.profitFactor != null)
  const profitFactor = pfSnap ? pfSnap.profitFactor : null

  let peak = 0, cumulPnl = 0, maxDrawdown = 0
  for (const snap of snapshots) {
    cumulPnl += snap.totalPnl ?? 0
    if (cumulPnl > peak) peak = cumulPnl
    const dd = peak > 0 ? (peak - cumulPnl) / peak : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  return { totalPnl, winRate, profitFactor, nbTrades: totalTrades, maxDrawdown: maxDrawdown > 0 ? maxDrawdown : null }
}

describe('kpi aggregation', () => {
  it('retourne des zéros sur un tableau vide', () => {
    const result = aggregateSummary([])
    expect(result.totalPnl).toBe(0)
    expect(result.winRate).toBe(0)
    expect(result.nbTrades).toBe(0)
    expect(result.profitFactor).toBeNull()
    expect(result.maxDrawdown).toBeNull()
  })

  it('cumule le PnL total correctement', () => {
    const snaps: Snapshot[] = [
      { totalPnl: 100, winRate: 0.6, profitFactor: 2.0, nbTrades: 5, date: new Date('2026-01-01') },
      { totalPnl: -50, winRate: 0.4, profitFactor: 0.8, nbTrades: 5, date: new Date('2026-01-02') },
      { totalPnl: 200, winRate: 0.8, profitFactor: 4.0, nbTrades: 10, date: new Date('2026-01-03') },
    ]
    const { totalPnl } = aggregateSummary(snaps)
    expect(totalPnl).toBeCloseTo(250)
  })

  it('calcule le winrate pondéré par nombre de trades', () => {
    const snaps: Snapshot[] = [
      { totalPnl: 100, winRate: 1.0, profitFactor: null, nbTrades: 1, date: new Date('2026-01-01') },
      { totalPnl: 100, winRate: 0.0, profitFactor: null, nbTrades: 3, date: new Date('2026-01-02') },
    ]
    // (1.0*1 + 0.0*3) / 4 = 0.25
    const { winRate } = aggregateSummary(snaps)
    expect(winRate).toBeCloseTo(0.25)
  })

  it('prend le dernier profitFactor non-null', () => {
    const snaps: Snapshot[] = [
      { totalPnl: 100, winRate: 0.6, profitFactor: 2.0, nbTrades: 5, date: new Date('2026-01-01') },
      { totalPnl: 50,  winRate: 0.5, profitFactor: null, nbTrades: 3, date: new Date('2026-01-02') },
      { totalPnl: 80,  winRate: 0.7, profitFactor: 3.5, nbTrades: 4, date: new Date('2026-01-03') },
    ]
    const { profitFactor } = aggregateSummary(snaps)
    expect(profitFactor).toBe(3.5)
  })

  it('calcule le drawdown max', () => {
    // pic à 300, descend à 100 → drawdown = (300-100)/300 ≈ 0.667
    const snaps: Snapshot[] = [
      { totalPnl: 100, winRate: 1, profitFactor: null, nbTrades: 1, date: new Date('2026-01-01') },
      { totalPnl: 200, winRate: 1, profitFactor: null, nbTrades: 1, date: new Date('2026-01-02') },
      { totalPnl: -200, winRate: 0, profitFactor: null, nbTrades: 1, date: new Date('2026-01-03') },
    ]
    const { maxDrawdown } = aggregateSummary(snaps)
    expect(maxDrawdown).toBeCloseTo(200 / 300, 2)
  })

  it('retourne maxDrawdown null quand aucun drawdown', () => {
    const snaps: Snapshot[] = [
      { totalPnl: 100, winRate: 1, profitFactor: 2, nbTrades: 5, date: new Date('2026-01-01') },
      { totalPnl: 200, winRate: 1, profitFactor: 3, nbTrades: 5, date: new Date('2026-01-02') },
    ]
    const { maxDrawdown } = aggregateSummary(snaps)
    expect(maxDrawdown).toBeNull()
  })
})
