import crypto from 'crypto'

export function generateApiKey(): string {
  // 32 bytes => 64 hex chars
  return crypto.randomBytes(32).toString('hex')
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function getKeyPrefix(key: string): string {
  return key.slice(0, 8)
}


