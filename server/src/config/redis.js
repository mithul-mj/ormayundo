import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

/**
 * Industry-standard connection options for BullMQ & ioredis.
 * Configured with TCP keepalive to detect dead sockets and exponential backoff retry.
 */
export const redisConnectionOptions = {
  maxRetriesPerRequest: null, // Strictly required by BullMQ for blocking commands
  enableReadyCheck: false,    // Faster handshake, avoids blocking on ready check
  connectTimeout: 10000,
  keepAlive: 30000,           // 30s TCP keep-alive to prevent zombie ghost connections
  retryStrategy(times) {
    const delay = Math.min(times * 500, 10000);
    return delay;
  }
};

/**
 * Returns connection configuration for BullMQ Queue and Worker instances.
 * Passing connection options allows BullMQ to manage and cleanly close its own connections.
 */
export const getBullMQConnectionOptions = () => {
  return {
    url: redisUrl,
    ...redisConnectionOptions
  };
};

// Lazy singleton for standalone commands (only created if explicitly invoked)
let standaloneClient = null;
let lastLoggedErrorTime = 0;

export const getRedisClient = () => {
  if (!standaloneClient) {
    standaloneClient = new Redis(redisUrl, {
      ...redisConnectionOptions,
      connectionName: 'ormayundo:server'
    });

    standaloneClient.on('error', (err) => {
      const now = Date.now();
      if (now - lastLoggedErrorTime > 10000) {
        lastLoggedErrorTime = now;
        console.warn(`[Redis:Standalone] Connection issue: ${err.message} (retrying in background)`);
      }
    });

    standaloneClient.on('connect', () => {
      console.log('[Redis:Standalone] Connected successfully');
    });
  }
  return standaloneClient;
};

// Backward-compatible default export
export default getRedisClient;

/**
 * Gracefully shuts down the standalone Redis client.
 */
export const closeRedis = async () => {
  if (standaloneClient) {
    try {
      await standaloneClient.quit();
      console.log('[Redis:Standalone] Connection closed cleanly.');
    } catch (e) {
      standaloneClient.disconnect();
    } finally {
      standaloneClient = null;
    }
  }
};
