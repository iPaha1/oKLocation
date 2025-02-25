
// src/lib/rate-limit.ts
import { Redis } from '@upstash/redis'
import { prisma } from './prisma'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

export async function rateLimit(
  apiKey: string,
  limit: number = 100, // Default limit of 100 requests
  window: number = 86400 // Default window of 24 hours in seconds
): Promise<RateLimitResult> {
  try {
    // Get the API key details from the database
    const keyDetails = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { rateLimitQuota: true, id: true }
    })

    if (!keyDetails) {
      throw new Error('Invalid API key')
    }

    const actualLimit = keyDetails.rateLimitQuota || limit
    const key = `rate-limit:${keyDetails.id}`
    const now = Math.floor(Date.now() / 1000)
    
    // Use Redis to track request count
    const requestCount = await redis.incr(key)
    
    // Set expiry on first request
    if (requestCount === 1) {
      await redis.expire(key, window)
    }

    // Get TTL
    const ttl = await redis.ttl(key)
    
    // Check if rate limit is exceeded
    const allowed = requestCount <= actualLimit
    
    // Update request count in database periodically
    if (requestCount % 10 === 0) { // Update every 10 requests
      await prisma.apiKey.update({
        where: { id: keyDetails.id },
        data: { 
          dailyRequests: requestCount,
          lastUsed: new Date()
        }
      })
    }

    return {
      allowed,
      remaining: Math.max(0, actualLimit - requestCount),
      reset: now + ttl
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Default to allowed in case of errors, but log the issue
    return {
      allowed: true,
      remaining: 100,
      reset: Math.floor(Date.now() / 1000) + 86400
    }
  }
}
