import { redis } from '../../infrastructure/cache/redis.js'

// Le rate-limit global de /login (10/min/IP) ne freine pas un credential
// stuffing distribué sur beaucoup d'IPs différentes visant le même compte —
// ce compteur par email en est le complément, indépendant de l'IP source.
const LOCKOUT_THRESHOLD = 5
const LOCKOUT_WINDOW_SECONDS = 15 * 60

function lockKey(email: string): string {
  return `login:fail:${email}`
}

export async function isLoginLocked(email: string): Promise<boolean> {
  const count = await redis.get(lockKey(email))
  return Number(count ?? 0) >= LOCKOUT_THRESHOLD
}

export async function recordFailedLogin(email: string): Promise<void> {
  const key = lockKey(email)
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, LOCKOUT_WINDOW_SECONDS)
  }
}

export async function clearFailedLogins(email: string): Promise<void> {
  await redis.del(lockKey(email))
}
