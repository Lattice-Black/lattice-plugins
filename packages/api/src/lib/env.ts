import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from packages/api/.env
config({ path: join(__dirname, '../../.env') });

/**
 * Environment variable configuration with validation
 */
export const env = {
  // Database
  DATABASE_URL: process.env['DATABASE_URL'] || '',

  // Redis
  REDIS_URL: process.env['REDIS_URL'] || 'redis://localhost:6379',

  // API
  PORT: parseInt(process.env['PORT'] || '3000', 10),
  NODE_ENV: process.env['NODE_ENV'] || 'development',

  // Security
  LATTICE_API_KEY: process.env['LATTICE_API_KEY'] || '',

  // CORS
  ALLOWED_ORIGINS: (process.env['ALLOWED_ORIGINS'] || 'http://localhost:3001').split(','),
} as const;

/**
 * Validate required environment variables
 */
export const validateEnv = (): void => {
  const required = ['DATABASE_URL'];

  const missing = required.filter((key) => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
