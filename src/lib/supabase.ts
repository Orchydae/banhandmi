import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
            'Data fetching is disabled.'
        )
        return null
    }

    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey)
    }

    return _supabase
}
