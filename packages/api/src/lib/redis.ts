import { createClient } from 'redis';
import { env } from './env';

/**
 * Redis client for caching and real-time event correlation
 */
export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClient> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  await redisClient.connect();

  return redisClient;
};

/**
 * Disconnect Redis client on process termination
 */
process.on('beforeExit', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});
