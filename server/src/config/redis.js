import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null // This setting is strictly required by BullMQ
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection Error. Make sure your local Redis server is running!', err.message);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

export default redisConnection;
