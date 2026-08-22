'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

export interface ControlCheck {
  title:       string
  description: string
  status:      'valid' | 'warning' | 'error'
}

export interface AdviceItem {
  title:  string
  text:   string
  impact: string
}

export interface StrategyAnalysisResult {
  id:               string
  score:            number
  headline:         string
  aiReading:        string
  timingAssessment: string
  confidencePct:    number
  riskReward:       number | null
  controls:         ControlCheck[]
  criteria:         { label: string; value: number }[]
  advice:           AdviceItem[]
  decision:         { verdict: 'enter' | 'wait' | 'avoid'; explanation: string }
  disciplineNote:   string
  createdAt:        string
}

export interface StrategyAnalysisInput {
  instrument:   string
  timeframe:    string
  direction:    string
  style:        string
  entryPrice?:  number
  stopLoss?:    number
  takeProfit?:  number
  thesis?:      string
  imageBase64?: string
}

export interface StrategyHistoryEntry {
  id:         string
  instrument: string
  timeframe:  string
  direction:  string
  style:      string
  score:      number
  headline:   string
  createdAt:  string
}

export function useAnalyzeStrategy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: StrategyAnalysisInput) =>
      apiFetch<StrategyAnalysisResult>('/api/v1/ai/strategy-validator', {
        method: 'POST',
        body:   JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['strategy-history'] }),
  })
}

export function useStrategyHistory(limit = 10) {
  return useQuery({
    queryKey: ['strategy-history', limit],
    queryFn:  () => apiFetch<{ analyses: StrategyHistoryEntry[] }>(`/api/v1/ai/strategy-validator/history?limit=${limit}`),
  })
}
