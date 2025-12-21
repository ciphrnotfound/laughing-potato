import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Reuse connection if possible
let redis: IORedis | null = null

function getRedis() {
    if (!redis && process.env.REDIS_URL) {
        redis = new IORedis(REDIS_URL)
    }
    return redis
}

export interface RateLimitResult {
    success: boolean
    remaining: number
    reset: number
}

/**
 * Simple sliding window rate limiter
 * @param identifier Unique ID (IP, userId, etc.)
 * @param limit Max requests
 * @param window Duration in seconds
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    window: number = 60
): Promise<RateLimitResult> {
    const client = getRedis()
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - window

    const key = `rate_limit:${identifier}`

    if (client) {
        try {
            // Use Redis sorted set for sliding window
            const multi = client.multi()
            multi.zremrangebyscore(key, 0, windowStart)
            multi.zadd(key, now, `${now}_${Math.random()}`)
            multi.zcard(key)
            multi.expire(key, window)

            const results = await multi.exec()
            if (!results) throw new Error('Redis multi failed')

            const count = results[2][1] as number

            return {
                success: count <= limit,
                remaining: Math.max(0, limit - count),
                reset: now + window
            }
        } catch (error) {
            console.error('Rate limit redis error:', error)
            // Fallback to success on redis error to avoid blocking users
            return { success: true, remaining: 1, reset: now + window }
        }
    }

    // Basic memory fallback for local dev without redis
    // In production, redis is mandatory for rate limiting across instances
    return { success: true, remaining: limit, reset: now + window }
}
