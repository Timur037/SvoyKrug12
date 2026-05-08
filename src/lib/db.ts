import { supabase } from './supabase'

export type GenderFilter = 'mixed' | 'women_only' | 'men_only' | 'pairs'

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
  gender_filter: GenderFilter
}

export interface DbMeetup {
  id: string
  circle_id: string | null
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

export interface DbParticipant {
  id: string
  name: string
  age: number | null
  telegram_id: number | null
}

export async function fetchCircles(): Promise<DbCircle[]> {
  const { data, error } = await supabase
    .from('circles')
    .select('id, kind, time_short, title, hint, place, price, seats, taken, tilt, bg, photo, gender_filter')
    .eq('is_active', true)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as DbCircle[]
}

export async function fetchUpcomingMeetup(): Promise<DbMeetup | null> {
  const { data, error } = await supabase
    .from('meetups')
    .select('id, circle_id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
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
    .select('id, circle_id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
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
    .select('id, kind, time_short, title, hint, place, price, seats, taken, tilt, bg, photo, gender_filter')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as DbCircle | null
}

// Fetch meetups for a circle (upcoming first)
export async function fetchMeetupsByCircle(circleId: string): Promise<DbMeetup[]> {
  const { data, error } = await supabase
    .from('meetups')
    .select('id, circle_id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo')
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
  await supabase.rpc('increment_meetup_taken', { meetup_id: meetupId })
  return data.id
}

// Cancel a booking
export async function cancelBooking(bookingId: string, meetupId: string): Promise<void> {
  await supabase.from('bookings').delete().eq('id', bookingId)
  await supabase.rpc('decrement_meetup_taken', { meetup_id: meetupId })
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
    .select('id, meetup_id, mood, meetup:meetup_id(id, circle_id, title, place, date_label, scheduled_at, seats, taken, mood, status, photo)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as DbBookingWithMeetup[]
}

export async function fetchMeetupParticipants(meetupId: string): Promise<DbParticipant[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('user:user_id(id, name, age, telegram_id)')
    .eq('meetup_id', meetupId)
  if (error) throw error
  type Row = { user: DbParticipant | DbParticipant[] | null }
  return ((data ?? []) as unknown as Row[])
    .map((b) => (Array.isArray(b.user) ? b.user[0] : b.user))
    .filter((u): u is DbParticipant => u != null)
}

// Returns the most recent past booking that hasn't been reviewed yet (mood is null)
export async function fetchUnreviewedPastBooking(userId: string): Promise<DbBookingWithMeetup | null> {
  const bookings = await fetchUserBookings(userId)
  return bookings.find(
    (b) => b.meetup.status === 'past' && !b.mood
  ) ?? null
}

// Save post-event mood to a booking
export async function saveMoodToBooking(bookingId: string, mood: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ mood })
    .eq('id', bookingId)
  if (error) throw error
}

// Save venue rating to a booking (1-5)
export async function saveVenueRating(bookingId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ venue_rating: rating })
    .eq('id', bookingId)
  if (error) throw error
}

// Save "want to meet again" selections
export async function saveMatchRequests(
  fromUserId: string,
  toUserIds: string[],
  meetupId: string
): Promise<void> {
  if (!toUserIds.length) return
  const rows = toUserIds.map((to) => ({
    from_user_id: fromUserId,
    to_user_id: to,
    meetup_id: meetupId,
  }))
  const { error } = await supabase
    .from('match_requests')
    .upsert(rows, { onConflict: 'from_user_id,to_user_id,meetup_id' })
  if (error) throw error
}

// Find mutual matches: others who also selected current user for this meetup
export async function findMutualMatches(
  userId: string,
  meetupId: string
): Promise<DbParticipant[]> {
  // People current user selected
  const { data: sent } = await supabase
    .from('match_requests')
    .select('to_user_id')
    .eq('from_user_id', userId)
    .eq('meetup_id', meetupId)

  const sentIds = (sent ?? []).map((r) => r.to_user_id as string)
  if (!sentIds.length) return []

  // Of those, who also selected the current user?
  const { data: mutual, error } = await supabase
    .from('match_requests')
    .select('user:from_user_id(id, name, age, telegram_id)')
    .eq('to_user_id', userId)
    .eq('meetup_id', meetupId)
    .in('from_user_id', sentIds)

  if (error) throw error
  type Row = { user: DbParticipant | DbParticipant[] | null }
  return ((mutual ?? []) as unknown as Row[])
    .map((r) => (Array.isArray(r.user) ? r.user[0] : r.user))
    .filter((u): u is DbParticipant => u != null)
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
  const uniquePlaces = new Set(past.map((b) => b.meetup.place)).size
  return {
    totalBookings: past.length,
    pastBookings: past.length,
    uniquePlaces,
    upcomingBooking: upcoming,
    pastBookingsList: past,
  }
}
