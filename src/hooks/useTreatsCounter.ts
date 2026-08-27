import { useCounter } from './useCounter'

interface UseTreatsCounterResult {
    treats: number
    loading: boolean
    increment: () => void
}

export function useTreatsCounter(): UseTreatsCounterResult {
    const { value, loading, bump } = useCounter('treats_given', 'treat', { step: 1 })
    return { treats: value, loading, increment: bump }
}
