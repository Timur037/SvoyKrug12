import { useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'

const PEOPLE = [
  { id: 'you', label: 'вы',                   color: COLORS.tomato, textColor: COLORS.cream, border: false },
  { id: 'a',   label: 'редактор, 28',         color: COLORS.cream2, textColor: COLORS.ink,   border: false },
  { id: 'b',   label: 'переехала из Питера',  color: COLORS.tomato, textColor: COLORS.cream, border: false },
  { id: 'c',   label: 'ходит в горы',         color: '#fff',        textColor: COLORS.ink,   border: true  },
  { id: 'd',   label: 'историк, 31',          color: COLORS.cream2, textColor: COLORS.ink,   border: false },
  { id: 'e',   label: 'пишет тихо',           color: COLORS.cream2, textColor: COLORS.ink,   border: false },
] as const

const DRIFT_KEYFRAMES = `
  @keyframes drift0 { 0%{transform:translate(0,0)} 33%{transform:translate(8px,-6px)} 66%{transform:translate(-5px,9px)} 100%{transform:translate(0,0)} }
  @keyframes drift1 { 0%{transform:translate(0,0)} 25%{transform:translate(-9px,4px)} 60%{transform:translate(7px,8px)} 100%{transform:translate(0,0)} }
  @keyframes drift2 { 0%{transform:translate(0,0)} 40%{transform:translate(10px,7px)} 75%{transform:translate(-6px,-9px)} 100%{transform:translate(0,0)} }
  @keyframes drift3 { 0%{transform:translate(0,0)} 30%{transform:translate(-7px,-8px)} 70%{transform:translate(9px,3px)} 100%{transform:translate(0,0)} }
  @keyframes drift4 { 0%{transform:translate(0,0)} 50%{transform:translate(6px,10px)} 100%{transform:translate(0,0)} }
  @keyframes anchorDrift { 0%{transform:translate(0,0)} 50%{transform:translate(-3px,-4px)} 100%{transform:translate(0,0)} }
`

export function GroupScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    if (document.getElementById('circle-drift-kf')) return
    const s = document.createElement('style')
    s.id = 'circle-drift-kf'
    s.textContent = DRIFT_KEYFRAMES
    document.head.appendChild(s)
  }, [])

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
          пятница · 19:30
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 36, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
          <span style={serifStyle}>ваш круг</span>
          <br />
          <span style={serifStyle}>почти собран.</span>
        </h1>
      </div>

      {/* Dots stage */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Ghost "6" */}
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
          6
        </div>

        {/* You — anchor dot */}
        <DriftDot
          x={cx} y={cy} size={56}
          color={COLORS.tomato} textColor={COLORS.cream}
          label="вы" bold
          anim={`anchorDrift ${driftDurations[5]}s cubic-bezier(0.4,0,0.6,1) infinite`}
        />

        {/* Others */}
        {PEOPLE.slice(1).map((p, i) => {
          const angle = (i / (PEOPLE.length - 1)) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * R
          const y = cy + Math.sin(angle) * R
          const dur = driftDurations[i] ?? 10
          return (
            <DriftDot
              key={p.id}
              x={x} y={y} size={36}
              color={p.color} textColor={p.textColor}
              label={p.label}
              border={p.border}
              anim={`drift${i % 5} ${dur}s cubic-bezier(0.4,0,0.6,1) infinite`}
            />
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '0 28px 36px', position: 'relative', zIndex: 5 }}>
        <div style={{ ...serifStyle, fontSize: 24, lineHeight: 1.15 }}>
          шесть людей,
          <br />
          которым будет легко
          <br />
          друг с другом.
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
          <span>место откроется в 16:30</span>
          <span style={{ color: COLORS.tomato, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            −2д 04ч
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
          разговорник за 24 часа →
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
  bold?: boolean
  border?: boolean
  anim: string
}

function DriftDot({
  x, y, size, color, textColor, label, bold, border, anim,
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
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: 99,
        background: color,
        border: border ? '1.5px solid rgba(245,239,230,0.4)' : 'none',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        ...sansStyle,
        fontSize: bold ? 14 : 0,
        fontWeight: 700,
      }}>
        {bold && label}
      </div>
      {!bold && (
        <div style={{
          position: 'absolute',
          top: size + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          ...sansStyle,
          fontSize: 10,
          color: 'rgba(245,239,230,0.75)',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
