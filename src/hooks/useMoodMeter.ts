import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'

interface UseMoodMeterResult {
    mood: number
    loading: boolean
    pet: () => void
}

export function useMoodMeter(): UseMoodMeterResult {
    const [mood, setMood] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch current value on mount
    useEffect(() => {
        async function fetchMood() {
            const supabase = getSupabase()
            if (!supabase) {
                setMood(0)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('site_counters')
                .select('value')
                .eq('key', 'mood_meter')
                .single()

            if (!error && data) {
                setMood(Math.max(0, Math.min(100, data.value)))
            } else if (error && error.code === 'PGRST116') {
                // If row doesn't exist, we can default to 0
                setMood(0)
            }
            setLoading(false)
        }

        fetchMood()
    }, [])

    // Pet: increment mood by 1, capped at 100
    const pet = useCallback(() => {
        setMood((prev) => Math.min(prev + 1, 100))

        const supabase = getSupabase()
        if (supabase) {
            supabase
                .rpc('increment_counter', { counter_key: 'mood_meter', amount: 1 })
                .then(({ data, error }) => {
                    if (error) {
                        console.error('[mood] pet failed:', error.message)
                    } else if (data !== null) {
                        setMood(Math.max(0, Math.min(100, data)))
                    }
                })
        }
    }, [])

    return { mood, loading, pet }
}
