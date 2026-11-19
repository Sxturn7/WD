import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY env var must be a 64-character hex string')
  }
  return Buffer.from(hex, 'hex')
}

function encryptString(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':')
}

function decryptString(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')
  const [ivB64, tagB64, encB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(encB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

/** Encrypt any JSON-serialisable value. Returns { _enc: "..." }. */
export function encryptJSON(value: unknown): { _enc: string } {
  return { _enc: encryptString(JSON.stringify(value)) }
}

/**
 * Decrypt a value previously encrypted with encryptJSON.
 * If the stored value has no _enc key (legacy plain data), returns it as-is.
 * Returns null on any error.
 */
export function decryptJSON<T>(stored: unknown): T | null {
  if (!stored || typeof stored !== 'object') return null
  const enc = (stored as Record<string, unknown>)._enc
  if (typeof enc !== 'string') {
    // Legacy unencrypted data - return as-is
    return stored as T
  }
  try {
    return JSON.parse(decryptString(enc)) as T
  } catch {
    return null
  }
}
