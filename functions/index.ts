import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import Stripe from 'stripe'
import { query, queryOne } from './db.js'

/**
 * The backend for @banhandmi, deployed as a Neon Function.
 *
 * It runs in the same region as the branch's Postgres and holds the only
 * database credentials — the browser reaches this over HTTPS and never sees
 * DATABASE_URL.
 *
 * This URL is public and the app has no user accounts, so every route here is
 * deliberately unauthenticated — the same posture the app has always had, where
 * anyone could read the site data and nudge a counter. Writes are constrained
 * by shape rather than identity: the counter route accepts a fixed set of named
 * actions, not an arbitrary key and amount.
 */

const app = new Hono()

// ---------- config ----------

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const APP_BASE_URL = process.env.APP_BASE_URL ?? ''

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Pinned to the version the previous checkout handler ran against, so moving
// this code cannot shift live payment behaviour. The installed SDK defaults to
// a newer release of the same major ("dahlia").
const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, { apiVersion: '2026-04-22.dahlia' as Stripe.LatestApiVersion })
    : null

// ---------- middleware ----------

app.use(
    '*',
    cors({
        // No cookies or Authorization headers are involved, so reflecting the
        // origin is safe when no allowlist is configured. Set ALLOWED_ORIGINS
        // to restrict it to the deployed frontends.
        origin: (origin) => {
            if (ALLOWED_ORIGINS.length === 0) return origin || '*'
            return ALLOWED_ORIGINS.includes(origin) ? origin : null
        },
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
        maxAge: 86_400,
    }),
)

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return c.json({ error: err.message }, err.status)
    }
    console.error('[banhapi] unhandled error:', err)
    return c.json({ error: 'Internal server error' }, 500)
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

// ---------- meta ----------

app.get('/', (c) => c.json({ service: 'banhandmi-api', branch: process.env.NEON_BRANCH ?? null }))

app.get('/health', async (c) => {
    await query('SELECT 1')
    return c.json({ ok: true })
})

// ---------- counters ----------

const COUNTER_KEYS = ['treats_given', 'hunger_meter', 'mood_meter', 'has_pooped'] as const
type CounterKey = (typeof COUNTER_KEYS)[number]

/**
 * Every write the UI can perform, as a fixed (counter, delta) pair. The browser
 * sends an action name, never a key and an amount, so no request can move a
 * meter by an arbitrary step. Bounds are enforced again in increment_counter().
 */
const ACTIONS: Record<string, { key: CounterKey; amount: number }> = {
    feed: { key: 'hunger_meter', amount: 1 },
    pet: { key: 'mood_meter', amount: 1 },
    clean: { key: 'has_pooped', amount: -1 },
    treat: { key: 'treats_given', amount: 1 },
}

app.get('/counters', async (c) => {
    // get_ogotchi_state() applies whatever decay is owed since the last read
    // and then returns the counters, so the meters age without a scheduler.
    const row = await queryOne<{ state: Record<string, number> }>(
        'SELECT get_ogotchi_state() AS state',
    )

    const state = row?.state ?? {}
    const counters = Object.fromEntries(COUNTER_KEYS.map((key) => [key, Number(state[key] ?? 0)]))

    c.header('Cache-Control', 'no-store')
    return c.json(counters)
})

app.post('/counters', async (c) => {
    const { action } = await readJson<{ action?: string }>(c.req.raw)

    if (!action || !(action in ACTIONS)) {
        throw new HTTPException(400, {
            message: `action must be one of: ${Object.keys(ACTIONS).join(', ')}`,
        })
    }

    const { key, amount } = ACTIONS[action]

    const row = await queryOne<{ value: number }>('SELECT increment_counter($1, $2)::int AS value', [
        key,
        amount,
    ])

    // increment_counter returns NULL when the counter row is missing.
    if (row?.value == null) {
        throw new HTTPException(500, { message: `Counter "${key}" is not seeded` })
    }

    c.header('Cache-Control', 'no-store')
    return c.json({ key, value: row.value })
})

// ---------- items ----------

const CATEGORIES = ['dream_artifact', 'favorite_treat', 'disapproved_item']

app.get('/items', async (c) => {
    const category = c.req.query('category')

    if (!category || !CATEGORIES.includes(category)) {
        throw new HTTPException(400, {
            message: `category must be one of: ${CATEGORIES.join(', ')}`,
        })
    }

    const items = await query(
        `SELECT id, category, name, name_fr, description, description_fr,
                image_url, affiliate_url, price_hint, display_order,
                is_active, created_at, updated_at
           FROM items
          WHERE category = $1 AND is_active
          ORDER BY display_order ASC`,
        [category],
    )

    c.header('Cache-Control', 'public, max-age=60')
    return c.json(items)
})

// ---------- profile ----------

const WEIGHT_HISTORY_LIMIT = 5
const MIN_KG = 0.5
const MAX_KG = 100

app.get('/profile', async (c) => {
    const [birthdateRow, weights] = await Promise.all([
        queryOne<{ value: string }>("SELECT value FROM site_counters WHERE key = 'dog_birthdate'"),
        query<{ date: string; weight: number }>(
            `SELECT to_char(date, 'YYYY-MM-DD') AS date, weight
               FROM weight_history
              ORDER BY date DESC
              LIMIT $1`,
            [WEIGHT_HISTORY_LIMIT],
        ),
    ])

    // Stored as Unix seconds, and absent until seeded — the UI renders a blank age.
    const birthdate = birthdateRow ? new Date(Number(birthdateRow.value) * 1000).toISOString() : null
    const weightHistory = weights.reverse()

    c.header('Cache-Control', 'no-store')
    return c.json({
        birthdate,
        weight: weightHistory.at(-1)?.weight ?? null,
        weightHistory,
    })
})

