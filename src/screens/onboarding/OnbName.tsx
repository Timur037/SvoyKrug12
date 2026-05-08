import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

export function OnbName() {
  const navigate = useNavigate()
  const [name, setName] = useState('')

  function proceed() {
    const trimmed = name.trim()
    if (!trimmed) return
    haptic('medium')
    try { localStorage.setItem('svoy_krug_name', trimmed) } catch { /* ignore */ }
    navigate('/onboarding/gender')
  }

  return (
    <OnbShell step={1} total={11} backTo="/onboarding/3">
      <div style={{ padding: '40px 22px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          как вас зовут?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 36px', lineHeight: 1.55 }}>
          только имя — так вас будут называть участники вечера.
        </p>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && proceed()}
          placeholder="например, Андрей"
          autoFocus
          maxLength={30}
          style={{
            ...sansStyle,
            fontSize: 22,
            fontWeight: 600,
            color: COLORS.ink,
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${name.trim() ? COLORS.tomato : 'rgba(26,22,18,0.15)'}`,
            outline: 'none',
            padding: '8px 0 12px',
            width: '100%',
            transition: 'border-color 200ms ease',
          }}
        />

        <div style={{ flex: 1 }} />

        <button
          onClick={proceed}
          disabled={!name.trim()}
          style={{
            ...sansStyle,
            width: '100%',
            padding: '17px',
            borderRadius: RADII.full,
            fontSize: 15,
            fontWeight: 700,
            background: name.trim() ? COLORS.tomato : 'rgba(26,22,18,0.10)',
            color: name.trim() ? COLORS.cream : COLORS.inkSoft,
            border: 'none',
            boxShadow: name.trim() ? '0 12px 28px rgba(232,71,44,0.32)' : 'none',
            cursor: name.trim() ? 'pointer' : 'default',
            transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          дальше →
        </button>
      </div>
    </OnbShell>
  )
}
