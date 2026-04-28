# Свой Круг — Telegram Mini App

Сервис маленьких офлайн-встреч на 5–6 человек. Telegram Mini App на React + Vite + TypeScript.

## Стек

- Vite + React 18 + TypeScript (strict)
- react-router-dom v6
- @supabase/supabase-js
- posthog-js
- Google Fonts: Instrument Serif, Inter Tight, Caveat
- Inline styles, без Tailwind/CSS-фреймворков

## Быстрый старт

```bash
npm install
cp .env.example .env   # заполните ключи
npm run dev            # http://localhost:5173
npm run build          # production-сборка в /dist
```

## Структура

```
src/
├── theme.ts                 — палитра и текстовые стили
├── types.ts                 — Circle, Meetup, TelegramUser, AppUser
├── lib/
│   ├── supabase.ts          — Supabase client
│   ├── telegram.ts          — window.Telegram.WebApp helpers
│   ├── posthog.ts           — PostHog init
│   └── mockData.ts          — статические данные для экранов
├── components/
│   ├── Grain.tsx            — зернистый оверлей
│   ├── StatusBar.tsx        — иконки статус-бара (только в онбординге)
│   ├── Seats.tsx            — точки занятых/свободных мест
│   ├── PriceChip.tsx        — pill-чип цены
│   └── TabBar.tsx           — нижний таббар на 3 вкладки
├── screens/
│   ├── onboarding/
│   │   ├── Onb1.tsx         — «знакомиться заново — нормально»
│   │   ├── Onb2.tsx         — «5 или 6 человек»
│   │   ├── Onb3.tsx         — гигантская «6» с дыхательной анимацией
│   │   ├── Quiz1.tsx        — выбор идеального вечера
│   │   └── Quiz2.tsx        — переключатель «только дружба»
│   ├── HomeScreen.tsx       — лента кругов
│   ├── CalendarScreen.tsx   — мой вечер (неделя + история)
│   └── ProfileScreen.tsx    — профиль и настройки
├── App.tsx                  — роутер + редирект по флагу онбординга
└── main.tsx                 — Telegram WebApp init, PostHog init
```

## Маршруты

- `/onboarding/1..3` — три приветственных экрана
- `/onboarding/quiz1..2` — мини-квиз
- `/home` — лента кругов
- `/calendar` — «мой вечер»
- `/profile` — профиль

`/` редиректит на `/home`, если `localStorage.svoy_krug_onboarded === '1'`, иначе — на `/onboarding/1`.

## Переменные окружения

`.env` (см. `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_POSTHOG_KEY`

Без них приложение всё равно стартует — Supabase инициализируется с placeholder-значениями, PostHog не инициализируется.

## Деплой на Vercel

1. Подключите репозиторий в Vercel.
2. Project Settings → Environment Variables → добавьте `VITE_*` ключи.
3. Build command: `npm run build`. Output directory: `dist`.
