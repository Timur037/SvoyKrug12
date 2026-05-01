import { supabase } from './supabase'
import { getUser as getTgUser } from './telegram'

export interface AppUser {
  id: string // UUID from Supabase users table
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
  } catch {
    /* ignore */
  }
  return null
}

// Upsert user in Supabase, return AppUser
export async function upsertUser(): Promise<AppUser> {
  const tg = getTelegramUser()

  // Fallback for dev: use a fake telegram_id stored in localStorage
  const telegramId =
    tg?.id ??
    (() => {
      const stored = localStorage.getItem('svoy_krug_dev_tid')
      if (stored) return parseInt(stored, 10)
      const fake = 1000000 + Math.floor(Math.random() * 9000000)
      localStorage.setItem('svoy_krug_dev_tid', String(fake))
      return fake
    })()

  const name = tg?.name ?? localStorage.getItem('svoy_krug_dev_name') ?? 'гость'

  const { data, error } = await supabase
    .from('users')
    .upsert({ telegram_id: telegramId, name }, { onConflict: 'telegram_id' })
    .select('id, telegram_id, name')
    .single()

  if (error) throw error

  return {
    id: data.id,
    telegramId: data.telegram_id,
    name: data.name,
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
  if (profile.gender   !== undefined) update.gender    = profile.gender
  if (profile.age      !== undefined) update.age       = profile.age
  if (profile.work     !== undefined) update.work      = profile.work
  if (profile.district !== undefined) update.district  = profile.district
  if (profile.hobbies  !== undefined) update.hobbies   = profile.hobbies
  if (profile.qualities !== undefined) update.qualities = profile.qualities
  if (profile.vibes    !== undefined) update.vibes     = profile.vibes

  const { error } = await supabase.from('users').update(update).eq('id', userId)
  if (error) throw error
}