app.post('/weight', async (c) => {
    const body = await readJson<{ weight?: unknown }>(c.req.raw)
    const weight = Number(body.weight)

    // Bánh is a Shiba, not a blue whale. Rejects typos and junk payloads alike.
    if (!Number.isFinite(weight) || weight < MIN_KG || weight > MAX_KG) {
        throw new HTTPException(400, {
            message: `weight must be a number between ${MIN_KG} and ${MAX_KG}`,
        })
    }

    const row = await queryOne(
        `INSERT INTO weight_history (weight)
         VALUES ($1)
         RETURNING to_char(date, 'YYYY-MM-DD') AS date, weight`,
        [weight],
    )

    c.header('Cache-Control', 'no-store')
    return c.json(row, 201)
})

// ---------- donations ----------

// "recent" drives the scrolling marquee, "top" drives the donor wall.
const ORDER_BY: Record<string, string> = {
    recent: 'created_at DESC',
    top: 'amount_cents DESC',
}

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200

app.get('/donations', async (c) => {
    const sort = c.req.query('sort') ?? 'recent'
    if (!(sort in ORDER_BY)) {
        throw new HTTPException(400, {
            message: `sort must be one of: ${Object.keys(ORDER_BY).join(', ')}`,
        })
    }

    const rawLimit = c.req.query('limit')
    const limit = rawLimit === undefined ? DEFAULT_LIMIT : Number(rawLimit)
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        throw new HTTPException(400, {
            message: `limit must be an integer between 1 and ${MAX_LIMIT}`,
        })
    }

    // ORDER_BY is looked up from a fixed map, never interpolated from input.
    const donations = await query(
        `SELECT id, donor_name, message, amount_cents::int AS amount_cents, created_at
           FROM donations
          ORDER BY ${ORDER_BY[sort]}
          LIMIT $1`,
        [limit],
    )

    c.header('Cache-Control', 'public, max-age=30')
    return c.json(donations)
})

// ---------- stripe ----------

const MIN_CENTS = 50
const MAX_CENTS = 1_000_000 // $10,000
const MAX_NAME = 255
const MAX_MESSAGE = 500
const RETURN_PATH = '/donation-success'

app.post('/checkout-session', async (c) => {
    if (!stripe) throw new HTTPException(503, { message: 'Stripe is not configured' })

    const body = await readJson<{
        amount_cents?: unknown
        donor_name?: unknown
        message?: unknown
    }>(c.req.raw)

    const amountCents = Number(body.amount_cents)
    if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
        throw new HTTPException(400, {
            message: `amount_cents must be an integer between ${MIN_CENTS} and ${MAX_CENTS}`,
        })
    }

    const donorName = String(body.donor_name ?? '').trim().slice(0, MAX_NAME) || 'Anonymous'
    const message = String(body.message ?? '').trim().slice(0, MAX_MESSAGE) || ''

    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        return_url: `${resolveAppOrigin(c.req.header('origin'))}${RETURN_PATH}`,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Treat for Bánh 🐾' },
                    unit_amount: amountCents,
                },
                quantity: 1,
            },
        ],
        metadata: { donor_name: donorName, message },
    })

    c.header('Cache-Control', 'no-store')
    return c.json({ clientSecret: session.client_secret })
})

app.post('/stripe-webhook', async (c) => {
    if (!stripe || !stripeWebhookSecret) {
        throw new HTTPException(503, { message: 'Stripe is not configured' })
    }

    const signature = c.req.header('stripe-signature')
    if (!signature) throw new HTTPException(400, { message: 'Missing stripe-signature header' })

    let event: Stripe.Event
    try {
        // The signature is computed over the raw bytes, so read the body as text.
        const rawBody = await c.req.text()
        event = await stripe.webhooks.constructEventAsync(rawBody, signature, stripeWebhookSecret)
    } catch (err) {
        console.error('[banhapi] stripe signature verification failed:', err)
        throw new HTTPException(400, {
            message: err instanceof Error ? err.message : 'Invalid signature',
        })
    }

    if (event.type !== 'checkout.session.completed') {
        return c.json({ received: true, ignored: event.type })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const paymentId =
        typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent?.id ?? null)

    // Stripe retries until it gets a 2xx, so the same event can land more than
    // once. The unique constraint on stripe_payment_id makes a redelivery a
    // no-op instead of a duplicate donor-wall entry.
    const inserted = await queryOne<{ id: string }>(
        `INSERT INTO donations (stripe_payment_id, donor_name, message, amount_cents)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (stripe_payment_id) DO NOTHING
         RETURNING id`,
        [
            paymentId,
            session.metadata?.donor_name || 'Anonymous',
            session.metadata?.message || null,
            session.amount_total ?? 0,
        ],
    )

    return c.json({ received: true, recorded: inserted !== null })
})

// ---------- helpers ----------

async function readJson<T>(request: Request): Promise<T> {
    try {
        return (await request.json()) as T
    } catch {
        throw new HTTPException(400, { message: 'Body must be valid JSON' })
    }
}

/**
 * Where Stripe should send the donor back to.
 *
 * The frontend sits on a different origin from this function, so the request's
 * own host is the wrong answer. Use the caller's Origin when it is on the
 * allowlist, and otherwise the configured app URL — never an unvetted value,
 * which would turn checkout into an open redirect.
 */
function resolveAppOrigin(origin: string | undefined): string {
    if (origin && ALLOWED_ORIGINS.includes(origin)) return origin
    if (APP_BASE_URL) return APP_BASE_URL.replace(/\/$/, '')

    throw new HTTPException(500, {
        message: 'APP_BASE_URL is not configured, and the request origin is not allowlisted',
    })
}

export default app
