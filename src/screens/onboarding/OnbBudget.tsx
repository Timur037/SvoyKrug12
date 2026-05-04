import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const OPTIONS = [
  { id: 'budget_1000', label: 'до 1 000 ₽',    hint: 'кофейня, кафе' },
  { id: 'budget_3000', label: 'до 3 000 ₽',    hint: 'ресторан, хорошая кухня' },
  { id: 'budget_5000', label: 'до 5 000 ₽',    hint: 'атмосферное место, без спешки' },
  { id: 'budget_premium', label: '5 000+ ₽',   hint: 'уровень без компромиссов' },
] as const

export function OnbBudget() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(id: string) {
    if (picked) return
    haptic('medium')
    setPicked(id)
    try { localStorage.setItem('svoy_krug_budget', id) } catch { /* ignore */ }
    setTimeout(() => navigate('/onboarding/done'), 240)
  }

  return (
    <OnbShell step={10} total={11} backTo="/onboarding/your-qualities">
      <div style={{ padding: '32px 22px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          сколько готовы потратить на ужин?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 36px' }}>
          подберём место под ваш бюджет
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPTIONS.map(({ id, label, hint }) => {
            const sel = picked === id
            return (
              <button
                key={id}
                onClick={() => pick(id)}
                style={{
                  ...sansStyle,
                  width: '100%',
                  padding: '18px 22px',
                  borderRadius: RADII.lg,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.10)',
                  boxShadow: sel ? SHADOWS.panel : SHADOWS.chip,
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <span style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: sel ? COLORS.cream : COLORS.ink,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: sel ? 'rgba(245,239,230,0.65)' : COLORS.inkSoft,
                  }}>
                    {hint}
                  </span>
                </div>
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
