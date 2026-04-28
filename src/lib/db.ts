import { supabase } from './supabase'

export interface DbCircle {
  id: string
  kind: string
  time_short: string
  title: string
  hint: string | null
  place: string | null
  price: number
  seats: number
  taken: number
  tilt: number
  bg: string
  photo: string | null
}

export interface DbMeetup {
  id: string
  title: string
  place: string
  date_label: string
  scheduled_at: string | null
  seats: number
  taken: number
  mood: string | null
  status: 'upcoming' | 'past' | 'cancelled'
  photo: string | null
}

export async function fetchCircles(): Promise<DbCircle[]> {
  const { data, error } = await supabase
    .from('circles')
    .select('id, kind, time_short, title, hint, place, price, seats, taken, tilt, bg, photo')
    .eq('is_active', true)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as DbCircle[]
}

export async function fetchUpcomingMeetup(): Promise<DbMeetup | null> {
  const { data, error } = await supabase
    .from('meetups')
    .select('id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
    .eq('status', 'upcoming')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as DbMeetup | null
}

export async function fetchPastMeetups(): Promise<DbMeetup[]> {
  const { data, error } = await supabase
    .from('meetups')
    .select('id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
    .eq('status', 'past')
    .order('scheduled_at', { ascending: false })
    .limit(10)
  if (error) throw error
  return (data ?? []) as DbMeetup[]
}
