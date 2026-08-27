import { useCounter } from './useCounter'

interface UseHasPoopedResult {
    hasPooped: number
    loading: boolean
    cleanPoop: () => void
}

export function useHasPooped(): UseHasPoopedResult {
    const { value, loading, bump } = useCounter('has_pooped', 'clean', { step: -1, max: 1 })
    return { hasPooped: value, loading, cleanPoop: bump }
}
