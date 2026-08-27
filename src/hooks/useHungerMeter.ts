import { useCounter } from './useCounter'

interface UseHungerMeterResult {
    hunger: number
    loading: boolean
    feed: () => void
}

export function useHungerMeter(): UseHungerMeterResult {
    const { value, loading, bump } = useCounter('hunger_meter', 'feed', { step: 1, max: 100 })
    return { hunger: value, loading, feed: bump }
}
