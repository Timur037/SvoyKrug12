import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import { fetchUserProfile, type UserProfile } from '../lib/db'

function useCountUp(target: number, duration = 900, delay = 0): number {
  const [val, setVal] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    const timeout = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const t = Math.min((Date.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setVal(Math.round(eased * target))
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, delay)
    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])
  return val
}

type StickerKind = 'tomato' | 'ink' | 'cream' | 'forest' | 'honey'

const KINDS: StickerKind[] = ['tomato', 'ink', 'forest', 'honey', 'cream']

function cycleKind(current: StickerKind): StickerKind {
  const idx = KINDS.indexOf(current)
  return KINDS[(idx + 1) % KINDS.length]
}

interface VibeTag {
  t: string
  size: number
  rot: number
  kind: StickerKind
}

const VIBE_TAGS: VibeTag[] = [
  { t: 'разговоры о работе — нет',   size: 22, rot: -3, kind: 'tomato' },
  { t: 'вино, не виски',             size: 18, rot:  2, kind: 'ink'    },
  { t: 'утро > ночь',                size: 17, rot: -1, kind: 'cream'  },
  { t: 'десерт — да',                size: 14, rot:  4, kind: 'honey'  },
  { t: 'тёплые улицы, не клубы',     size: 20, rot:  1, kind: 'forest' },
  { t: 'смешно > глубоко',           size: 15, rot: -3, kind: 'cream'  },
  { t: 'один раз в неделю — хватит', size: 16, rot:  2, kind: 'tomato' },
]

const AVAILABLE_DISTRICTS = ['центр', 'замоскворечье', 'арбат', 'хамовники', 'пресня', 'таганка', 'басманный', 'сокольники', 'дорогомилово', 'митино']
const AVAILABLE_WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

interface SettingsState {
  onlyFriendship: boolean
  districts: string[]
  weekdays: string[]
  paused: boolean
}

const DEFAULT_SETTINGS: SettingsState = {
  onlyFriendship: true,
  districts: ['центр', 'замоскворечье'],
  weekdays: ['чт', 'пт', 'сб'],
  paused: false,
}

function palette(k: StickerKind): { bg: string; c: string; br: string; shadow: string } {
  switch (k) {
    case 'tomato':
      return { bg: COLORS.tomato, c: COLORS.cream, br: 'none', shadow: '0 8px 18px rgba(232,71,44,0.32), 0 1px 0 rgba(26,22,18,0.08)' }
    case 'ink':
      return { bg: COLORS.ink, c: COLORS.cream, br: 'none', shadow: '0 8px 18px rgba(26,22,18,0.30), 0 1px 0 rgba(26,22,18,0.08)' }
    case 'forest':
      return { bg: COLORS.forest, c: COLORS.cream, br: 'none', shadow: '0 8px 18px rgba(45,74,62,0.32), 0 1px 0 rgba(26,22,18,0.08)' }
    case 'honey':
      return { bg: COLORS.honey, c: COLORS.ink, br: 'none', shadow: '0 8px 18px rgba(244,201,93,0.45), 0 1px 0 rgba(26,22,18,0.06)' }
    case 'cream':
    default:
      return { bg: '#fff', c: COLORS.ink, br: '1px solid rgba(26,22,18,0.10)', shadow: '0 4px 12px rgba(26,22,18,0.10), 0 1px 0 rgba(26,22,18,0.04)' }
  }
}

function padFor(size: number): string {
  if (size >= 20) return '12px 18px'
  if (size >= 16) return '10px 14px'
  return '7px 11px'
}

function formatNextEvent(booking: { meetup: { date_label: string; place: string; seats: number } } | null): { label: string; place: string; seats: number } | null {
  if (!booking) return null
  return {
    label: booking.meetup.date_label,
    place: booking.meetup.place,
    seats: booking.meetup.seats,
  }
}

interface VibeGroup {
  label: string
  items: Array<Pick<VibeTag, 't' | 'kind'>>
}

