import { Pool, type QueryResultRow } from 'pg'
import { attachDatabasePool } from '@neon/functions'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Neon injects it on any branch that has Postgres.')
}

/**
 * One pool per isolate, created at module scope and reused across every request
 * that isolate serves. `max` stays small because the runtime may run several
 * isolates in parallel, each with its own pool.
 */
export const pool = new Pool({ connectionString, max: 5 })

// Without a pool 'error' listener, an idle-client disconnect becomes an
// uncaughtException and Node tears the isolate down.
attachDatabasePool(pool)

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await pool.query<T>(text, params)
    return result.rows
}

/** Same as `query`, for statements expected to match at most one row. */
export async function queryOne<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
    const rows = await query<T>(text, params)
    return rows[0] ?? null
}
