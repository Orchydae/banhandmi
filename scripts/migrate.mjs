// Applies migrations/*.sql in filename order, once each.
//
// Uses DATABASE_URL_UNPOOLED (the direct, non-pooled Neon connection).
// Migrations run session-level statements that PgBouncer's transaction
// pooling does not support, so the pooled URL is the wrong one here.
//
//   node --env-file=.env scripts/migrate.mjs
//   node --env-file=.env scripts/migrate.mjs --dry-run

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')
const dryRun = process.argv.includes('--dry-run')

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!connectionString) {
    console.error('Missing DATABASE_URL_UNPOOLED (or DATABASE_URL). Run `neon env pull` first.')
    process.exit(1)
}
if (!process.env.DATABASE_URL_UNPOOLED) {
    console.warn('! DATABASE_URL_UNPOOLED is not set; falling back to the pooled URL.')
}

const client = new pg.Client({ connectionString })
await client.connect()

try {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name       TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)

    const { rows } = await client.query('SELECT name FROM schema_migrations')
    const applied = new Set(rows.map((r) => r.name))

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
    const pending = files.filter((f) => !applied.has(f))

    if (pending.length === 0) {
        console.log(`Up to date — ${files.length} migration(s) already applied.`)
    }

    for (const file of pending) {
        if (dryRun) {
            console.log(`would apply  ${file}`)
            continue
        }

        const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')

        await client.query('BEGIN')
        try {
            await client.query(sql)
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
            await client.query('COMMIT')
            console.log(`applied      ${file}`)
        } catch (err) {
            await client.query('ROLLBACK')
            console.error(`FAILED       ${file}\n${err.message}`)
            process.exitCode = 1
            break
        }
    }
} finally {
    await client.end()
}
