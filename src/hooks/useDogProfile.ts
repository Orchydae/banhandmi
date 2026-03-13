import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';

export interface WeightEntry {
    date: string;
    weight: number;
}

interface DogProfile {
    birthdate: Date | null;
    weight: number | null;
    weightHistory: WeightEntry[];
    ageString: string | null;
}

export function useDogProfile() {
    const [profile, setProfile] = useState<DogProfile>({
        birthdate: null,
        weight: null,
        weightHistory: [],
        ageString: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetchProfile = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            setLoading(true);
            setError(null);

            const supabase = getSupabase();
            if (!supabase) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                // Fetch birthdate from site_counters
                const birthdatePromise = supabase
                    .from('site_counters')
                    .select('value')
                    .eq('key', 'dog_birthdate')
                    .single();

                // Fetch full weight history (last 5 entries)
                const weightPromise = supabase
                    .from('weight_history')
                    .select('date, weight')
                    .order('date', { ascending: true })
                    .limit(5);

                const [birthdateResult, weightResult] = await Promise.all([
                    birthdatePromise,
                    weightPromise,
                ]);

                if (birthdateResult.error && birthdateResult.error.code !== 'PGRST116') {
                    console.error('Error fetching birthdate:', birthdateResult.error);
                }
                if (weightResult.error) {
                    console.error('Error fetching weight:', weightResult.error);
                }

                if (isMounted) {
                    let birthdate: Date | null = null;
                    let ageString: string | null = null;

                    if (birthdateResult.data) {
                        // site_counters value is numeric, assuming Unix timestamp in seconds
                        birthdate = new Date(birthdateResult.data.value * 1000);

                        // Calculate age
                        const now = new Date();
                        let years = now.getFullYear() - birthdate.getFullYear();
                        let months = now.getMonth() - birthdate.getMonth();

                        if (months < 0 || (months === 0 && now.getDate() < birthdate.getDate())) {
                            years--;
                            months += 12;
                        }

                        // Adjust for negative months after borrowing a year
                        if (now.getDate() < birthdate.getDate()) {
                            months--;
                            if (months < 0) {
                                months = 11;
                            }
                        }

                        ageString = `${years} yrs, ${months} mo`;
                    }

                    let weight: number | null = null;
                    let weightHistory: WeightEntry[] = [];

                    if (weightResult.data && weightResult.data.length > 0) {
                        weightHistory = (weightResult.data as WeightEntry[]).reverse();
                        // The array is sorted ascending again, so the last element is the latest weight
                        weight = weightHistory[weightHistory.length - 1].weight;
                    }

                    setProfile({
                        birthdate,
                        weight,
                        weightHistory,
                        ageString,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch dog profile'));
                    console.error('Error in useDogProfile:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [refreshTrigger]);

    const addWeight = async (newWeight: number): Promise<boolean> => {
        const supabase = getSupabase();
        if (!supabase) return false;

        try {
            const { error: insertError } = await supabase
                .from('weight_history')
                .insert([{ weight: newWeight }]);

            if (insertError) {
                console.error('Error adding weight:', insertError);
                return false;
            }

            refetchProfile();
            return true;
        } catch (err) {
            console.error('Error in addWeight:', err);
            return false;
        }
    };

    return { ...profile, loading, error, refetchProfile, addWeight };
}
