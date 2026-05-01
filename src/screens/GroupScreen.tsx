import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import { fetchUserBookings, fetchMeetupParticipants, type DbMeetup, type DbParticipant } from '../lib/db'

const TABLE_CONTAINER = 350
const TABLE_CENTER = TABLE_CONTAINER / 2
const SEAT_RADIUS = 148
const TABLE_RADIUS = 88

const DOT_COLORS: Array<{ bg: string; fg: string; border: boolean }> = [
  { bg: COLORS.cream2,  fg: COLORS.ink,   border: false },
  { bg: COLORS.tomato,  fg: COLORS.cream, border: false },
  { bg: '#fff',         fg: COLORS.ink,   border: true  },
  { bg: COLORS.cream2,  fg: COLORS.ink,   border: false },
  { bg: COLORS.forest,  fg: COLORS.cream, border: false },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getWeekdayRu(scheduled_at: string | null): string {
  if (!scheduled_at) return 'пятница'
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  return days[new Date(scheduled_at).getDay()] ?? 'пятница'
}

function getMeetupTime(scheduled_at: string | null): string {
  if (!scheduled_at) return '19:30'
  const d = new Date(scheduled_at)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getRevealTime(scheduled_at: string | null): string {
  if (!scheduled_at) return '16:30'
  const d = new Date(scheduled_at)
  d.setHours(d.getHours() - 6)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getCountdown(scheduled_at: string | null): string {
  if (!scheduled_at) return '—'
  const ms = Math.max(0, new Date(scheduled_at).getTime() - Date.now())
  if (ms === 0) return 'сейчас'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `−${days}д ${String(hours).padStart(2, '0')}ч`
  return `−${String(hours).padStart(2, '0')}ч`
}

export function GroupScreen() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [meetup, setMeetup] = useState<DbMeetup | null>(null)
  const [participants, setParticipants] = useState<DbParticipant[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchUserBookings(user.id)
      .then((bookings) => {
        const upcomingBooking = bookings.find((b) => b.meetup.status === 'upcoming')
        if (!upcomingBooking) {
          setLoaded(true)
          return
        }
        const m = upcomingBooking.meetup
        setMeetup(m)
        return fetchMeetupParticipants(m.id)
      })
      .then((parts) => {
        if (parts) setParticipants(parts)
        setLoaded(true)
      })
      .catch((err) => {
        console.error(err)
        setLoaded(true)
      })
  }, [user])

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.ink,
    color: COLORS.cream,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 60,
    left: 22,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(245,239,230,0.10)',
    border: '1px solid rgba(245,239,230,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.cream,
    zIndex: 30,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }

  // No booking — empty state
  if (loaded && !meetup) {
    return (
      <div style={root}>
        <Grain opacity={0.35} />
        <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', gap: 20 }}>
          <div style={{ ...serifStyle, fontSize: 32, lineHeight: 1.1, textAlign: 'center', color: COLORS.cream }}>
            вы ещё не<br/>в круге.
          </div>
          <div style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.65)', textAlign: 'center', lineHeight: 1.5 }}>
            запишитесь на ближайший вечер<br/>на главной странице.
          </div>
          <button
            style={{
              background: COLORS.tomato,
              color: COLORS.cream,
              border: 'none',
              padding: '14px 24px',
              borderRadius: 99,
              ...sansStyle,
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(232,71,44,0.35)',
            }}
            onClick={() => { haptic('medium'); navigate('/home') }}
          >
            найти вечер →
          </button>
        </div>
      </div>
    )
  }

  // Build surrounding dots: other participants + ghost slots
  const others = participants.filter((p) => p.id !== user?.id)
  const totalSeats = meetup?.seats ?? 6
  const emptySlots = Math.max(0, totalSeats - participants.length)

  type SurroundingDot = {
    id: string
    initials: string
    label: string
    color: string
    textColor: string
    border: boolean
    ghost: boolean
  }

  const surroundingDots: SurroundingDot[] = [
    ...others.map((p, i) => {
      const palette = DOT_COLORS[i % DOT_COLORS.length] ?? DOT_COLORS[0]!
      const firstName = p.name.split(' ')[0] ?? p.name
      const label = p.age ? `${firstName}, ${p.age}` : firstName
      return {
        id: p.id,
        initials: getInitials(p.name),
        label,
        color: palette.bg,
        textColor: palette.fg,
        border: palette.border,
        ghost: false,
      }
    }),
    ...Array.from({ length: emptySlots }, (_, i) => ({
      id: `ghost-${i}`,
      initials: '?',
      label: 'ждём',
      color: 'rgba(245,239,230,0.05)',
      textColor: 'rgba(245,239,230,0.30)',
      border: true,
      ghost: true,
    })),
  ]

  type Seat = {
    id: string
    initials: string
    label: string
    bg: string
    fg: string
    border: boolean
    ghost: boolean
  }

  const youSeat: Seat = {
    id: 'you',
    initials: 'ВЫ',
    label: user?.name ?? 'Вы',
    bg: COLORS.tomato,
    fg: COLORS.cream,
    border: false,
    ghost: false,
  }

  const allSeats: Seat[] = [
    youSeat,
    ...surroundingDots.map((p) => ({
      id: p.id,
      initials: p.initials,
      label: p.label,
      bg: p.color,
      fg: p.textColor,
      border: p.border,
      ghost: p.ghost,
    })),
  ].slice(0, 6)

  // Pad to exactly 6 if needed
  while (allSeats.length < 6) {
    allSeats.push({
      id: `ghost-pad-${allSeats.length}`,
      initials: '?',
      label: 'ждём',
      bg: 'rgba(245,239,230,0.06)',
      fg: 'rgba(245,239,230,0.25)',
      border: true,
      ghost: true,
    })
  }

  const dayLabel = getWeekdayRu(meetup?.scheduled_at ?? null)
  const timeLabel = getMeetupTime(meetup?.scheduled_at ?? null)
  const revealTime = getRevealTime(meetup?.scheduled_at ?? null)
  const countdown = getCountdown(meetup?.scheduled_at ?? null)

  return (
    <div style={root}>
      <Grain opacity={0.35} />

      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Top label */}
      <div style={{ padding: '70px 28px 0', position: 'relative', zIndex: 5 }}>
        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: COLORS.tomato,
          textTransform: 'uppercase',
          marginLeft: 52,
        }}>
          {dayLabel} · {timeLabel}
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 36, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
          <span style={serifStyle}>ваш круг</span>
          <br />
          <span style={serifStyle}>{loaded ? 'собирается.' : '...'}</span>
        </h1>
      </div>

      {/* Table stage */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Warm radial glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(50,35,18,0.8) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Table container — exact center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: TABLE_CONTAINER,
          height: TABLE_CONTAINER,
        }}>
          {/* SVG connection lines */}
          <svg
            style={{ position: 'absolute', inset: 0, width: TABLE_CONTAINER, height: TABLE_CONTAINER }}
            viewBox={`0 0 ${TABLE_CONTAINER} ${TABLE_CONTAINER}`}
          >
            {allSeats.map((_, i) => {
              const angle = ((i * 60 - 90) * Math.PI) / 180
              const x1 = TABLE_CENTER + TABLE_RADIUS * Math.cos(angle)
              const y1 = TABLE_CENTER + TABLE_RADIUS * Math.sin(angle)
              const x2 = TABLE_CENTER + SEAT_RADIUS * Math.cos(angle)
              const y2 = TABLE_CENTER + SEAT_RADIUS * Math.sin(angle)
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(245,239,230,0.07)" strokeWidth="1" strokeDasharray="3 4" />
              )
            })}
          </svg>

          {/* Center table circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: TABLE_RADIUS * 2,
            height: TABLE_RADIUS * 2,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #2A1E12 0%, #1A1208 100%)',
            border: '1.5px solid rgba(244,201,93,0.30)',
            boxShadow: '0 0 50px rgba(244,201,93,0.18), 0 0 100px rgba(244,201,93,0.07), inset 0 1px 0 rgba(244,201,93,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              ...serifStyle,
              fontSize: 64,
              lineHeight: 1,
              color: 'rgba(244,201,93,0.85)',
              textShadow: '0 0 30px rgba(244,201,93,0.40)',
            }}>
              {totalSeats}
            </span>
          </div>

          {/* 6 seat avatars */}
          {allSeats.map((seat, i) => {
            const angle = ((i * 60 - 90) * Math.PI) / 180
            const cx = TABLE_CENTER + SEAT_RADIUS * Math.cos(angle)
            const cy = TABLE_CENTER + SEAT_RADIUS * Math.sin(angle)
            const SEAT_SIZE = 46
            return (
              <div key={seat.id}>
                <div style={{
                  position: 'absolute',
                  left: cx - SEAT_SIZE / 2,
                  top: cy - SEAT_SIZE / 2,
                  width: SEAT_SIZE,
                  height: SEAT_SIZE,
                  borderRadius: '50%',
                  background: seat.bg,
                  border: seat.border ? '1.5px solid rgba(245,239,230,0.18)' : 'none',
                  boxShadow: seat.ghost ? 'none' : '0 4px 16px rgba(0,0,0,0.40)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: seat.ghost ? 0.55 : 1,
                }}>
                  <span style={{
                    ...sansStyle,
                    fontSize: seat.initials === 'ВЫ' ? 11 : 15,
                    fontWeight: 700,
                    color: seat.fg,
                  }}>
                    {seat.initials}
                  </span>
                </div>
                {/* Name label */}
                <span style={{
                  position: 'absolute',
                  left: cx - 30,
                  top: cy + SEAT_SIZE / 2 + 6,
                  width: 60,
                  textAlign: 'center',
                  ...sansStyle,
                  fontSize: 10,
                  fontWeight: 500,
                  color: seat.ghost ? 'rgba(245,239,230,0.30)' : 'rgba(245,239,230,0.65)',
                  whiteSpace: 'nowrap',
                }}>
                  {seat.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 28px 36px', position: 'relative', zIndex: 5 }}>
        <div style={{ ...serifStyle, fontSize: 24, lineHeight: 1.15 }}>
          {participants.length >= totalSeats
            ? 'круг собран.'
            : `${participants.length} из ${totalSeats},`}
          <br />
          {participants.length >= totalSeats
            ? 'вечер ждёт вас.'
            : 'скоро все будут.'}
        </div>

        <div style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 18,
          background: 'rgba(245,239,230,0.08)',
          border: '1px solid rgba(245,239,230,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...sansStyle,
          fontSize: 13,
          color: 'rgba(245,239,230,0.78)',
        }}>
          <span>место откроется в {revealTime}</span>
          <span style={{ color: COLORS.tomato, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {countdown}
          </span>
        </div>

        <button
          style={{
            marginTop: 12,
            width: '100%',
            background: COLORS.tomato,
            color: COLORS.cream,
            border: 'none',
            padding: '14px',
            borderRadius: 99,
            ...sansStyle,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 10px 24px rgba(232,71,44,0.35)',
          }}
          onClick={() => { haptic('medium'); navigate('/waiting') }}
        >
          обратный отсчёт →
        </button>
      </div>
    </div>
  )
}
