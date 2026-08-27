import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'

export type ItemCategory = 'dream_artifact' | 'favorite_treat' | 'disapproved_item'

export interface Item {
    id: string
    category: ItemCategory
    name: string
    name_fr: string | null
    description: string | null
    description_fr: string | null
    image_url: string | null
    affiliate_url: string | null
    price_hint: number | null
    display_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

interface UseItemsResult {
    items: Item[]
    loading: boolean
    error: string | null
}

export function useItems(category: ItemCategory): UseItemsResult {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setError(null)

        apiGet<Item[]>(`/items?category=${encodeURIComponent(category)}`)
            .then((data) => {
                if (!cancelled) setItems(data)
            })
            .catch((err: unknown) => {
                if (cancelled) return
                setError(err instanceof Error ? err.message : 'Failed to load items')
                setItems([])
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [category])

    return { items, loading, error }
}
