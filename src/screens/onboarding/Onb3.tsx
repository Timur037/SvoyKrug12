import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle, caveatStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

type Chip = {
  name: string
  dot: string
  top: string
  left: string
  animDelay: string
  rot: string
}

const chips: Chip[] = [
  { name: 'Артём', dot: COLORS.tomato, top: '18%', left: '14%', animDelay: '0s', rot: '-2deg' },
  { name: 'Маша', dot: COLORS.forest, top: '14%', left: '58%', animDelay: '0.6s', rot: '1.5deg' },
  { name: 'Лёня', dot: COLORS.honey, top: '28%', left: '72%', animDelay: '1.1s', rot: '-1deg' },
  { name: 'Катя', dot: COLORS.ink, top: '60%', left: '66%', animDelay: '0.3s', rot: '2deg' },
  { name: 'Саша', dot: COLORS.tomato, top: '64%', left: '10%', animDelay: '0.9s', rot: '-1.5deg' },
  { name: 'Вера', dot: '#9B8B7A', top: '30%', left: '4%', animDelay: '0.5s', rot: '1deg' },
]

export function Onb3() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflow: 'hidden',
  }

  const glow: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(232,71,44,0.11) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
  }

  const overline: CSSProperties = {
    position: 'absolute',
    top: 52,
    left: 28,
    zIndex: 4,
    ...sansStyle,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: '0.16em',
    fontWeight: 500,
    color: COLORS.inkSoft,
  }

  const sixWrap: CSSProperties = {
    position: 'absolute',
    top: '42%',
    left: '50%',
    zIndex: 1,
    pointerEvents: 'none',
    animation: 'breathe 6s ease-in-out infinite',
    transform: 'translate(-50%, -50%)',
  }

  const sixStyle: CSSProperties = {
    ...serifStyle,
    fontSize: 280,
    lineHeight: 1,
    color: COLORS.tomato,
    opacity: 0.92,
    margin: 0,
    display: 'block',
    textShadow: '0 8px 60px rgba(232,71,44,0.20)',
  }

  const chipBase: CSSProperties = {
    position: 'absolute',
    zIndex: 3,
    background: '#fff',
    border: '1px solid rgba(26,22,18,0.10)',
    borderRadius: 99,
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 6px 20px rgba(26,22,18,0.10)',
  }

  const chipName: CSSProperties = {
    ...sansStyle,
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.ink,
  }

  const bottomBlock: CSSProperties = {
    position: 'absolute',
    bottom: 110,
    left: 28,
    right: 28,
    zIndex: 4,
  }

  const captionLabel: CSSProperties = {
    ...sansStyle,
    fontSize: 13,
    color: COLORS.inkSoft,
    marginBottom: 10,
    display: 'block',
  }

  const captionMain: CSSProperties = {
    ...serifStyle,
    fontSize: 34,
    lineHeight: 1.1,
    color: COLORS.ink,
    margin: 0,
  }

  const vibeTag: CSSProperties = {
    marginTop: 16,
    background: 'rgba(232,71,44,0.10)',
    border: '1px solid rgba(232,71,44,0.20)',
    borderRadius: 99,
    padding: '7px 14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }

  const vibeDot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: 3,
    background: COLORS.tomato,
  }

  const vibeText: CSSProperties = {
    ...caveatStyle,
    fontSize: 18,
    color: COLORS.tomatoDeep,
  }

  const bottomRow: CSSProperties = {
    position: 'absolute',
    bottom: 36,
    left: 28,
    right: 28,
    zIndex: 4,
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
    background: COLORS.ink,
    color: COLORS.cream,
    padding: '18px 26px',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
  }

  function start() {
    haptic('medium')
    navigate('/onboarding/quiz1')
  }

  return (
    <div style={root}>
      <div style={glow} />
      <Grain opacity={0.6} />
      <style>{`
        @keyframes breathe { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.03)} }
        @keyframes float0 { from{transform:translateY(0px) rotate(-2deg)} to{transform:translateY(-8px) rotate(-2deg)} }
        @keyframes float1 { from{transform:translateY(0px) rotate(1.5deg)} to{transform:translateY(-6px) rotate(1.5deg)} }
        @keyframes float2 { from{transform:translateY(0px) rotate(-1deg)} to{transform:translateY(-10px) rotate(-1deg)} }
        @keyframes float3 { from{transform:translateY(0px) rotate(2deg)} to{transform:translateY(-7px) rotate(2deg)} }
        @keyframes float4 { from{transform:translateY(0px) rotate(-1.5deg)} to{transform:translateY(-5px) rotate(-1.5deg)} }
        @keyframes float5 { from{transform:translateY(0px) rotate(1deg)} to{transform:translateY(-9px) rotate(1deg)} }
      `}</style>

      <span style={overline}>идея в одной цифре · 03</span>

      <div style={sixWrap}>
        <span style={sixStyle}>6</span>
      </div>

      {chips.map((c, i) => (
        <div
          key={c.name}
          style={{
            ...chipBase,
            top: c.top,
            left: c.left,
            transform: `rotate(${c.rot})`,
            animation: `float${i} 4s ease-in-out ${c.animDelay} infinite alternate`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: c.dot,
              flexShrink: 0,
            }}
          />
          <span style={chipName}>{c.name}</span>
        </div>
      ))}

      <div style={bottomBlock}>
        <span style={captionLabel}>столько людей в вашем круге</span>
        <h2 style={captionMain}>
          не больше — чтобы
          <br />
          услышать каждого.
        </h2>
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
              background: 'rgba(26,22,18,0.25)',
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: 'rgba(26,22,18,0.25)',
            }}
          />
          <span
            style={{
              width: 24,
              height: 8,
              borderRadius: 4,
              background: COLORS.ink,
            }}
          />
        </span>
        <button style={startBtn} onClick={start}>
          начать
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke={COLORS.cream}
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
