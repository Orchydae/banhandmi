import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'

interface UseHungerMeterResult {
    hunger: number
    loading: boolean
    feed: () => void
}

export function useHungerMeter(): UseHungerMeterResult {
    const [hunger, setHunger] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch current value on mount
    useEffect(() => {
        async function fetchHunger() {
            const supabase = getSupabase()
            if (!supabase) {
                setHunger(0)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('site_counters')
                .select('value')
                .eq('key', 'hunger_meter')
                .single()

            if (!error && data) {
                setHunger(Math.max(0, Math.min(100, data.value)))
            }
            setLoading(false)
        }

        fetchHunger()
    }, [])

    // Feed: increment hunger by 1, capped at 100
    const feed = useCallback(() => {
        setHunger((prev) => Math.min(prev + 1, 100))

        const supabase = getSupabase()
        if (supabase) {
            supabase
                .rpc('increment_counter', { counter_key: 'hunger_meter', amount: 1 })
                .then(({ data, error }) => {
                    if (error) {
                        console.error('[hunger] feed failed:', error.message)
                    } else if (data !== null) {
                        setHunger(Math.max(0, Math.min(100, data)))
                    }
                })
        }
    }, [])

    return { hunger, loading, feed }
}
