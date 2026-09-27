import { Pool } from "pg";

/**
 * Vercel's Postgres storage integration (Neon-backed) sets POSTGRES_URL
 * automatically when you add it to your project. We fall back to a plain
 * DATABASE_URL so this also works with any other Postgres host.
 */
const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw at import time in every environment (e.g. during `next build`
  // static analysis) -- only when something actually tries to query.
  console.warn(
    "[db] No POSTGRES_URL or DATABASE_URL set. Database calls will fail until one is configured."
  );
}

// Cache the pool on `globalThis` in development so hot-reloading doesn't
// spawn a new connection pool on every file save.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString,
    // Local Postgres doesn't use SSL; hosted providers (Neon/Vercel Postgres,
    // Supabase, etc.) require it. Their connection strings already include
    // `sslmode=require`, but this makes the client tolerant either way.
    ssl: connectionString?.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
