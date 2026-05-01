import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const OPTIONS = ['мужчина', 'женщина', 'небинарный'] as const

export function OnbGender() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(val: string) {
    if (picked) return
    haptic('medium')
    setPicked(val)
    try { localStorage.setItem('svoy_krug_gender', val) } catch { /* ignore */ }
    setTimeout(() => navigate('/onboarding/age'), 240)
  }

  return (
    <OnbShell step={1} total={7} backTo="/onboarding/3">
      <div style={{ padding: '32px 22px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          кто вы?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 36px' }}>
          помогает подобрать компанию
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPTIONS.map((opt) => {
            const sel = picked === opt
            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                style={{
                  ...sansStyle,
                  width: '100%',
                  padding: '18px 22px',
                  borderRadius: RADII.lg,
                  fontSize: 17,
                  fontWeight: sel ? 600 : 500,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.10)',
                  boxShadow: sel ? SHADOWS.panel : SHADOWS.chip,
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                {opt}
                {sel && (
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: RADII.full,
                    background: COLORS.tomato,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.3 2.3L9 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </OnbShell>
  )
}
