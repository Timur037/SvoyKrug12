import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

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
  }

  return (
    <div style={root}>
      {/* Photo top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '44%',
        backgroundImage: "url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=70')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(26,22,18,0.18) 0%, rgba(26,22,18,0.65) 72%, rgba(26,22,18,1) 100%)',
        }} />
        <Grain opacity={0.45} blend="multiply" />
        <span style={{
          position: 'absolute',
          top: 52,
          left: 28,
          ...sansStyle,
          textTransform: 'uppercase' as const,
          fontSize: 10,
          letterSpacing: '0.18em',
          fontWeight: 700,
          color: 'rgba(245,239,230,0.60)',
          zIndex: 3,
        }}>
          как это работает · 02
        </span>
      </div>

      {/* Content layer — positioned below photo with overlap */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: '36%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 28px calc(env(safe-area-inset-bottom, 0px) + 36px)',
      }}>
        <Grain opacity={0.25} blend="overlay" />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Big headline */}
          <span style={{ ...serifStyle, display: 'block', fontSize: 60, lineHeight: 0.92, color: COLORS.honey }}>5 или 6</span>
          <span style={{ ...serifStyle, display: 'block', fontSize: 60, lineHeight: 0.92, color: COLORS.honey, marginBottom: 18 }}>человек.</span>

          <p style={{
            ...sansStyle,
            fontSize: 15,
            lineHeight: 1.55,
            color: 'rgba(245,239,230,0.75)',
            margin: '0 0 28px',
            maxWidth: 310,
          }}>
            один вечер, один стол — и уже маленький круг, собранный по настроению.
          </p>

          {/* Steps — plain text, no boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['01', 'выбираете формат', 'ужин, кофе, прогулка'],
              ['02', 'мы собираем круг', '5–6 человек по настроению'],
              ['03', 'просто приходите', 'стол уже ждёт вас'],
            ].map(([num, title, sub]) => (
              <div key={num} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{
                  ...sansStyle,
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'rgba(244,201,93,0.55)',
                  letterSpacing: '0.08em',
                  flexShrink: 0,
                  width: 20,
                }}>
                  {num}
                </span>
                <div>
                  <span style={{ ...sansStyle, fontSize: 14, fontWeight: 600, color: COLORS.cream }}>{title}</span>
                  <span style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.45)', marginLeft: 8 }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(244,201,93,0.35)', display: 'inline-block' }} />
            <span style={{ width: 24, height: 8, borderRadius: 4, background: COLORS.honey, display: 'inline-block' }} />
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(244,201,93,0.35)', display: 'inline-block' }} />
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
              boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
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
