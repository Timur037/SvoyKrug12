import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle, caveatStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

type Seat = {
  name: string
  initial: string
  bg: string
  cx: number
  cy: number
}

const TABLE_CONTAINER = 350
const TABLE_CENTER = TABLE_CONTAINER / 2
const SEAT_RADIUS = 148
const TABLE_RADIUS = 88

type SeatRaw = Pick<Seat, 'name' | 'initial' | 'bg'>

const RAW_SEATS: SeatRaw[] = [
  { name: 'Артём', initial: 'А', bg: 'rgba(232,71,44,0.90)' },
  { name: 'Маша', initial: 'М', bg: 'rgba(120,95,75,0.90)' },
  { name: 'Лёня', initial: 'Л', bg: 'rgba(45,74,62,0.90)' },
  { name: 'Катя', initial: 'К', bg: 'rgba(155,115,90,0.90)' },
  { name: 'Саша', initial: 'С', bg: 'rgba(90,75,65,0.90)' },
  { name: 'Вера', initial: 'В', bg: 'rgba(100,80,60,0.90)' },
]

const SEATS: Seat[] = RAW_SEATS.map((s, i) => {
  const angleRad = ((i * 60 - 90) * Math.PI) / 180
  return {
    ...s,
    cx: TABLE_CENTER + SEAT_RADIUS * Math.cos(angleRad),
    cy: TABLE_CENTER + SEAT_RADIUS * Math.sin(angleRad),
  }
})

