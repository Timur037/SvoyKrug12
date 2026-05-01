import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const TRUST_ITEMS = [
  { icon: '👥', text: '847 человек в Москве' },
  { icon: '🌿', text: 'только реальные встречи' },
  { icon: '✦',  text: 'без свайпов и анкет' },
]

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
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={root}>
      <Grain opacity={0.55} blend="multiply" />

      {/* Decorative arc — warm large circle */}
      <div style={{
        position: 'absolute',
        top: -180,
        right: -120,
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />
      {/* Bottom circle decoration */}
      <div style={{
        position: 'absolute',
        bottom: -140,
        left: -80,
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'rgba(26,22,18,0.14)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        padding: '80px 30px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>

        {/* Top: overline */}
        <div>
          <span style={{
            ...sansStyle,
            textTransform: 'uppercase',
            fontSize: 10,
            letterSpacing: '0.18em',
            fontWeight: 700,
            color: 'rgba(245,239,230,0.70)',
            display: 'block',
            marginBottom: 28,
          }}>
            свой круг
          </span>

          {/* Hero headline */}
          <div>
            <span style={{
              ...serifStyle,
              display: 'block',
              fontSize: 66,
              lineHeight: 0.92,
              color: COLORS.cream,
            }}>
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
              marginTop: 6,
            }}>
              — нормально.
            </span>
          </div>

          {/* Subtext */}
          <p style={{
            ...sansStyle,
            fontSize: 16,
            lineHeight: 1.5,
            color: 'rgba(245,239,230,0.88)',
            maxWidth: 300,
            marginTop: 28,
            margin: '28px 0 0',
          }}>
            маленькие вечера на 5–6 человек. один общий стол, тёплая компания — без лишнего.
          </p>
        </div>

        {/* Trust chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.text}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(245,239,230,0.12)',
                border: '1px solid rgba(245,239,230,0.18)',
                borderRadius: RADII.full,
                padding: '9px 16px',
                width: 'fit-content',
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ ...sansStyle, fontSize: 13, fontWeight: 500, color: 'rgba(245,239,230,0.92)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom row: dots + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 24, height: 8, borderRadius: 4, background: COLORS.cream, display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(245,239,230,0.38)', display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(245,239,230,0.38)', display: 'inline-block' }} />
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
  )
}
