import { useCounter } from './useCounter'

interface UseMoodMeterResult {
    mood: number
    loading: boolean
    pet: () => void
}

export function useMoodMeter(): UseMoodMeterResult {
    const { value, loading, bump } = useCounter('mood_meter', 'pet', { step: 1, max: 100 })
    return { mood: value, loading, pet: bump }
}
