import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * PostgreSQL connection pool configuration
 * Uses DATABASE_URL from environment variables
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection fails
});

/**
 * Drizzle ORM client instance
 * Configured with full schema for type-safe queries
 */
export const db = drizzle(pool, { schema });

/**
 * Export pool for direct access if needed (e.g., raw queries, transactions)
 */
export { pool };

/**
 * Health check function for database connection
 * @returns true if database is reachable, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return false;
  }
}

/**
 * Graceful shutdown handler for database pool
 * Call this when the application is shutting down
 */
export async function closeDatabasePool(): Promise<void> {
  await pool.end();
  console.log('[DB] Connection pool closed');
}
