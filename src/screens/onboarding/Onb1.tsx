import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

export function Onb1() {
  const navigate = useNavigate()

  function go() {
    haptic('light')
    navigate('/onboarding/2')
  }

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.tomato,
    color: COLORS.cream,
    overflow: 'hidden',
  }

  return (
    <div style={root}>
      <Grain opacity={0.55} blend="multiply" />

      {/* Decorative circles — subtle, not AI */}
      <div style={{
        position: 'absolute',
        top: -200,
        right: -100,
        width: 440,
        height: 440,
        borderRadius: '50%',
        border: '1px solid rgba(245,239,230,0.10)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: -100,
        right: -40,
        width: 240,
        height: 240,
        borderRadius: '50%',
        border: '1px solid rgba(245,239,230,0.08)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        padding: '80px 30px calc(env(safe-area-inset-bottom, 0px) + 44px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 2,
      }}>
        <div>
          <span style={{
            ...sansStyle,
            display: 'block',
            textTransform: 'uppercase' as const,
            fontSize: 10,
            letterSpacing: '0.18em',
            fontWeight: 700,
            color: 'rgba(245,239,230,0.65)',
            marginBottom: 30,
          }}>
            свой круг · 01
          </span>

          <span style={{ ...serifStyle, display: 'block', fontSize: 66, lineHeight: 0.92, color: COLORS.cream }}>
            знакомиться
          </span>
          <span style={{
            display: 'block',
            fontSize: 66,
            lineHeight: 0.92,
            ...sansStyle,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: COLORS.cream,
            marginTop: 4,
          }}>
            — нормально.
          </span>

          <p style={{
            ...sansStyle,
            fontSize: 16,
            lineHeight: 1.55,
            color: 'rgba(245,239,230,0.82)',
            marginTop: 30,
            maxWidth: 300,
          }}>
            маленькие вечера на 5–6 человек. без свайпов, без анкет — только тёплая компания и один общий вечер.
          </p>
        </div>

        {/* One simple human trust line */}
        <div>
          <div style={{
            ...sansStyle,
            fontSize: 13,
            color: 'rgba(245,239,230,0.55)',
            marginBottom: 32,
          }}>
            уже 847 человек нашли свой круг в Москве
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 24, height: 8, borderRadius: 4, background: COLORS.cream, display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(245,239,230,0.35)', display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(245,239,230,0.35)', display: 'inline-block' }} />
            </div>

            <button
              style={{
                width: 64,
                height: 64,
                borderRadius: RADII.full,
                background: COLORS.cream,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 14px 40px rgba(26,22,18,0.22)',
                cursor: 'pointer',
              }}
              onClick={go}
              aria-label="Дальше"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
