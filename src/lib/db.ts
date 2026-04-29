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

// Fetch single circle by id
export async function fetchCircleById(id: string): Promise<DbCircle | null> {
  const { data, error } = await supabase
    .from('circles')
    .select('id, kind, time_short, title, hint, place, price, seats, taken, tilt, bg, photo')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as DbCircle | null
}

// Fetch meetups for a circle (upcoming first)
export async function fetchMeetupsByCircle(circleId: string): Promise<DbMeetup[]> {
  const { data, error } = await supabase
    .from('meetups')
    .select('id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
    .eq('circle_id', circleId)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as DbMeetup[]
}

// Check if user booked a specific meetup. Returns booking id or null.
export async function fetchBooking(userId: string, meetupId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', userId)
    .eq('meetup_id', meetupId)
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
}

// Book a meetup. Returns booking id.
export async function bookMeetup(userId: string, meetupId: string): Promise<string> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ user_id: userId, meetup_id: meetupId })
    .select('id')
    .single()
  if (error) throw error
  // Increment taken using read-then-write (race conditions acceptable for MVP)
  const { data: m } = await supabase.from('meetups').select('taken').eq('id', meetupId).single()
  if (m) {
    await supabase.from('meetups').update({ taken: (m.taken ?? 0) + 1 }).eq('id', meetupId)
  }
  return data.id
}

// Cancel a booking
export async function cancelBooking(bookingId: string, meetupId: string): Promise<void> {
  await supabase.from('bookings').delete().eq('id', bookingId)
  const { data: m } = await supabase.from('meetups').select('taken').eq('id', meetupId).single()
  if (m && m.taken > 0) {
    await supabase.from('meetups').update({ taken: m.taken - 1 }).eq('id', meetupId)
  }
}

// Fetch all bookings for a user (with meetup details)
export interface DbBookingWithMeetup {
  id: string
  meetup_id: string
  mood: string | null
  meetup: DbMeetup
}

export async function fetchUserBookings(userId: string): Promise<DbBookingWithMeetup[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, meetup_id, mood, meetup:meetup_id(id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as DbBookingWithMeetup[]
}

// Save post-event mood to a booking
export async function saveMoodToBooking(bookingId: string, mood: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ mood })
    .eq('id', bookingId)
  if (error) throw error
}

// User profile stats derived from bookings
export interface UserProfile {
  totalBookings: number
  pastBookings: number
  uniquePlaces: number
  upcomingBooking: DbBookingWithMeetup | null
  pastBookingsList: DbBookingWithMeetup[]
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const bookings = await fetchUserBookings(userId)
  const upcoming = bookings.find((b) => b.meetup.status === 'upcoming') ?? null
  const past = bookings.filter((b) => b.meetup.status === 'past')
  const uniquePlaces = new Set(bookings.map((b) => b.meetup.place)).size
  return {
    totalBookings: bookings.length,
    pastBookings: past.length,
    uniquePlaces,
    upcomingBooking: upcoming,
    pastBookingsList: past,
  }
}
