import { Queue, Worker, type Processor } from 'bullmq'
import { env } from '../../config/env.js'

const connection = { url: env.REDIS_URL }

// Queue definitions
export const brokerSyncQueue = new Queue('broker-sync', { connection })
export const alertProcessQueue = new Queue('alert-process', { connection })
export const aiRequestQueue = new Queue('ai-request', { connection })
export const emailQueue = new Queue('email-send', { connection })

// Job type definitions
export type BrokerSyncJob = {
  accountId: string
  userId: string
  brokerType: 'mt4' | 'mt5' | 'binance' | 'ib' | 'ctrader' | 'tradovate'
  fullSync?: boolean
}

export type AlertJob = {
  userId: string
  tradeId?: string
  triggerType: 'drawdown' | 'lotsize' | 'news' | 'pnl_limit'
}

export type AiRequestJob = {
  userId: string
  requestType: 'daily_score' | 'coaching' | 'journal'
  payload: Record<string, unknown>
}

export type EmailJob = {
  to: string
  template: 'welcome' | 'alert' | 'weekly_report' | 'password_reset'
  data: Record<string, unknown>
}

// Worker factory
export function createWorker<T>(
  queueName: string,
  processor: Processor<T>,
  concurrency = 5
): Worker<T> {
  return new Worker<T>(queueName, processor, {
    connection,
    concurrency,
  })
}
