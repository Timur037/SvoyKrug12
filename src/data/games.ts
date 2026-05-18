export interface Game {
  id: string
  title: string
  emoji: string
  tagline: string
  duration: string
  players: string
  description: string
  color: string // rgb like '232,71,44'
}

export const GAMES: Game[] = [
  {
    id: 'believe-it',
    title: 'Верю / Не верю',
    emoji: '🎲',
    color: '232,71,44',
    tagline: 'Правда о себе — или нет?',
    duration: '10–15 мин',
    players: '4–6 человек',
    description:
      'Каждый по очереди называет факт о себе. Остальные решают — верить или нет. Потом — правда.',
  },
  {
    id: 'guess-who',
    title: 'Угадай персонажа',
    emoji: '🎭',
    color: '118,82,152',
    tagline: 'Кто ты? Угадай вопросами',
    duration: '10–20 мин',
    players: '4–6 человек',
    description:
      'Каждый загадывает знаменитость. Приложение распределяет случайно — ты не знаешь своего персонажа. Держи телефон ко лбу, угадывай вопросами да/нет.',
  },
  {
    id: 'most-likely',
    title: 'Кто скорее всего?',
    emoji: '👆',
    color: '45,102,71',
    tagline: 'Все одновременно указывают',
    duration: '5–10 мин',
    players: '4–6 человек',
    description:
      'Приложение показывает фразу «Кто за этим столом скорее всего...» — все одновременно указывают пальцем. Без подготовки, только смех.',
  },
  {
    id: 'hot-seat',
    title: 'Горячий стул',
    emoji: '🔥',
    color: '196,152,32',
    tagline: '2 минуты честных ответов',
    duration: '10–15 мин',
    players: '4–6 человек',
    description:
      'Один человек на горячем стуле 2 минуты. Остальные задают любые вопросы — он отвечает честно. Потом следующий.',
  },
  {
    id: 'story',
    title: 'Общая история',
    emoji: '📖',
    color: '178,112,44',
    tagline: 'Одна история — несколько авторов',
    duration: '5–10 мин',
    players: '4–6 человек',
    description:
      'Приложение даёт начало. Каждый добавляет одно предложение по кругу. Получается что-то неожиданное.',
  },
]

export const GAME_BY_ID: Record<string, Game> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
)
