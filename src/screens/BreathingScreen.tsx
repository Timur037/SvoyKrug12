import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'

export function BreathingScreen() {
  const navigate = useNavigate()
  const [now, setNow] = useState<number>(() => Date.now())
  const [showReassurance, setShowReassurance] = useState<boolean>(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Target: 2 days + 4 hours from initial mount.
  const target = useMemo<number>(() => Date.now() + (2 * 24 + 4) * 3600 * 1000, [])
  const ms = Math.max(0, target - now)
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const total = (2 * 24 + 4) * 3600
  const passed = total - (days * 24 + hours) * 3600
  const pct = Math.min(1, Math.max(0, passed / total))

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

  return (
    <div style={root}>
      <Grain opacity={0.22} />

      <button style={back} onClick={() => { haptic('light'); navigate('/calendar') }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Sundial line */}
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
        {/* tiny label */}
        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: COLORS.inkSoft,
          textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          ваш круг · пятница
        </div>

        {/* headline */}
        <h1 style={{
          ...serifStyle,
          margin: 0,
          fontSize: 44,
          lineHeight: 1.05,
          color: COLORS.ink,
          letterSpacing: '-0.02em',
        }}>
          место откроется
        </h1>

        {/* countdown */}
        <div style={{
          ...serifStyle,
          fontVariantNumeric: 'tabular-nums',
          color: COLORS.tomato,
          fontSize: 44,
          lineHeight: 1.1,
          marginTop: 6,
          letterSpacing: '-0.02em',
        }}>
          через {days} {dayWord(days)} {hours} {hourWord(hours)}
        </div>

        {/* hint */}
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

        {/* CTA */}
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

        {/* Inline reassurance — expands below in cream bg */}
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
            <div style={{
              ...serifStyle,
              fontSize: 22,
              lineHeight: 1.15,
              color: COLORS.ink,
              marginBottom: 10,
            }}>
              ничего страшного.
            </div>
            <p style={{
              ...sansStyle,
              fontSize: 13,
              color: COLORS.inkSoft,
              lineHeight: 1.6,
              margin: 0,
            }}>
              напишите за 2 часа до начала — мы тихо передадим место кому-то ещё. без штрафов и обиды. круг подождёт вас в следующий раз.
            </p>
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
  )
}
