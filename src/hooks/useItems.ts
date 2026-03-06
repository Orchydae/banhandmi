import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'

export type ItemCategory = 'dream_artifact' | 'favorite_treat' | 'disapproved_item'

export interface Item {
    id: string
    category: ItemCategory
    name: string
    description: string | null
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

        async function fetchItems() {
            setLoading(true)
            setError(null)

            const supabase = getSupabase()
            if (!supabase) {
                setItems([])
                setLoading(false)
                return
            }

            const { data, error: fetchError } = await supabase
                .from('items')
                .select('*')
                .eq('category', category)
                .eq('is_active', true)
                .order('display_order', { ascending: true })

            if (cancelled) return

            if (fetchError) {
                setError(fetchError.message)
                setItems([])
            } else {
                setItems(data as Item[])
            }

            setLoading(false)
        }

        fetchItems()

        return () => {
            cancelled = true
        }
    }, [category])

    return { items, loading, error }
}
