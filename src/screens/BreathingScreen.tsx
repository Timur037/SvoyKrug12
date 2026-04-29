import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchUpcomingMeetup, type DbMeetup } from '../lib/db'

function dayWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня'
  return 'дней'
}

function hourWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'час'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'часа'
  return 'часов'
}

function weekdayRu(date: Date): string {
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  return days[date.getDay()] ?? ''
}

export function BreathingScreen() {
  const navigate = useNavigate()
  const [now, setNow] = useState<number>(() => Date.now())
  const [showReassurance, setShowReassurance] = useState<boolean>(false)
  const [meetup, setMeetup] = useState<DbMeetup | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetchUpcomingMeetup().then(setMeetup).catch(console.error)
  }, [])

  // Real target from meetup, or fallback to +52h from mount
  const target = useMemo<number>(() => {
    if (meetup?.scheduled_at) {
      return new Date(meetup.scheduled_at).getTime()
    }
    return Date.now() + (2 * 24 + 4) * 3600 * 1000
  }, [meetup])

  const ms = Math.max(0, target - now)
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)

  // Progress for sundial line (0→1 as event approaches, show last 72h)
  const windowMs = 72 * 3600 * 1000
  const timeUntil = target - now
  const pct = timeUntil <= 0 ? 1 : Math.max(0, 1 - timeUntil / windowMs)

  const dayLabel = meetup?.scheduled_at ? weekdayRu(new Date(meetup.scheduled_at)) : 'пятница'
  const circleLabel = meetup?.title ?? 'ваш круг'
  const placeRevealTime = meetup?.scheduled_at
    ? (() => {
        const d = new Date(meetup.scheduled_at)
        d.setHours(d.getHours() - 6)
        return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
      })()
    : '16:30'

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.cream,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 60,
    left: 22,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(26,22,18,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.ink,
    zIndex: 30,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }

  return (
    <PageTransition>
    <div style={root}>
      <Grain opacity={0.22} />

      <button style={back} onClick={() => { haptic('light'); navigate('/calendar') }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Sundial line — grows as event approaches */}
      <div style={{
        position: 'absolute',
        left: '10%',
        right: `${10 + (1 - pct) * 80}%`,
        top: '52%',
        height: 1,
        background: 'linear-gradient(90deg, rgba(232,71,44,0) 0%, rgba(232,71,44,0.45) 50%, rgba(232,71,44,0) 100%)',
        zIndex: 3,
        transition: 'right 1s ease',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 36px 60px',
        maxWidth: 480,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: COLORS.inkSoft,
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          {circleLabel} · {dayLabel}
        </div>

        <h1 style={{ ...serifStyle, margin: 0, fontSize: 44, lineHeight: 1.05, color: COLORS.ink, letterSpacing: '-0.02em' }}>
          {ms === 0 ? 'вечер уже начался' : 'место откроется'}
        </h1>

        {ms > 0 && (
          <div style={{
            ...serifStyle,
            fontVariantNumeric: 'tabular-nums',
            color: COLORS.tomato,
            fontSize: 44,
            lineHeight: 1.1,
            marginTop: 6,
            letterSpacing: '-0.02em',
          }}>
            {days > 0 ? `через ${days} ${dayWord(days)} ${hours} ${hourWord(hours)}` : `через ${hours} ${hourWord(hours)}`}
          </div>
        )}

        <div style={{
          ...sansStyle,
          fontSize: 13,
          color: COLORS.inkSoft,
          marginTop: 30,
          fontWeight: 500,
          lineHeight: 1.5,
          maxWidth: 280,
        }}>
          вы получите адрес, когда круг будет готов выйти из дома.
        </div>

        <button
          style={{
            marginTop: 32,
            background: COLORS.tomato,
            color: COLORS.cream,
            border: 'none',
            padding: '14px 24px',
            borderRadius: 99,
            ...sansStyle,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 8px 20px rgba(232,71,44,0.35)',
          }}
          onClick={() => { haptic('medium'); navigate('/group') }}
        >
          открыть разговорник →
        </button>

        <button
          style={{
            marginTop: 20,
            ...sansStyle,
            fontSize: 12,
            color: COLORS.inkSoft,
            background: 'transparent',
            border: 'none',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            opacity: 0.7,
          }}
          onClick={() => { haptic('light'); setShowReassurance((v) => !v) }}
          aria-expanded={showReassurance}
        >
          {showReassurance ? 'свернуть' : 'что если я не смогу прийти?'}
        </button>

        {showReassurance && (
          <div style={{
            marginTop: 18,
            padding: '20px 22px',
            background: COLORS.cream2,
            border: '1px solid rgba(26,22,18,0.08)',
            borderRadius: 20,
            textAlign: 'left',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{ ...serifStyle, fontSize: 22, lineHeight: 1.15, color: COLORS.ink, marginBottom: 10 }}>
              ничего страшного.
            </div>
            <p style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.6, margin: 0 }}>
              напишите за 2 часа до начала — мы тихо передадим место кому-то ещё. без штрафов и обиды. круг подождёт вас в следующий раз.
            </p>
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: '#fff',
              ...sansStyle,
              fontSize: 12,
              color: COLORS.inkSoft,
            }}>
              адрес откроется в <span style={{ color: COLORS.tomato, fontWeight: 700 }}>{placeRevealTime}</span> в день встречи
            </div>
            <button
              style={{
                marginTop: 14,
                ...sansStyle,
                fontSize: 13,
                fontWeight: 600,
                color: COLORS.tomato,
                background: 'transparent',
                border: 'none',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
              onClick={() => { haptic('light'); navigate('/calendar') }}
            >
              перенести вечер →
            </button>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}
