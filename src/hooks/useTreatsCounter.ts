import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'

interface UseTreatsCounterResult {
    treats: number
    loading: boolean
    increment: () => void
}

export function useTreatsCounter(): UseTreatsCounterResult {
    const [treats, setTreats] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch current counter value
    useEffect(() => {
        async function fetchCounter() {
            const supabase = getSupabase()
            if (!supabase) {
                setTreats(0)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('site_counters')
                .select('value')
                .eq('key', 'treats_given')
                .single()

            if (!error && data) {
                setTreats(data.value)
            }
            setLoading(false)
        }

        fetchCounter()
    }, [])

    // Increment counter (optimistic update + DB call)
    const increment = useCallback(() => {
        setTreats((prev) => prev + 1)

        const supabase = getSupabase()
        if (supabase) {
            supabase
                .rpc('increment_counter', { counter_key: 'treats_given' })
                .then(({ error }) => {
                    if (error) {
                        console.error('[treats] increment failed:', error.message)
                    }
                })
        }
    }, [])

    return { treats, loading, increment }
}
