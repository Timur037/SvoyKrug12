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

const SETTINGS = [
  { l: 'только дружба', v: 'включено', tomato: true },
  { l: 'районы города', v: 'центр, замоскворечье' },
  { l: 'дни недели', v: 'чт · пт · сб' },
  { l: 'пауза', v: 'выключена' },
] as const

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

export function ProfileScreen() {
  const { user } = useUser()
  const [tags, setTags] = useState<VibeTag[]>(VIBE_TAGS)
  const [profile, setProfile] = useState<UserProfile | null>(null)

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

  function addVibe() {
    haptic('light')
    const candidates: Array<Pick<VibeTag, 't' | 'kind'>> = [
      { t: 'кофе с молоком', kind: 'cream' },
      { t: 'пешком по городу', kind: 'forest' },
      { t: 'без громкой музыки', kind: 'ink' },
      { t: 'книги > сериалы', kind: 'tomato' },
      { t: 'свет > тёмные комнаты', kind: 'honey' },
    ]
    const used = new Set(tags.map((t) => t.t))
    const next = candidates.find((c) => !used.has(c.t))
    if (!next) return
    const sizes = [14, 17, 20, 22]
    const rotations = [-4, -2, 1, 3, -1]
    setTags((prev) => [
      ...prev,
      {
        t: next.t,
        kind: next.kind,
        size: sizes[tags.length % sizes.length] ?? 17,
        rot: rotations[tags.length % rotations.length] ?? 0,
      },
    ])
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
              onClick={addVibe}
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
            {SETTINGS.map((row, i) => {
              const isTomato = 'tomato' in row && row.tomato
              return (
                <button
                  key={row.l}
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
                  onClick={() => haptic('light')}
                >
                  <span style={{ ...sansStyle, fontSize: 14, fontWeight: 500, color: COLORS.ink }}>{row.l}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ ...sansStyle, fontSize: 13, fontWeight: 600, color: isTomato ? COLORS.tomato : COLORS.inkSoft }}>
                      {row.v}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6l6 6-6 6" stroke={isTomato ? COLORS.tomato : 'rgba(26,22,18,0.3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <TabBar active="me" />
    </div>
    </PageTransition>
  )
}