const VIBE_GROUPS: VibeGroup[] = [
  {
    label: 'время и ритм',
    items: [
      { t: 'кофе с молоком',            kind: 'cream'  },
      { t: 'чай, не кофе',              kind: 'honey'  },
      { t: 'утро — лучшее время',       kind: 'honey'  },
      { t: 'сова, не жаворонок',        kind: 'ink'    },
      { t: 'суббота, не воскресенье',   kind: 'cream'  },
      { t: 'ранний ужин',               kind: 'forest' },
      { t: 'разговоры за полночь',      kind: 'ink'    },
      { t: 'никуда не торопиться',      kind: 'cream'  },
      { t: 'один раз — но хорошо',      kind: 'forest' },
    ],
  },
  {
    label: 'общение',
    items: [
      { t: 'тихие разговоры',           kind: 'ink'    },
      { t: 'смеяться до слёз',          kind: 'tomato' },
      { t: 'честность > вежливость',    kind: 'tomato' },
      { t: 'без светских разговоров',   kind: 'ink'    },
      { t: 'слушаю больше, чем говорю', kind: 'forest' },
      { t: 'без телефона за столом',    kind: 'ink'    },
      { t: 'говорю прямо',              kind: 'tomato' },
      { t: 'умею молчать',              kind: 'cream'  },
      { t: 'глубина > светскость',      kind: 'forest' },
    ],
  },
  {
    label: 'еда и напитки',
    items: [
      { t: 'хорошее вино',              kind: 'tomato' },
      { t: 'десерт обязателен',         kind: 'honey'  },
      { t: 'острое — да',               kind: 'tomato' },
      { t: 'разделяю счёт',             kind: 'cream'  },
      { t: 'завтрак — святое',          kind: 'honey'  },
      { t: 'без фастфуда',              kind: 'forest' },
    ],
  },
  {
    label: 'места',
    items: [
      { t: 'пешком по городу',          kind: 'forest' },
      { t: 'уютные места',              kind: 'honey'  },
      { t: 'природа > город',           kind: 'forest' },
      { t: 'свет > тёмные комнаты',     kind: 'honey'  },
      { t: 'маленькие компании',        kind: 'cream'  },
      { t: 'не клубы',                  kind: 'ink'    },
      { t: 'долгие прогулки',           kind: 'forest' },
      { t: 'дома лучше',                kind: 'cream'  },
    ],
  },
  {
    label: 'интересы',
    items: [
      { t: 'книги > сериалы',           kind: 'tomato' },
      { t: 'кино на большом экране',    kind: 'ink'    },
      { t: 'без громкой музыки',        kind: 'ink'    },
      { t: 'искусство в быту',          kind: 'honey'  },
      { t: 'музыка всегда',             kind: 'tomato' },
      { t: 'читаю перед сном',          kind: 'cream'  },
    ],
  },
  {
    label: 'работа и деньги',
    items: [
      { t: 'работа — не главное',       kind: 'forest' },
      { t: 'делаю, что люблю',          kind: 'tomato' },
      { t: 'деньги — инструмент',       kind: 'ink'    },
      { t: 'в отпуск без ноутбука',     kind: 'honey'  },
    ],
  },
  {
    label: 'ценности',
    items: [
      { t: 'дружба навсегда',           kind: 'tomato' },
      { t: 'помогаю — значит живу',     kind: 'forest' },
      { t: 'семья важнее всего',        kind: 'honey'  },
      { t: 'свобода > стабильность',    kind: 'tomato' },
      { t: 'развиваюсь каждый день',    kind: 'ink'    },
      { t: 'верю в случайности',        kind: 'cream'  },
      { t: 'люди важнее идей',          kind: 'forest' },
    ],
  },
]


