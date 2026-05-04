import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const DISTRICTS = [
  'Центр', 'Север', 'Северо-Восток', 'Восток',
  'Юго-Восток', 'Юг', 'Юго-Запад', 'Запад',
  'Северо-Запад', 'Подмосковье',
]

export function OnbDistrict() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(val: string) {
    if (picked) return
    haptic('medium')
    setPicked(val)
    try { localStorage.setItem('svoy_krug_district', val) } catch { /* ignore */ }
    setTimeout(() => navigate('/onboarding/quiz1'), 240)
  }

  return (
    <OnbShell step={6} total={11} backTo="/onboarding/work">
      <div style={{ padding: '32px 22px 40px', flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          где встречаетесь?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 28px' }}>
          выберите район Москвы
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {DISTRICTS.map((label) => {
            const sel = picked === label
            return (
              <button
                key={label}
                onClick={() => pick(label)}
                style={{
                  ...sansStyle,
                  padding: '13px 20px',
                  borderRadius: RADII.full,
                  fontSize: 15,
                  fontWeight: sel ? 600 : 500,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.10)',
                  boxShadow: sel ? '0 4px 14px rgba(26,22,18,0.18)' : '0 2px 6px rgba(26,22,18,0.06)',
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  cursor: 'pointer',
                  transform: sel ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </OnbShell>
  )
}
