// ─────────────────────────────────────────────────────────
// Redis — Session & Cache Layer
// ─────────────────────────────────────────────────────────

const Redis = require('ioredis');
const logger = require('./logger');

let redis = null;
let isConnected = false;

function createRedisClient() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis: Max retries reached, running without cache');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      isConnected = true;
      logger.info('✅ Redis connected (cache & sessions)');
    });

    redis.on('error', (err) => {
      isConnected = false;
      logger.warn(`Redis error: ${err.message} — cache disabled`);
    });

    redis.on('close', () => {
      isConnected = false;
    });

    redis.connect().catch(() => {
      logger.warn('⚠️  Redis unavailable — running without cache');
    });
  } catch (err) {
    logger.warn(`⚠️  Redis init failed: ${err.message}`);
  }

  return redis;
}

/** Cache helper — get with fallback */
async function cacheGet(key) {
  if (!isConnected || !redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

/** Cache helper — set with TTL (default 5 min) */
async function cacheSet(key, value, ttlSeconds = 300) {
  if (!isConnected || !redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch { /* silently fail — cache is non-critical */ }
}

/** Cache helper — invalidate */
async function cacheDel(key) {
  if (!isConnected || !redis) return;
  try { await redis.del(key); } catch { /* silent */ }
}

module.exports = { createRedisClient, cacheGet, cacheSet, cacheDel, getRedis: () => redis };
