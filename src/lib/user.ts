import { supabase } from './supabase'
import { getUser as getTgUser } from './telegram'

export interface AppUser {
  id: string
  telegramId: number
  name: string
}

export function getTelegramUser(): { id: number; name: string } | null {
  try {
    const tgUser = getTgUser()
    if (tgUser?.id) {
      return {
        id: tgUser.id,
        name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
      }
    }
  } catch { /* ignore */ }
  return null
}

function getLocalFallbackId(): string {
  const key = 'svoy_krug_user_id'
  const stored = localStorage.getItem(key)
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}

function getLocalTelegramId(): number {
  const stored = localStorage.getItem('svoy_krug_dev_tid')
  if (stored) return parseInt(stored, 10)
  const fake = 1000000 + Math.floor(Math.random() * 9000000)
  localStorage.setItem('svoy_krug_dev_tid', String(fake))
  return fake
}

interface DbUserRow {
  id: string
  telegram_id: number
  name: string
}

// Find user by telegram_id. Never swallows SELECT errors silently.
async function findByTid(telegramId: number): Promise<DbUserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, telegram_id, name')
    .eq('telegram_id', telegramId)
    .maybeSingle()
  if (error) {
    console.error('findByTid SELECT failed:', error)
    throw error
  }
  return (data as DbUserRow | null) ?? null
}

// Sync onboarding name to the DB row if it differs
async function applyName(row: DbUserRow, customName: string | null): Promise<AppUser> {
  localStorage.setItem('svoy_krug_user_id', row.id)
  if (customName && customName !== row.name) {
    await supabase.from('users').update({ name: customName }).eq('id', row.id)
    return { id: row.id, telegramId: row.telegram_id, name: customName }
  }
  return { id: row.id, telegramId: row.telegram_id, name: row.name }
}

export async function upsertUser(): Promise<AppUser> {
  const tg = getTelegramUser()
  const telegramId = tg?.id ?? getLocalTelegramId()
  // Priority: name from onboarding → Telegram name → fallback
  const customName = (() => { try { return localStorage.getItem('svoy_krug_name') } catch { return null } })()
  const name = customName || tg?.name || localStorage.getItem('svoy_krug_dev_name') || 'гость'

  try {
    // 1. Try to find existing user
    const existing = await findByTid(telegramId)
    if (existing) return await applyName(existing, customName)

    // 2. Create new user
    const { data: created, error } = await supabase
      .from('users')
      .insert({ telegram_id: telegramId, name })
      .select('id, telegram_id, name')
      .single()

    if (!error && created) {
      localStorage.setItem('svoy_krug_user_id', created.id)
      return { id: created.id, telegramId: created.telegram_id, name: created.name }
    }

    // 3. INSERT lost a race (409: row with this telegram_id already exists) —
    // re-SELECT and recover the real row instead of a local fallback
    console.warn('upsertUser INSERT failed, re-selecting by telegram_id:', error)
    const recovered = await findByTid(telegramId)
    if (recovered) return await applyName(recovered, customName)
    throw error

  } catch (err) {
    console.error('upsertUser failed, using local fallback:', err)
    // Return local fallback — bookings FK is dropped so this still works
    const localId = getLocalFallbackId()
    return { id: localId, telegramId, name }
  }
}

export interface UserProfile {
  gender?: string
  age?: number
  work?: string
  district?: string
  hobbies?: string[]
  qualities?: string[]
  vibes?: string[]
  relationship?: string
  children?: string
  yourQualities?: string[]
  budget?: string
}

export async function saveProfile(userId: string, profile: UserProfile): Promise<void> {
  const update: Record<string, unknown> = {}
  if (profile.gender    !== undefined) update.gender    = profile.gender
  if (profile.age       !== undefined) update.age       = profile.age
  if (profile.work      !== undefined) update.work      = profile.work
  if (profile.district  !== undefined) update.district  = profile.district
  if (profile.hobbies   !== undefined) update.hobbies   = profile.hobbies
  if (profile.qualities !== undefined) update.qualities = profile.qualities
  if (profile.vibes     !== undefined) update.vibes     = profile.vibes
  if (profile.budget    !== undefined) update.budget    = profile.budget

  const { error } = await supabase.from('users').update(update).eq('id', userId)
  if (error) console.error('saveProfile error:', error)
}
