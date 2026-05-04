import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const INDUSTRIES = [
  { emoji: '💻', label: 'технологии / IT' },
  { emoji: '💰', label: 'финансы и банки' },
  { emoji: '🏥', label: 'медицина' },
  { emoji: '🎨', label: 'дизайн и творчество' },
  { emoji: '📱', label: 'маркетинг / медиа' },
  { emoji: '🏗️', label: 'строительство / недвижимость' },
  { emoji: '📚', label: 'образование / наука' },
  { emoji: '⚖️', label: 'юриспруденция' },
  { emoji: '🍕', label: 'рестораны / еда' },
  { emoji: '🤝', label: 'продажи / консалтинг' },
  { emoji: '🎓', label: 'студент' },
  { emoji: '✨', label: 'другое' },
]

export function OnbWork() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(val: string) {
    if (picked) return
    haptic('medium')
    setPicked(val)
    try { localStorage.setItem('svoy_krug_work', val) } catch { /* ignore */ }
    setTimeout(() => navigate('/onboarding/district'), 240)
  }

  return (
    <OnbShell step={5} total={11} backTo="/onboarding/children">
      <div style={{ padding: '32px 22px 40px', flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          чем занимаетесь?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 28px' }}>выберите одно</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {INDUSTRIES.map(({ emoji, label }) => {
            const sel = picked === label
            return (
              <button
                key={label}
                onClick={() => pick(label)}
                style={{
                  ...sansStyle,
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: RADII.lg,
                  fontSize: 15,
                  fontWeight: sel ? 600 : 500,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.09)',
                  boxShadow: sel ? SHADOWS.panel : SHADOWS.chip,
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {sel && (
                  <span style={{
                    width: 20, height: 20, borderRadius: RADII.full,
                    background: COLORS.tomato, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.2 2.2L8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
