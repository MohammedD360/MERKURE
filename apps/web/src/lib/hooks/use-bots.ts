'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export type BotMode           = 'DRY_RUN' | 'LIVE'
export type BotStatus         = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'STOPPED'
export type BotDecisionStatus = 'SIMULATED' | 'SUBMITTED' | 'FILLED' | 'REJECTED' | 'FAILED'
export type BotEventType      = 'STARTED' | 'PAUSED' | 'RESUMED' | 'STOPPED' | 'CIRCUIT_BREAKER_TRIPPED' | 'ERROR'

export interface RiskConfig {
  maxSessionLossPct:      number
  maxPositionSizeUsd:     number
  maxConcurrentPositions: number
}

export interface MarketFilters {
  categories:      string[]
  minLiquidityUsd: number
  maxMarkets:      number
}

export interface TradingBot {
  id:                      string
  name:                    string
  mode:                    BotMode
  status:                  BotStatus
  marketFilters:           MarketFilters
  riskConfig:              RiskConfig
  sessionStartEquity:      string
  currentEquity:           string
  circuitBreakerTrippedAt: string | null
  createdAt:               string
  updatedAt:               string
}

export interface BotDecision {
  id:        string
  botId:     string
  marketId:  string
  question:  string
  side:      string
  sizeUsd:   string
  price:     string
  status:    BotDecisionStatus
  pnl:       string | null
  createdAt: string
}

export interface BotEvent {
  id:        string
  botId:     string
  type:      BotEventType
  message:   string
  metadata:  Record<string, unknown> | null
  createdAt: string
}

export interface PolymarketMarket {
  id:           string
  question:     string
  category:     string
  yesTokenId:   string
  noTokenId:    string
  yesPrice:     number
  liquidityUsd: number
  volume24hUsd: number
  source:       'real' | 'simulated'
}

export interface WhaleSignal {
  wallet:     string
  sizeUsd:    number
  side:       'BUY' | 'SELL'
  marketHint: string | null
  detectedAt: string
  source:     'real' | 'simulated'
}

export interface CreateBotBody {
  name:               string
  walletAddress:      string
  privateKey:         string
  mode:               BotMode
  marketFilters?:      Partial<MarketFilters>
  riskConfig?:         Partial<RiskConfig>
  sessionStartEquity: number
}

const REFETCH_MS = 15_000 // dashboard "live" — rafraîchi fréquemment sans websocket dédié

export function useBots() {
  return useQuery<TradingBot[]>({
    queryKey: ['bots'],
    queryFn:  () => apiFetch<TradingBot[]>('/api/v1/bots'),
    refetchInterval: REFETCH_MS,
  })
}

export function useBot(id: string | undefined) {
  return useQuery<TradingBot>({
    queryKey: ['bots', id],
    queryFn:  () => apiFetch<TradingBot>(`/api/v1/bots/${id}`),
    enabled:  Boolean(id),
    refetchInterval: REFETCH_MS,
  })
}

export function useBotDecisions(id: string | undefined) {
  return useQuery<BotDecision[]>({
    queryKey: ['bots', id, 'decisions'],
    queryFn:  () => apiFetch<BotDecision[]>(`/api/v1/bots/${id}/decisions`),
    enabled:  Boolean(id),
    refetchInterval: REFETCH_MS,
  })
}

export function useBotEvents(id: string | undefined) {
  return useQuery<BotEvent[]>({
    queryKey: ['bots', id, 'events'],
    queryFn:  () => apiFetch<BotEvent[]>(`/api/v1/bots/${id}/events`),
    enabled:  Boolean(id),
    refetchInterval: REFETCH_MS,
  })
}

export function useBotMarkets() {
  return useQuery<{ markets: PolymarketMarket[]; live: boolean }>({
    queryKey: ['bots', 'markets'],
    queryFn:  () => apiFetch('/api/v1/bots/markets'),
    refetchInterval: REFETCH_MS,
  })
}

export function useWhaleActivity() {
  return useQuery<{ signals: WhaleSignal[]; live: boolean }>({
    queryKey: ['bots', 'whale-activity'],
    queryFn:  () => apiFetch('/api/v1/bots/whale-activity'),
    refetchInterval: REFETCH_MS,
  })
}

export function useCreateBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBotBody) =>
      apiFetch<TradingBot>('/api/v1/bots', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  })
}

function useBotStatusMutation(status: BotStatus) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<TradingBot>(`/api/v1/bots/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['bots'] })
      qc.invalidateQueries({ queryKey: ['bots', id] })
    },
  })
}

export function useStartBot() { return useBotStatusMutation('ACTIVE') }
export function usePauseBot() { return useBotStatusMutation('PAUSED') }
export function useStopBot()  { return useBotStatusMutation('STOPPED') }

export function useDeleteBot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/v1/bots/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  })
}
