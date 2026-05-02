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

export async function upsertUser(): Promise<AppUser> {
  const tg = getTelegramUser()
  const telegramId = tg?.id ?? getLocalTelegramId()
  const name = tg?.name ?? localStorage.getItem('svoy_krug_dev_name') ?? 'гость'

  try {
    // 1. Try to find existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id, telegram_id, name')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (existing) {
      localStorage.setItem('svoy_krug_user_id', existing.id)
      return { id: existing.id, telegramId: existing.telegram_id, name: existing.name }
    }

    // 2. Create new user
    const { data: created, error } = await supabase
      .from('users')
      .insert({ telegram_id: telegramId, name })
      .select('id, telegram_id, name')
      .single()

    if (error) throw error

    localStorage.setItem('svoy_krug_user_id', created.id)
    return { id: created.id, telegramId: created.telegram_id, name: created.name }

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

  const { error } = await supabase.from('users').update(update).eq('id', userId)
  if (error) console.error('saveProfile error:', error)
}
