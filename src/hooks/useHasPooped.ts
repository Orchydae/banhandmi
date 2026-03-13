import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'

interface UseHasPoopedResult {
    hasPooped: number
    loading: boolean
    cleanPoop: () => void
}

export function useHasPooped(): UseHasPoopedResult {
    const [hasPooped, setHasPooped] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch current value on mount
    useEffect(() => {
        async function fetchPoop() {
            const supabase = getSupabase()
            if (!supabase) {
                setHasPooped(0)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('site_counters')
                .select('value')
                .eq('key', 'has_pooped')
                .single()

            if (!error && data) {
                setHasPooped(Math.max(0, Math.min(1, data.value)))
            }
            setLoading(false)
        }

        fetchPoop()
    }, [])

    // Clean poop: decrement has_pooped by 1, clamped at 0
    const cleanPoop = useCallback(() => {
        setHasPooped((prev) => Math.max(prev - 1, 0))

        const supabase = getSupabase()
        if (supabase) {
            supabase
                .rpc('increment_counter', { counter_key: 'has_pooped', amount: -1 })
                .then(({ data, error }) => {
                    if (error) {
                        console.error('[poop] clean failed:', error.message)
                    } else if (data !== null) {
                        setHasPooped(Math.max(0, Math.min(1, data)))
                    }
                })
        }
    }, [])

    return { hasPooped, loading, cleanPoop }
}
