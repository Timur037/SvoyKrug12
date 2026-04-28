import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'

interface FieldRowProps {
  label: string
  value: string
  hint?: string
}

function FieldRow({ label, value, hint }: FieldRowProps) {
  return (
    <button
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'rgba(245,239,230,0.10)',
        border: '1px solid rgba(245,239,230,0.16)',
        borderRadius: 18,
        padding: '16px 18px',
        color: COLORS.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
      onClick={() => haptic('light')}
    >
      <div>
        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'rgba(245,239,230,0.66)',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <div style={{ ...serifStyle, fontSize: 22, lineHeight: 1.1, marginTop: 4, color: COLORS.cream }}>
          {value}
        </div>
        {hint && (
          <div style={{
            ...sansStyle,
            fontSize: 12,
            color: 'rgba(245,239,230,0.66)',
            marginTop: 4,
          }}>
            {hint}
          </div>
        )}
      </div>
      <span style={{
        ...sansStyle,
        fontSize: 18,
        color: 'rgba(245,239,230,0.66)',
        flexShrink: 0,
      }}>
        →
      </span>
    </button>
  )
}

export function BuildCircleScreen() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.tomato,
    color: COLORS.cream,
    overflowX: 'hidden',
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 60,
    left: 22,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(245,239,230,0.16)',
    border: '1px solid rgba(245,239,230,0.20)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.cream,
    zIndex: 10,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }

  return (
    <div style={root}>
      <Grain opacity={0.32} blend="overlay" />

      <button style={back} onClick={() => { haptic('light'); navigate('/home') }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ position: 'relative', zIndex: 5, padding: '120px 24px 60px' }}>

        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'rgba(245,239,230,0.85)',
          textTransform: 'uppercase',
        }}>
          предложить вечер
        </div>

        <h1 style={{ margin: '12px 0 0', fontSize: 48, lineHeight: 0.96, letterSpacing: '-0.025em', color: COLORS.cream }}>
          <span style={serifStyle}>соберём</span>
          <br />
          <span style={serifStyle}>свой круг.</span>
        </h1>

        <p style={{
          ...sansStyle,
          fontSize: 14,
          color: 'rgba(245,239,230,0.85)',
          marginTop: 12,
          lineHeight: 1.5,
          maxWidth: 320,
        }}>
          опишите вечер — мы предложим его людям с похожим настроением.
        </p>

        {!sent ? (
          <>
            <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FieldRow label="формат" value="долгий ужин" hint="6 человек, кафе или дом" />
              <FieldRow label="когда" value="пятница, 19:30" hint="через неделю" />
              <FieldRow label="о чём" value="о городе и переезде" hint="мягкая тема, не обязательная" />
              <FieldRow label="район" value="Покровка / Чистые пруды" />
            </div>

            <button
              style={{
                marginTop: 30,
                width: '100%',
                background: COLORS.ink,
                color: COLORS.cream,
                border: 'none',
                padding: '18px',
                borderRadius: 99,
                ...sansStyle,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                boxShadow: '0 12px 28px rgba(26,22,18,0.32)',
              }}
              onClick={() => { haptic('medium'); setSent(true) }}
            >
              отправить →
            </button>

            <button
              style={{
                marginTop: 12,
                width: '100%',
                background: 'transparent',
                color: 'rgba(245,239,230,0.78)',
                ...sansStyle,
                fontSize: 13,
                fontWeight: 500,
                padding: '10px',
              }}
              onClick={() => { haptic('light'); navigate('/home') }}
            >
              отмена
            </button>
          </>
        ) : (
          <div style={{
            marginTop: 30,
            background: 'rgba(245,239,230,0.10)',
            border: '1px solid rgba(245,239,230,0.20)',
            borderRadius: 24,
            padding: '28px 22px',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64,
              height: 64,
              margin: '0 auto 18px',
              borderRadius: '50%',
              background: COLORS.cream,
              color: COLORS.tomato,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke={COLORS.tomato} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ ...serifStyle, fontSize: 30, lineHeight: 1.05, color: COLORS.cream }}>
              отправлено.
            </div>
            <p style={{
              ...sansStyle,
              fontSize: 14,
              color: 'rgba(245,239,230,0.85)',
              marginTop: 10,
              lineHeight: 1.5,
            }}>
              мы соберём круг и пришлём тихое уведомление, как только наберётся 5–6 человек.
            </p>
            <button
              style={{
                marginTop: 24,
                background: COLORS.ink,
                color: COLORS.cream,
                border: 'none',
                padding: '14px 22px',
                borderRadius: 99,
                ...sansStyle,
                fontSize: 14,
                fontWeight: 700,
              }}
              onClick={() => { haptic('light'); navigate('/home') }}
            >
              на главную →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