export function ProfileScreen() {
  const { user } = useUser()
  const [tags, setTags] = useState<VibeTag[]>(VIBE_TAGS)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('svoy_krug_settings')
      if (saved) return JSON.parse(saved) as SettingsState
    } catch {
      // ignore parse/storage errors and fall back to defaults
    }
    return DEFAULT_SETTINGS
  })

  const [activeSheet, setActiveSheet] = useState<'districts' | 'weekdays' | null>(null)

  function updateSettings(patch: Partial<SettingsState>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem('svoy_krug_settings', JSON.stringify(next))
    } catch {
      // ignore storage write errors (private mode, quota, etc.)
    }
  }

  function toggleDistrict(d: string) {
    haptic('light')
    const has = settings.districts.includes(d)
    updateSettings({
      districts: has ? settings.districts.filter((x) => x !== d) : [...settings.districts, d],
    })
  }

  function toggleWeekday(d: string) {
    haptic('light')
    const has = settings.weekdays.includes(d)
    updateSettings({
      weekdays: has ? settings.weekdays.filter((x) => x !== d) : [...settings.weekdays, d],
    })
  }

  useEffect(() => {
    if (!user) return
    fetchUserProfile(user.id)
      .then(setProfile)
      .catch(console.error)
  }, [user])

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
    overflowY: 'auto',
  }

  function removeVibe(i: number) {
    haptic('light')
    setTags((prev) => prev.filter((_, idx) => idx !== i))
  }

  function changeVibe(i: number) {
    haptic('light')
    setTags((prev) => prev.map((tag, idx) =>
      idx === i ? { ...tag, kind: cycleKind(tag.kind) } : tag
    ))
  }

  function openPicker() {
    haptic('light')
    setShowPicker(true)
  }

  function pickVibe(candidate: Pick<VibeTag, 't' | 'kind'>) {
    haptic('light')
    const sizes = [14, 17, 20, 22]
    const rotations = [-4, -2, 1, 3, -1]
    setTags((prev) => [
      ...prev,
      {
        t: candidate.t,
        kind: candidate.kind,
        size: sizes[prev.length % sizes.length] ?? 17,
        rot: rotations[prev.length % rotations.length] ?? 0,
      },
    ])
    setShowPicker(false)
  }

  const displayName = user?.name ?? 'гость'
  const initial = displayName.charAt(0).toUpperCase()
  const nextEvent = profile ? formatNextEvent(profile.upcomingBooking) : null
  const totalEvents = profile?.totalBookings ?? 0
  const peopleMet = totalEvents * 5
  const places = profile?.uniquePlaces ?? 0

  const animatedEvents  = useCountUp(totalEvents, 800, 200)
  const animatedPeople  = useCountUp(peopleMet,   800, 350)
  const animatedPlaces  = useCountUp(places,       800, 500)

  return (
    <PageTransition>
    <div style={root}>
      <Grain opacity={0.3} />
      <div style={{ paddingTop: 64, paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ padding: '0 22px 14px' }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.inkSoft, textTransform: 'uppercase' }}>
            вы
          </div>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 16, marginBottom: 16 }}>
            {nextEvent && (
              <div style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: `2px solid ${COLORS.tomato}`,
                opacity: 0.45,
                animation: 'pulse-dot 2.4s ease-out infinite',
              }} />
            )}
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: `linear-gradient(145deg, ${COLORS.tomato} 0%, ${COLORS.forest} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...serifStyle,
              fontSize: 30,
              color: COLORS.cream,
              boxShadow: '0 10px 28px rgba(232,71,44,0.32)',
              position: 'relative',
              zIndex: 1,
            }}>{initial}</div>
          </div>
          <h1 style={{ margin: '10px 0 0', fontSize: 46, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
            <span style={serifStyle}>{displayName},</span>
          </h1>
          <div style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 6 }}>
            {totalEvents > 0
              ? <>в Свой Круг уже{' '}<span style={{ color: COLORS.ink, fontWeight: 700 }}>{totalEvents} {totalEvents === 1 ? 'вечер' : totalEvents < 5 ? 'вечера' : 'вечеров'}</span></>
              : 'добро пожаловать в Свой Круг'
            }
          </div>
        </div>

        {/* Stats ink block */}
        <div style={{
          margin: '0 22px 22px',
          borderRadius: 28,
          padding: '24px 22px',
          background: COLORS.ink,
          color: COLORS.cream,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(26,22,18,0.18)',
        }}>
          <Grain opacity={0.3} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {[
              { n: animatedEvents,  label: 'вечеров',        accent: true  },
              { n: animatedPeople,  label: 'людей встречено', accent: false },
              { n: animatedPlaces,  label: 'мест в Москве',   accent: false },
            ].map((s) => (
              <div key={s.label} style={{ animation: 'countUp 500ms cubic-bezier(0.22,1,0.36,1) both' }}>
                <div style={{
                  ...serifStyle,
                  fontSize: 48,
                  lineHeight: 1,
                  color: s.accent ? COLORS.tomato : COLORS.cream,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}>
                  {s.n}
                </div>
                <div style={{
                  ...sansStyle,
                  fontSize: 10,
                  color: 'rgba(245,239,230,0.60)',
                  marginTop: 7,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next evening mini card */}
        {nextEvent ? (
          <div style={{
            margin: '0 22px 22px',
            padding: '16px 18px',
            borderRadius: 20,
            background: '#fff',
            border: '1px solid rgba(26,22,18,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: COLORS.inkSoft, textTransform: 'uppercase' }}>следующий вечер</div>
              <div style={{ ...serifStyle, fontSize: 20, color: COLORS.ink, marginTop: 4 }}>{nextEvent.label}</div>
              <div style={{ ...sansStyle, fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{nextEvent.place} — {nextEvent.seats} человек</div>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: COLORS.tomato,
              color: COLORS.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...sansStyle,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 4px 12px rgba(232,71,44,0.35)',
              flexShrink: 0,
            }}>{nextEvent.seats}</div>
          </div>
        ) : totalEvents === 0 ? (
          <div style={{
            margin: '0 22px 22px',
            padding: '16px 18px',
            borderRadius: 20,
            background: COLORS.cream2,
            border: '1px solid rgba(26,22,18,0.06)',
          }}>
            <div style={{ ...serifStyle, fontSize: 20, color: COLORS.ink, marginBottom: 4 }}>найти первый вечер</div>
            <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft }}>загляните на главную и запишитесь в ближайший круг.</div>
          </div>
        ) : null}

        {/* Sticker vibes */}
        <div style={{ padding: '0 22px 22px' }}>
          <div style={{ ...serifStyle, fontSize: 32, color: COLORS.ink, lineHeight: 1, marginBottom: 18 }}>
            вы — это
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 10px', alignItems: 'center', paddingBottom: 6 }}>
            {tags.map((tag, i) => {
              const p = palette(tag.kind)
              return (
                <div
                  key={`${tag.t}-${i}`}
                  style={{ position: 'relative', display: 'inline-block' }}
                >
                  <button
                    style={{
                      background: p.bg,
                      color: p.c,
                      border: p.br,
                      padding: padFor(tag.size),
                      borderRadius: 14,
                      ...sansStyle,
                      fontStyle: 'italic',
                      fontWeight: 600,
                      fontSize: tag.size,
                      letterSpacing: '-0.01em',
                      transform: `rotate(${tag.rot}deg)`,
                      boxShadow: p.shadow,
                      cursor: 'pointer',
                      transition: 'transform .25s ease',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => changeVibe(i)}
                    title="нажмите чтобы сменить цвет"
                    onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(${tag.rot * 0.4}deg) scale(1.04)` }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${tag.rot}deg) scale(1)` }}
                  >
                    {tag.t}
                  </button>
                  <button
                    onClick={() => removeVibe(i)}
                    aria-label="удалить вайб"
                    style={{
                      position: 'absolute',
                      top: -7,
                      right: -7,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: COLORS.ink,
                      color: COLORS.cream,
                      border: `2px solid ${COLORS.cream}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: 1,
                      cursor: 'pointer',
                      zIndex: 2,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
            <button
              onClick={openPicker}
              style={{
                padding: '9px 14px',
                borderRadius: 14,
                background: 'transparent',
                color: COLORS.inkSoft,
                border: '1.5px dashed rgba(26,22,18,0.22)',
                ...sansStyle,
                fontSize: 14,
                fontWeight: 500,
                transform: 'rotate(-1deg)',
                cursor: 'pointer',
              }}
            >
              + добавить вайб
            </button>
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '0 22px' }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 12 }}>
            настройки
          </div>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(26,22,18,0.06)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,22,18,0.05)' }}>
            {(() => {
              const rows: Array<{
                key: string
                label: string
                value: string
                tomato: boolean
                hint?: string
                onTap: () => void
              }> = [
                {
                  key: 'onlyFriendship',
                  label: 'только дружба',
                  value: settings.onlyFriendship ? 'включено' : 'выключено',
                  tomato: settings.onlyFriendship,
                  onTap: () => {
                    haptic('light')
                    updateSettings({ onlyFriendship: !settings.onlyFriendship })
                  },
                },
                {
                  key: 'districts',
                  label: 'районы города',
                  value: settings.districts.length > 0 ? settings.districts.join(', ') : 'не выбраны',
                  tomato: false,
                  onTap: () => {
                    haptic('light')
                    setActiveSheet('districts')
                  },
                },
                {
                  key: 'weekdays',
                  label: 'дни недели',
                  value: settings.weekdays.length > 0 ? settings.weekdays.join(' · ') : 'не выбраны',
                  tomato: false,
                  onTap: () => {
                    haptic('light')
                    setActiveSheet('weekdays')
                  },
                },
                {
                  key: 'paused',
                  label: 'пауза',
                  value: settings.paused ? 'включена' : 'выключена',
                  tomato: settings.paused,
                  hint: settings.paused ? 'пауза останавливает подбор новых кругов' : undefined,
                  onTap: () => {
                    haptic('light')
                    updateSettings({ paused: !settings.paused })
                  },
                },
              ]
              return rows.map((row, i) => (
                <button
                  key={row.key}
                  style={{
                    padding: '15px 18px',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(26,22,18,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                    gap: 12,
                  }}
                  onClick={row.onTap}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ ...sansStyle, fontSize: 14, fontWeight: 500, color: COLORS.ink }}>{row.label}</span>
                    {row.hint && (
                      <span style={{ ...sansStyle, fontSize: 11, color: COLORS.inkSoft, lineHeight: 1.3 }}>
                        {row.hint}
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, maxWidth: '60%' }}>
                    <span style={{
                      ...sansStyle,
                      fontSize: 13,
                      fontWeight: 600,
                      color: row.tomato ? COLORS.tomato : COLORS.inkSoft,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {row.value}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6l6 6-6 6" stroke={row.tomato ? COLORS.tomato : 'rgba(26,22,18,0.3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))
            })()}
          </div>
        </div>
      </div>

      <TabBar active="me" />

      {/* Vibe picker bottom sheet */}
      {showPicker && (
        <>
          <div
            onClick={() => setShowPicker(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(26,22,18,0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: COLORS.cream,
            borderRadius: '24px 24px 0 0',
            padding: '20px 22px calc(env(safe-area-inset-bottom,0px) + 24px)',
            boxShadow: '0 -8px 40px rgba(26,22,18,0.18)',
            maxHeight: '72dvh',
            overflowY: 'auto',
            animation: 'sheetUp 280ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <style>{`@keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,22,18,0.15)', margin: '0 auto 20px' }} />
            <div style={{ ...serifStyle, fontSize: 24, color: COLORS.ink, marginBottom: 16 }}>
              выберите вайб
            </div>
            {VIBE_GROUPS.map((group) => {
              const available = group.items.filter(c => !tags.some(t => t.t === c.t))
              if (available.length === 0) return null
              return (
                <div key={group.label} style={{ marginBottom: 20 }}>
                  <div style={{
                    ...sansStyle,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: COLORS.inkSoft,
                    marginBottom: 10,
                  }}>
                    {group.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 8px' }}>
                    {available.map((c) => {
                      const p = palette(c.kind)
                      return (
                        <button
                          key={c.t}
                          onClick={() => pickVibe(c)}
                          style={{
                            background: p.bg,
                            color: p.c,
                            border: p.br || '1.5px solid transparent',
                            padding: '9px 14px',
                            borderRadius: 14,
                            ...sansStyle,
                            fontStyle: 'italic',
                            fontWeight: 600,
                            fontSize: 15,
                            letterSpacing: '-0.01em',
                            boxShadow: p.shadow,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'transform 180ms ease',
                          }}
                        >
                          {c.t}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Bottom sheet overlay */}
      {activeSheet && (
        <div
          onClick={() => setActiveSheet(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(26,22,18,0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Districts bottom sheet */}
      {activeSheet === 'districts' && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 24px calc(env(safe-area-inset-bottom,0px) + 24px)',
          boxShadow: '0 -8px 40px rgba(26,22,18,0.18)',
          maxHeight: '78dvh',
          overflowY: 'auto',
          transform: 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
          animation: 'sheetUp 300ms cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <style>{`@keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,22,18,0.15)', margin: '0 auto 18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ ...sansStyle, fontSize: 20, fontWeight: 700, color: COLORS.ink }}>районы города</div>
            <button
              onClick={() => { haptic('light'); setActiveSheet(null) }}
              aria-label="закрыть"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(26,22,18,0.06)',
                border: 'none',
                ...sansStyle,
                fontSize: 18,
                color: COLORS.ink,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >×</button>
          </div>
          <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.4 }}>
            выберите районы, где вам удобно встречаться
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
            {AVAILABLE_DISTRICTS.map((d) => {
              const selected = settings.districts.includes(d)
              return (
                <button
                  key={d}
                  onClick={() => toggleDistrict(d)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 4px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: selected ? COLORS.tomato : 'transparent',
                    border: selected ? `2px solid ${COLORS.tomato}` : '2px solid rgba(26,22,18,0.20)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 180ms ease',
                  }}>
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5 9-11" stroke={COLORS.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ ...sansStyle, fontSize: 15, fontWeight: 500, color: COLORS.ink }}>{d}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => { haptic('light'); setActiveSheet(null) }}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 999,
              background: COLORS.tomato,
              color: COLORS.cream,
              border: 'none',
              ...sansStyle,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(232,71,44,0.32)',
            }}
          >готово</button>
        </div>
      )}

      {/* Weekdays bottom sheet */}
      {activeSheet === 'weekdays' && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '20px 24px calc(env(safe-area-inset-bottom,0px) + 24px)',
          boxShadow: '0 -8px 40px rgba(26,22,18,0.18)',
          maxHeight: '78dvh',
          overflowY: 'auto',
          transform: 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
          animation: 'sheetUp 300ms cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,22,18,0.15)', margin: '0 auto 18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ ...sansStyle, fontSize: 20, fontWeight: 700, color: COLORS.ink }}>дни недели</div>
            <button
              onClick={() => { haptic('light'); setActiveSheet(null) }}
              aria-label="закрыть"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(26,22,18,0.06)',
                border: 'none',
                ...sansStyle,
                fontSize: 18,
                color: COLORS.ink,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >×</button>
          </div>
          <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginBottom: 18, lineHeight: 1.4 }}>
            в какие дни вам удобно встречаться
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {AVAILABLE_WEEKDAYS.map((d) => {
              const selected = settings.weekdays.includes(d)
              return (
                <button
                  key={d}
                  onClick={() => toggleWeekday(d)}
                  style={{
                    flex: '1 0 auto',
                    minWidth: 60,
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: selected ? COLORS.tomato : 'rgba(26,22,18,0.06)',
                    color: selected ? COLORS.cream : COLORS.ink,
                    border: 'none',
                    ...sansStyle,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    boxShadow: selected ? '0 6px 16px rgba(232,71,44,0.28)' : 'none',
                  }}
                >{d}</button>
              )
            })}
          </div>
          <button
            onClick={() => { haptic('light'); setActiveSheet(null) }}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 999,
              background: COLORS.tomato,
              color: COLORS.cream,
              border: 'none',
              ...sansStyle,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(232,71,44,0.32)',
            }}
          >готово</button>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
