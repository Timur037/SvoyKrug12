import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

export function Onb2() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.ink,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }
  const top: CSSProperties = {
    position: 'relative',
    flex: '0 0 48%',
    backgroundImage:
      "url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=70')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
  }
  const topOverlay: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(26,22,18,0.18) 0%, rgba(26,22,18,0.55) 70%, rgba(26,22,18,0.95) 100%)',
  }
  const overline: CSSProperties = {
    ...sansStyle,
    position: 'absolute',
    top: 90,
    left: 30,
    right: 30,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: '0.16em',
    fontWeight: 500,
    color: 'rgba(245,239,230,0.85)',
    zIndex: 3,
  }
  const bottom: CSSProperties = {
    position: 'relative',
    flex: '0 0 52%',
    background: COLORS.ink,
    color: COLORS.cream,
    padding: '40px 30px 110px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  }
  const heroLine: CSSProperties = {
    ...serifStyle,
    fontSize: 62,
    lineHeight: 0.96,
    color: COLORS.honey,
    margin: 0,
    display: 'block',
  }
  const copy: CSSProperties = {
    ...sansStyle,
    fontSize: 15,
    lineHeight: 1.5,
    color: 'rgba(245,239,230,0.85)',
    maxWidth: 320,
    marginTop: 24,
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
    background: COLORS.honey,
    color: COLORS.ink,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
  }

  function go() {
    haptic('light')
    navigate('/onboarding/3')
  }

  return (
    <div style={root}>
      <div style={top}>
        <div style={topOverlay} />
        <Grain opacity={0.5} blend="multiply" />
        <span style={overline}>как это устроено · 02</span>
      </div>

      <div style={bottom}>
        <Grain opacity={0.4} blend="overlay" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={heroLine}>5 или 6</span>
          <span style={heroLine}>человек.</span>
          <p style={copy}>
            один вечер. ноль свайпов. вы просто приходите в кафе или к
            кому-то домой — и там уже маленький круг, собранный по настроению.
          </p>
        </div>

        <div style={{ ...bottomRow, position: 'relative', zIndex: 2 }}>
          <span style={dotsWrap}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: 'rgba(244,201,93,0.45)',
              }}
            />
            <span
              style={{
                width: 24,
                height: 8,
                borderRadius: 4,
                background: COLORS.honey,
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: 'rgba(244,201,93,0.45)',
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
