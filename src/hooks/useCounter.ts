import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

export type CounterKey = 'treats_given' | 'hunger_meter' | 'mood_meter' | 'has_pooped'
export type CounterAction = 'feed' | 'pet' | 'clean' | 'treat'

type CountersResponse = Record<CounterKey, number>

interface UseCounterOptions {
    /** Optimistic step applied locally before the server answers. */
    step: number
    min?: number
    max?: number
}

/**
 * Shared machinery behind the four meter hooks: read the counter on mount, and
 * apply an action optimistically before reconciling with the server's value.
 *
 * All four read the same /counters response — apiGet collapses the
 * concurrent requests into one.
 */
export function useCounter(
    key: CounterKey,
    action: CounterAction,
    { step, min = 0, max = Number.MAX_SAFE_INTEGER }: UseCounterOptions,
) {
    const [value, setValue] = useState(0)
    const [loading, setLoading] = useState(true)

    const clamp = useCallback(
        (next: number) => Math.max(min, Math.min(max, next)),
        [min, max],
    )

    useEffect(() => {
        let cancelled = false

        apiGet<CountersResponse>('/counters')
            .then((counters) => {
                if (!cancelled) setValue(clamp(counters[key] ?? 0))
            })
            .catch((err) => {
                console.error(`[${key}] fetch failed:`, err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [key, clamp])

    const bump = useCallback(() => {
        setValue((prev) => clamp(prev + step))

        apiPost<{ key: CounterKey; value: number }>('/counters', { action })
            .then((result) => setValue(clamp(result.value)))
            .catch((err) => console.error(`[${key}] ${action} failed:`, err))
    }, [key, action, step, clamp])

    return { value, loading, bump }
}
