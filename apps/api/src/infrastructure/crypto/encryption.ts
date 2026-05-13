import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { env } from '../../config/env.js'

const ALGO = 'aes-256-gcm'
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex') // 32 bytes from hex string

export function encrypt(data: Record<string, string>): Buffer {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Layout: iv(12 bytes) + authTag(16 bytes) + ciphertext
  return Buffer.concat([iv, tag, encrypted])
}

export function decrypt(raw: Buffer): Record<string, string> {
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const encrypted = raw.subarray(28)
  const decipher = createDecipheriv(ALGO, KEY, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(decrypted.toString('utf8')) as Record<string, string>
}
