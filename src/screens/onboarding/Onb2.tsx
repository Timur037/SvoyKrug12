import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const STEPS = [
  { icon: '📍', label: 'выбираете формат', sub: 'ужин, кофе, прогулка' },
  { icon: '✦',  label: 'мы собираем круг', sub: '5–6 человек по настроению' },
  { icon: '🥂', label: 'просто приходите', sub: 'стол уже ждёт вас' },
]

export function Onb2() {
  const navigate = useNavigate()

  function go() {
    haptic('light')
    navigate('/onboarding/3')
  }

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.ink,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={root}>
      {/* Photo half */}
      <div style={{
        position: 'relative',
        flex: '0 0 42%',
        backgroundImage: "url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=70')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(26,22,18,0.20) 0%, rgba(26,22,18,0.60) 70%, rgba(26,22,18,1.0) 100%)',
        }} />
        <Grain opacity={0.45} blend="multiply" />

        {/* Overline on photo */}
        <span style={{
          position: 'absolute',
          top: 52,
          left: 28,
          ...sansStyle,
          textTransform: 'uppercase',
          fontSize: 10,
          letterSpacing: '0.18em',
          fontWeight: 700,
          color: 'rgba(245,239,230,0.65)',
          zIndex: 3,
        }}>
          как это работает · 02
        </span>
      </div>

      {/* Bottom dark half */}
      <div style={{
        position: 'relative',
        flex: '1',
        background: COLORS.ink,
        color: COLORS.cream,
        padding: '32px 28px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        <Grain opacity={0.35} blend="overlay" />
        {/* Warm glow */}
        <div style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 200,
          background: 'radial-gradient(ellipse, rgba(244,201,93,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Headline */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ ...serifStyle, display: 'block', fontSize: 58, lineHeight: 0.94, color: COLORS.honey }}>
              5 или 6
            </span>
            <span style={{ ...serifStyle, display: 'block', fontSize: 58, lineHeight: 0.94, color: COLORS.honey }}>
              человек.
            </span>
            <p style={{ ...sansStyle, fontSize: 14, lineHeight: 1.5, color: 'rgba(245,239,230,0.78)', margin: '16px 0 0', maxWidth: 300 }}>
              один вечер, один стол — и уже маленький круг, собранный по настроению.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((step, i) => (
              <div key={step.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: RADII.lg,
                background: 'rgba(245,239,230,0.06)',
                border: '1px solid rgba(245,239,230,0.08)',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADII.md,
                  background: i === 0 ? COLORS.tomato : i === 1 ? COLORS.forest : 'rgba(244,201,93,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ ...sansStyle, fontSize: 13, fontWeight: 600, color: COLORS.cream }}>{step.label}</div>
                  <div style={{ ...sansStyle, fontSize: 11, color: 'rgba(245,239,230,0.55)', marginTop: 2 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(244,201,93,0.40)', display: 'inline-block' }} />
            <span style={{ width: 24, height: 8, borderRadius: 4, background: COLORS.honey, display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(244,201,93,0.40)', display: 'inline-block' }} />
          </div>
          <button
            style={{
              width: 64,
              height: 64,
              borderRadius: RADII.full,
              background: COLORS.honey,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 14px 40px rgba(0,0,0,0.32)',
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
