import Stripe from 'stripe'
import { env } from '../../config/env.js'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  }
  return _stripe
}
