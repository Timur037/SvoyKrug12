import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import { fetchUserBookings, fetchMeetupParticipants, type DbMeetup, type DbParticipant } from '../lib/db'

const DRIFT_KEYFRAMES = `
  @keyframes drift0 { 0%{transform:translate(0,0)} 33%{transform:translate(8px,-6px)} 66%{transform:translate(-5px,9px)} 100%{transform:translate(0,0)} }
  @keyframes drift1 { 0%{transform:translate(0,0)} 25%{transform:translate(-9px,4px)} 60%{transform:translate(7px,8px)} 100%{transform:translate(0,0)} }
  @keyframes drift2 { 0%{transform:translate(0,0)} 40%{transform:translate(10px,7px)} 75%{transform:translate(-6px,-9px)} 100%{transform:translate(0,0)} }
  @keyframes drift3 { 0%{transform:translate(0,0)} 30%{transform:translate(-7px,-8px)} 70%{transform:translate(9px,3px)} 100%{transform:translate(0,0)} }
  @keyframes drift4 { 0%{transform:translate(0,0)} 50%{transform:translate(6px,10px)} 100%{transform:translate(0,0)} }
  @keyframes anchorDrift { 0%{transform:translate(0,0)} 50%{transform:translate(-3px,-4px)} 100%{transform:translate(0,0)} }
`

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
    if (document.getElementById('circle-drift-kf')) return
    const s = document.createElement('style')
    s.id = 'circle-drift-kf'
    s.textContent = DRIFT_KEYFRAMES
    document.head.appendChild(s)
  }, [])

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

  const cx = (typeof window !== 'undefined' ? window.innerWidth : 360) / 2 - 22
  const cy = 200
  const R = 120

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

  const driftDurations = [9, 10.5, 12, 13.5, 11, 14]

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

  const dayLabel = getWeekdayRu(meetup?.scheduled_at ?? null)
  const timeLabel = getMeetupTime(meetup?.scheduled_at ?? null)
  const revealTime = getRevealTime(meetup?.scheduled_at ?? null)
  const countdown = getCountdown(meetup?.scheduled_at ?? null)
  const totalLabel = `${totalSeats}`

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

      {/* Dots stage */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Ghost number */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          ...serifStyle,
          fontSize: 340,
          lineHeight: 1,
          color: 'rgba(232,71,44,0.10)',
          letterSpacing: '-0.04em',
          userSelect: 'none',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          {totalLabel}
        </div>

        {/* You — anchor dot */}
        <DriftDot
          x={cx} y={cy} size={56}
          color={COLORS.tomato} textColor={COLORS.cream}
          label="вы" initials="ВЫ" bold
          anim={`anchorDrift ${driftDurations[5]}s cubic-bezier(0.4,0,0.6,1) infinite`}
        />

        {/* Others + ghost slots */}
        {surroundingDots.map((p, i) => {
          const count = Math.max(surroundingDots.length, 5)
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * R
          const y = cy + Math.sin(angle) * R
          const dur = driftDurations[i] ?? 10
          return (
            <DriftDot
              key={p.id}
              x={x} y={y} size={p.ghost ? 32 : 36}
              color={p.color} textColor={p.textColor}
              label={p.label}
              initials={p.initials}
              border={p.border}
              ghost={p.ghost}
              anim={p.ghost ? 'none' : `drift${i % 5} ${dur}s cubic-bezier(0.4,0,0.6,1) infinite`}
            />
          )
        })}
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

interface DriftDotProps {
  x: number
  y: number
  size: number
  color: string
  textColor: string
  label: string
  initials?: string
  bold?: boolean
  border?: boolean
  ghost?: boolean
  anim: string
}

function DriftDot({
  x, y, size, color, textColor, label, initials, bold, border, ghost, anim,
}: DriftDotProps) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      animation: anim,
      willChange: 'transform',
      zIndex: 5,
      opacity: ghost ? 0.5 : 1,
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: 99,
        background: color,
        border: border ? '1.5px solid rgba(245,239,230,0.4)' : 'none',
        boxShadow: ghost ? 'none' : '0 4px 14px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        ...sansStyle,
        fontSize: bold ? 12 : 10,
        fontWeight: bold ? 700 : 600,
        letterSpacing: bold ? '-0.01em' : 'normal',
      }}>
        {initials ?? ''}
      </div>
      {!bold && (
        <div style={{
          position: 'absolute',
          top: size + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          ...sansStyle,
          fontSize: 10,
          color: ghost ? 'rgba(245,239,230,0.35)' : 'rgba(245,239,230,0.75)',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
