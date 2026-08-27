import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

export interface WeightEntry {
    date: string
    weight: number
}

interface ProfileResponse {
    birthdate: string | null
    weight: number | null
    weightHistory: WeightEntry[]
}

interface DogProfile {
    birthdate: Date | null
    weight: number | null
    weightHistory: WeightEntry[]
    ageString: string | null
}

const EMPTY_PROFILE: DogProfile = {
    birthdate: null,
    weight: null,
    weightHistory: [],
    ageString: null,
}

export function useDogProfile() {
    const [profile, setProfile] = useState<DogProfile>(EMPTY_PROFILE)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const refetchProfile = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1)
    }, [])

    useEffect(() => {
        let cancelled = false

        setLoading(true)
        setError(null)

        apiGet<ProfileResponse>('/profile')
            .then((data) => {
                if (cancelled) return

                const birthdate = data.birthdate ? new Date(data.birthdate) : null

                setProfile({
                    birthdate,
                    weight: data.weight,
                    weightHistory: data.weightHistory,
                    ageString: birthdate ? formatAge(birthdate) : null,
                })
            })
            .catch((err: unknown) => {
                if (cancelled) return
                console.error('Error in useDogProfile:', err)
                setError(err instanceof Error ? err : new Error('Failed to fetch dog profile'))
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [refreshTrigger])

    const addWeight = useCallback(
        async (newWeight: number): Promise<boolean> => {
            try {
                await apiPost('/weight', { weight: newWeight })
                refetchProfile()
                return true
            } catch (err) {
                console.error('Error adding weight:', err)
                return false
            }
        },
        [refetchProfile],
    )

    return { ...profile, loading, error, refetchProfile, addWeight }
}

function formatAge(birthdate: Date): string {
    const now = new Date()
    let years = now.getFullYear() - birthdate.getFullYear()
    let months = now.getMonth() - birthdate.getMonth()

    if (months < 0 || (months === 0 && now.getDate() < birthdate.getDate())) {
        years--
        months += 12
    }

    // Adjust for negative months after borrowing a year
    if (now.getDate() < birthdate.getDate()) {
        months--
        if (months < 0) {
            months = 11
        }
    }

    return `${years} yrs, ${months} mo`
}
