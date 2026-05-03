import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const FALLBACK_URL = 'https://qnrcckbykxogzartyrgi.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucmNja2J5a3hvZ3phcnR5cmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTc2MTUsImV4cCI6MjA5Mjg5MzYxNX0.Gn0DW1CKaGc7fEwmr6Q9TYUZtMOQdLbXCY91E4Tuh98'

const safeUrl = (url && url.length > 0) ? url : FALLBACK_URL
const safeKey = (anonKey && anonKey.length > 0) ? anonKey : FALLBACK_KEY

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
