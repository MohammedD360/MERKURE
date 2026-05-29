'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface PortfolioSummary {
  openPositionsCount: number
  totalExposureLots:  number
  totalPnlOpen:       number
  balance:            number
  equity:             number
  riskPct:            number
}

export interface OpenPosition {
  id:              string
  symbol:          string
  direction:       'LONG' | 'SHORT'
  openTime:        string
  openPrice:       number
  lotSize:         number
  pnl:             number
  swap:            number
  commission:      number
  strategyTag:     string | null
  brokerAccountId: string
}

export interface BreakdownItem {
  symbol: string
  lots:   number
  pnl:    number
  count:  number
  pct:    number
  color:  string
}

export interface StrategyItem {
  strategy: string
  pnl:      number
  count:    number
  pct:      number
}

export interface PortfolioBreakdown {
  bySymbol:   BreakdownItem[]
  byStrategy: StrategyItem[]
  source:     'open' | 'closed_30d'
}

export interface EquityPoint {
  date:    string
  balance: number
  equity:  number
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn:  () => apiFetch<PortfolioSummary>('/api/v1/portfolio/summary'),
    refetchInterval: 30_000,
  })
}

export function useOpenPositions() {
  return useQuery({
    queryKey: ['portfolio', 'positions'],
    queryFn:  () => apiFetch<OpenPosition[]>('/api/v1/portfolio/positions'),
    refetchInterval: 30_000,
  })
}

export function usePortfolioBreakdown() {
  return useQuery({
    queryKey: ['portfolio', 'breakdown'],
    queryFn:  () => apiFetch<PortfolioBreakdown>('/api/v1/portfolio/breakdown'),
  })
}

export function usePortfolioEquityCurve() {
  return useQuery({
    queryKey: ['portfolio', 'equity-curve'],
    queryFn:  () => apiFetch<EquityPoint[]>('/api/v1/portfolio/equity-curve'),
  })
}
