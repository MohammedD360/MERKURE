export type UserPlan = 'starter' | 'pro' | 'elite' | 'institutional'
export type UserRole = 'trader' | 'admin' | 'manager'
export type TraderStyle = 'scalper' | 'daytrader' | 'swingtrader' | 'investor'
export type RiskAppetite = 'low' | 'medium' | 'high' | 'aggressive'

export interface User {
  id: string
  email: string
  role: UserRole
  onboarded: boolean
  createdAt: string
}

export interface TraderProfile {
  userId: string
  style?: TraderStyle
  riskAppetite?: RiskAppetite
  markets: string[]          // ['forex', 'crypto', 'indices', 'actions']
  experienceYears?: number
  updatedAt: string
}

export interface AuthUser extends User {
  plan: UserPlan
  profile?: TraderProfile
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string        // Aussi dans cookie HttpOnly
}
