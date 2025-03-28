export function rateLimit({ interval, uniqueTokenPerInterval }: { interval: number; uniqueTokenPerInterval: number }) {
  const tokenCache = new Map()

  return {
    async check(limit: number, token: string) {
      const now = Date.now()
      const windowStart = now - interval

      const tokenKey = `${token}_${Math.floor(now / interval)}`
      let tokenCount = tokenCache.get(tokenKey) || 0

      if (tokenCount >= limit) {
        throw new Error('Rate limit exceeded')
      }

      tokenCache.set(tokenKey, tokenCount + 1)

      // Cleanup old tokens
      for (const [key, timestamp] of tokenCache.entries()) {
        if (timestamp <= windowStart) {
          tokenCache.delete(key)
        }
      }

      return true
    }
  }
} 