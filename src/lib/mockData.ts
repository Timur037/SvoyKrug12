import type { Circle, Meetup } from '../types'

export const MOCK_CIRCLES: Circle[] = [
  {
    id: 'c1',
    kind: 'УЖИН',
    day: 'четверг',
    timeShort: '19:30',
    title: 'долгий ужин на Покровке',
    place: 'кафе Bottega · Покровка',
    price: 1200,
    seats: 6,
    taken: 4,
    tilt: -2.2,
    bg: 'photo',
    photo:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=70',
  },
  {
    id: 'c2',
    kind: 'ВЕЧЕР',
    day: 'пятница',
    timeShort: '20:00',
    title: 'разговоры у огня',
    place: 'квартира на Чистых прудах',
    price: 800,
    seats: 6,
    taken: 3,
    tilt: 1.4,
    bg: 'forest',
  },
  {
    id: 'c3',
    kind: 'ПРОГУЛКА',
    day: 'суббота',
    timeShort: '15:00',
    title: 'неспешно по Нескучному',
    place: 'Нескучный сад',
    price: 0,
    seats: 5,
    taken: 2,
    tilt: 0.8,
    bg: 'tomato',
  },
]

export const MOCK_UPCOMING: Meetup = {
  id: 'm-up',
  date: 'чт, 14 ноября · 19:30',
  title: 'долгий ужин на Покровке',
  place: 'кафе Bottega',
  seats: 6,
  taken: 4,
  mood: 'оживлённо',
  status: 'upcoming',
}

export const MOCK_PAST: Meetup[] = [
  {
    id: 'p1',
    date: '21 окт',
    title: 'кофе и медленные разговоры',
    place: '«Кооператив Чёрный»',
    seats: 5,
    taken: 5,
    mood: 'спокойно',
    status: 'past',
  },
  {
    id: 'p2',
    date: '07 окт',
    title: 'вечер у огня',
    place: 'квартира на Маросейке',
    seats: 6,
    taken: 6,
    mood: 'оживлённо',
    status: 'past',
  },
  {
    id: 'p3',
    date: '24 сен',
    title: 'прогулка по Парку Горького',
    place: 'Парк Горького',
    seats: 5,
    taken: 4,
    mood: 'с темой',
    status: 'past',
  },
]

export const MOCK_USER = {
  id: 'u1',
  name: 'Артём',
  age: 29,
  city: 'Москва',
  vibes: ['оживлённо', 'долгие ужины', 'без подтекста', 'дружба', 'разговоры'],
  stats: {
    evenings: 7,
    people: 23,
    spots: 41,
  },
}
