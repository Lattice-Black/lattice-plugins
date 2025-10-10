import { Pool } from 'pg';

/**
 * PostgreSQL connection pool (now connects to Supabase)
 */
export const pool = new Pool({
  host: process.env.SUPABASE_DB_HOST || 'aws-0-us-east-2.pooler.supabase.com',
  port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres.hgruvuhrtznijhsqvagn',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Test database connection
 */
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
