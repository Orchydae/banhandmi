/**
 * Client for the `banhapi` Neon Function, which is what talks to Postgres.
 *
 * The browser holds no database credentials: it calls the function over HTTPS,
 * and the function owns the `pg` connection pool next to the database.
 */

/**
 * Root of the deployed Neon Function. The API is on a different origin from the
 * frontend, so unlike a same-origin `/api` path this cannot be left blank.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

if (!BASE_URL) {
    console.error(
        '[api] VITE_API_BASE_URL is not set. Run `neon functions get banhapi` for the ' +
            'invocation URL and add it to .env, and to the Vercel project environment.',
    )
}

export class ApiError extends Error {
    constructor(message: string, readonly status: number) {
        super(message)
        this.name = 'ApiError'
    }
}

/**
 * In-flight GETs, keyed by path.
 *
 * The three meter hooks and the treats counter all mount together and all read
 * /counters, so without this they would fire four identical requests on
 * every page load. Only pending requests are shared — nothing is cached once a
 * response lands, so a value is never served stale.
 */
const inFlight = new Map<string, Promise<unknown>>()

export function apiGet<T>(path: string): Promise<T> {
    const pending = inFlight.get(path)
    if (pending) return pending as Promise<T>

    const request = send<T>(path, { method: 'GET' }).finally(() => {
        inFlight.delete(path)
    })

    inFlight.set(path, request)
    return request
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
    return send<T>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, init)

    if (!response.ok) {
        throw new ApiError(await readErrorMessage(response), response.status)
    }

    return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as { error?: string }
        if (body?.error) return body.error
    } catch {
        // Not JSON — fall through to the status line.
    }
    return `${response.status} ${response.statusText}`
}
