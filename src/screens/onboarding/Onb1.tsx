import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

export function Onb1() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.tomato,
    color: COLORS.cream,
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
    color: 'rgba(245,239,230,0.85)',
  }
  const heroWrap: CSSProperties = {
    marginTop: 22,
  }
  const heroLine: CSSProperties = {
    fontSize: 64,
    lineHeight: 0.94,
    color: COLORS.cream,
    margin: 0,
    display: 'block',
  }
  const subtext: CSSProperties = {
    ...sansStyle,
    fontSize: 15,
    lineHeight: 1.45,
    color: 'rgba(245,239,230,0.85)',
    maxWidth: 320,
    marginTop: 28,
  }
  const bottomRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
  const dotsWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }
  const arrowBtn: CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: COLORS.cream,
    color: COLORS.ink,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 40px rgba(26,22,18,0.18)',
  }

  function go() {
    haptic('light')
    navigate('/onboarding/2')
  }

  return (
    <div style={root}>
      <Grain opacity={0.6} blend="multiply" />
      <div style={content}>
        <div>
          <span style={overline}>свой круг · 01</span>
          <div style={heroWrap}>
            <span style={{ ...heroLine, ...serifStyle }}>знакомиться</span>
            <span
              style={{
                ...heroLine,
                ...sansStyle,
                fontWeight: 700,
              }}
            >
              — нормально.
            </span>
          </div>
          <p style={subtext}>
            маленькие вечера на 5–6 человек. без свайпов, без анкет — только
            тёплая компания и один общий вечер.
          </p>
        </div>

        <div style={bottomRow}>
          <span style={dotsWrap}>
            <span
              style={{
                width: 24,
                height: 8,
                borderRadius: 4,
                background: COLORS.cream,
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: 'rgba(245,239,230,0.45)',
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: 'rgba(245,239,230,0.45)',
              }}
            />
          </span>
          <button style={arrowBtn} onClick={go} aria-label="Дальше">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    </div>
  )
}
