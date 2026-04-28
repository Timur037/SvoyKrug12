import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle, caveatStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

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
  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    padding: '90px 30px 110px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }
  const overline: CSSProperties = {
    ...sansStyle,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: '0.16em',
    fontWeight: 500,
    color: COLORS.inkSoft,
  }
  const sixWrap: CSSProperties = {
    position: 'absolute',
    top: '38%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 1,
  }
  const sixStyle: CSSProperties = {
    ...serifStyle,
    fontSize: 300,
    lineHeight: 1,
    color: COLORS.tomato,
    margin: 0,
    animation: 'breathe 6s ease-in-out infinite',
    display: 'block',
  }
  const captionWrap: CSSProperties = {
    marginTop: 'auto',
    paddingBottom: 40,
    position: 'relative',
    zIndex: 3,
  }
  const captionLabel: CSSProperties = {
    ...sansStyle,
    fontSize: 13,
    color: COLORS.inkSoft,
    letterSpacing: '0.04em',
    textTransform: 'lowercase',
    marginBottom: 8,
    display: 'block',
  }
  const captionMain: CSSProperties = {
    ...serifStyle,
    fontSize: 30,
    lineHeight: 1.1,
    color: COLORS.ink,
    maxWidth: 280,
    margin: 0,
  }
  const quoteStyle: CSSProperties = {
    ...caveatStyle,
    color: COLORS.tomatoDeep,
    fontSize: 22,
    marginTop: 14,
    transform: 'rotate(-3deg)',
    display: 'inline-block',
  }
  const bottomRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 3,
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
      <Grain opacity={0.7} />
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }
      `}</style>
      <div style={sixWrap}>
        <span style={sixStyle}>6</span>
      </div>
      <div style={content}>
        <span style={overline}>идея в одной цифре · 03</span>

        <div style={captionWrap}>
          <span style={captionLabel}>столько людей в вашем круге</span>
          <h2 style={captionMain}>не больше — чтобы услышать каждого.</h2>
          <span style={quoteStyle}>тёплый формат</span>
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
    </div>
  )
}
