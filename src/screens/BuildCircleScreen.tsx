import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle, overlineStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'

const FIELDS = [
  { label: 'формат',  value: 'долгий ужин',          sub: '6 человек, кафе или дом' },
  { label: 'когда',   value: 'пятница, 19:30',        sub: 'через неделю' },
  { label: 'о чём',   value: 'о городе и переезде',   sub: 'мягкая тема, не обязательная' },
  { label: 'район',   value: 'Покровка / Чистые пруды', sub: '' },
]

export function BuildCircleScreen() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100dvh',
      background: COLORS.tomato,
      color: COLORS.cream,
      overflowX: 'hidden',
    }}>
      <Grain opacity={0.30} blend="overlay" />

      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: -140, right: -100,
        width: 380, height: 380, borderRadius: '50%',
        border: '1px solid rgba(245,239,230,0.10)',
        pointerEvents: 'none',
      }} />

      {/* Back */}
      <button
        style={{
          position: 'absolute', top: 56, left: 22, zIndex: 10,
          width: 40, height: 40, borderRadius: RADII.full,
          background: 'rgba(245,239,230,0.15)',
          border: '1px solid rgba(245,239,230,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={() => { haptic('light'); navigate('/home') }}
        aria-label="Назад"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ position: 'relative', zIndex: 5, padding: '110px 24px 60px' }}>
        <span style={{ ...overlineStyle, color: 'rgba(245,239,230,0.65)', display: 'block', marginBottom: 14 }}>
          предложить вечер
        </span>
        <h1 style={{ margin: '0 0 10px', ...serifStyle, fontSize: 52, lineHeight: 0.94, color: COLORS.cream }}>
          соберём<br />свой круг.
        </h1>
        <p style={{ ...sansStyle, fontSize: 15, color: 'rgba(245,239,230,0.80)', margin: '0 0 32px', lineHeight: 1.5, maxWidth: 300 }}>
          опишите вечер — мы предложим его людям с похожим настроением.
        </p>

        {!sent ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FIELDS.map(({ label, value, sub }) => (
                <button
                  key={label}
                  onClick={() => haptic('light')}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'rgba(245,239,230,0.10)',
                    border: '1px solid rgba(245,239,230,0.16)',
                    borderRadius: RADII.lg, padding: '16px 18px',
                    color: COLORS.cream,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12,
                    transition: 'background 180ms ease',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ ...overlineStyle, color: 'rgba(245,239,230,0.55)', marginBottom: 5 }}>{label}</div>
                    <div style={{ ...serifStyle, fontSize: 22, lineHeight: 1.1, color: COLORS.cream }}>{value}</div>
                    {sub && <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.55)', marginTop: 3 }}>{sub}</div>}
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="rgba(245,239,230,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>

            <button
              style={{
                marginTop: 28, width: '100%',
                background: COLORS.ink, color: COLORS.cream,
                border: 'none', padding: '18px',
                borderRadius: RADII.full, ...sansStyle,
                fontSize: 15, fontWeight: 700,
                boxShadow: SHADOWS.ctaForest,
                cursor: 'pointer',
              }}
              onClick={() => { haptic('medium'); setSent(true) }}
            >
              отправить →
            </button>
            <button
              style={{
                marginTop: 12, width: '100%',
                background: 'transparent', color: 'rgba(245,239,230,0.65)',
                border: 'none', ...sansStyle, fontSize: 13,
                fontWeight: 500, padding: '10px', cursor: 'pointer',
              }}
              onClick={() => { haptic('light'); navigate('/home') }}
            >
              отмена
            </button>
          </>
        ) : (
          <div style={{
            background: 'rgba(245,239,230,0.10)',
            border: '1px solid rgba(245,239,230,0.18)',
            borderRadius: RADII.xl, padding: '36px 24px',
            textAlign: 'center',
            animation: 'fadeIn 300ms ease both',
          }}>
            <div style={{
              width: 64, height: 64,
              margin: '0 auto 22px',
              borderRadius: RADII.full,
              background: COLORS.cream,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke={COLORS.tomato} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ ...serifStyle, fontSize: 34, lineHeight: 1.05, color: COLORS.cream, marginBottom: 12 }}>
              отправлено.
            </div>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.78)', lineHeight: 1.6, margin: '0 0 28px' }}>
              мы соберём круг и тихо уведомим, как только наберётся 5–6 человек с похожим настроением.
            </p>
            <button
              style={{
                background: COLORS.ink, color: COLORS.cream,
                border: 'none', padding: '14px 28px',
                borderRadius: RADII.full, ...sansStyle,
                fontSize: 14, fontWeight: 700,
                boxShadow: SHADOWS.ctaForest, cursor: 'pointer',
              }}
              onClick={() => { haptic('light'); navigate('/home') }}
            >
              на главную →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
