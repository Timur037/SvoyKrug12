export type CircleKind = 'УЖИН' | 'КОФЕ' | 'ПРОГУЛКА' | 'ВЕЧЕР'
export type CircleBg = 'photo' | 'forest' | 'tomato' | 'ink'

export interface Circle {
  id: string
  kind: CircleKind
  day: string
  timeShort: string
  title: string
  place?: string
  price: number
  seats: number
  taken: number
  tilt: number
  bg: CircleBg
  photo?: string
}

export interface Meetup {
  id: string
  date: string
  title: string
  place: string
  seats: number
  taken: number
  mood: 'оживлённо' | 'спокойно' | 'с темой'
  status: 'upcoming' | 'past'
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}