export function Onb3() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.ink,
    color: COLORS.cream,
    overflow: 'hidden',
  }

  const warmGlow: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse 80% 60% at 50% 44%, rgba(50,35,18,0.9) 0%, rgba(26,22,18,0) 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  }

  const ghostSix: CSSProperties = {
    position: 'absolute',
    top: '5%',
    left: '50%',
    transform: 'translateX(-50%)',
    ...serifStyle,
    fontSize: 500,
    lineHeight: 1,
    color: 'rgba(245,239,230,0.025)',
    pointerEvents: 'none',
    userSelect: 'none',
    margin: 0,
    zIndex: 0,
  }

  const overline: CSSProperties = {
    position: 'absolute',
    top: 52,
    left: 28,
    zIndex: 5,
    ...sansStyle,
    fontSize: 11,
    letterSpacing: '0.16em',
    fontWeight: 500,
    color: 'rgba(245,239,230,0.45)',
    textTransform: 'uppercase',
  }

  const tableWrap: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -52%)',
    zIndex: 2,
    width: TABLE_CONTAINER,
    height: TABLE_CONTAINER,
    flexShrink: 0,
    animation: 'tableIn 800ms cubic-bezier(0.22,1,0.36,1) both',
  }

  const tableSurface: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 176,
    height: 176,
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #2A1E12 0%, #1A1208 100%)',
    border: '1.5px solid rgba(244,201,93,0.30)',
    boxShadow:
      '0 0 50px rgba(244,201,93,0.20), 0 0 100px rgba(244,201,93,0.08), inset 0 1px 0 rgba(244,201,93,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const centerSix: CSSProperties = {
    ...serifStyle,
    fontSize: 80,
    lineHeight: 1,
    color: COLORS.honey,
    opacity: 0.92,
    textShadow: '0 0 40px rgba(244,201,93,0.50)',
    animation: 'flicker 3.5s ease-in-out infinite alternate',
    margin: 0,
  }

  const bottomBlock: CSSProperties = {
    position: 'absolute',
    bottom: 110,
    left: 28,
    right: 28,
    zIndex: 4,
  }

  const separator: CSSProperties = {
    width: '100%',
    height: 1,
    background: 'rgba(245,239,230,0.10)',
    marginBottom: 20,
  }

  const captionLabel: CSSProperties = {
    ...sansStyle,
    fontSize: 12,
    color: 'rgba(245,239,230,0.45)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 10,
    display: 'block',
  }

  const captionMain: CSSProperties = {
    ...serifStyle,
    fontSize: 36,
    lineHeight: 1.08,
    color: COLORS.cream,
    margin: 0,
  }

  const vibeTag: CSSProperties = {
    marginTop: 18,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(244,201,93,0.12)',
    border: '1px solid rgba(244,201,93,0.25)',
    borderRadius: 99,
    padding: '7px 14px',
  }

  const vibeDot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: 3,
    background: COLORS.honey,
  }

  const vibeText: CSSProperties = {
    ...caveatStyle,
    fontSize: 18,
    color: COLORS.honey,
  }

  const bottomRow: CSSProperties = {
    position: 'absolute',
    bottom: 32,
    left: 28,
    right: 28,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const dotsWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const startBtn: CSSProperties = {
    ...sansStyle,
    background: COLORS.honey,
    color: COLORS.ink,
    padding: '16px 24px',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(244,201,93,0.30)',
    border: 'none',
    cursor: 'pointer',
  }

  function start() {
    haptic('medium')
    navigate('/onboarding/quiz1')
  }

  return (
    <div style={root}>
      <div style={warmGlow} />
      <p style={ghostSix}>6</p>
      <Grain opacity={0.45} />

      <style>{`
        @keyframes flicker {
          0%{opacity:0.7;transform:scale(0.95)}
          100%{opacity:1;transform:scale(1.05)}
        }
        @keyframes seatIn {
          from{opacity:0;transform:scale(0.6)}
          to{opacity:1;transform:scale(1)}
        }
        @keyframes tableIn {
          from{opacity:0;transform:translate(-50%,-52%) scale(0.75)}
          to{opacity:1;transform:translate(-50%,-52%) scale(1)}
        }
      `}</style>

      <span style={overline}>идея в одной цифре · 03</span>

      <div style={tableWrap}>
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: TABLE_CONTAINER,
            height: TABLE_CONTAINER,
            zIndex: -1,
          }}
          viewBox={`0 0 ${TABLE_CONTAINER} ${TABLE_CONTAINER}`}
        >
          {SEATS.map((_, i) => {
            const angle = ((i * 60 - 90) * Math.PI) / 180
            const x1 = TABLE_CENTER + TABLE_RADIUS * Math.cos(angle)
            const y1 = TABLE_CENTER + TABLE_RADIUS * Math.sin(angle)
            const x2 = TABLE_CENTER + SEAT_RADIUS * Math.cos(angle)
            const y2 = TABLE_CENTER + SEAT_RADIUS * Math.sin(angle)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(245,239,230,0.08)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            )
          })}
        </svg>

        <div style={tableSurface}>
          <span style={centerSix}>6</span>
        </div>

        {SEATS.map((seat, i) => (
          <div key={seat.name}>
            <div
              style={{
                position: 'absolute',
                left: seat.cx - 23,
                top: seat.cy - 23,
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: seat.bg,
                border: '2px solid rgba(245,239,230,0.18)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.40)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `seatIn 600ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
              }}
            >
              <span
                style={{
                  ...sansStyle,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'rgba(245,239,230,0.95)',
                }}
              >
                {seat.initial}
              </span>
            </div>
            <span
              style={{
                position: 'absolute',
                left: seat.cx - 28,
                top: seat.cy + 27,
                width: 56,
                textAlign: 'center',
                ...sansStyle,
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(245,239,230,0.55)',
                letterSpacing: '0.04em',
              }}
            >
              {seat.name}
            </span>
          </div>
        ))}
      </div>

      <div style={bottomBlock}>
        <div style={separator} />
        <span style={captionLabel}>столько людей в вашем круге</span>
        <h2 style={captionMain}>не больше — чтобы услышать каждого.</h2>
        <div style={vibeTag}>
          <span style={vibeDot} />
          <span style={vibeText}>тёплый формат</span>
        </div>
      </div>

      <div style={bottomRow}>
        <span style={dotsWrap}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: 'rgba(245,239,230,0.25)',
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: 'rgba(245,239,230,0.25)',
            }}
          />
          <span
            style={{
              width: 24,
              height: 8,
              borderRadius: 4,
              background: COLORS.cream,
            }}
          />
        </span>
        <button style={startBtn} onClick={start}>
          начать
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke={COLORS.ink}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
