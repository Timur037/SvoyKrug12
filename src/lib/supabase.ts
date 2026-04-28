import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Use safe placeholders during dev when env vars are missing so the app boots without crashing.
const safeUrl = url && url.length > 0 ? url : 'https://placeholder.supabase.co'
const safeKey = anonKey && anonKey.length > 0 ? anonKey : 'placeholder-anon-key'

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
