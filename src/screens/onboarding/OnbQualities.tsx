import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const QUALITIES = [
  { emoji: '⭐', label: 'честность' },
  { emoji: '👀', label: 'внимательность' },
  { emoji: '🔥', label: 'теплота' },
  { emoji: '🌿', label: 'спокойствие' },
  { emoji: '⚡', label: 'энергия' },
  { emoji: '😂', label: 'юмор' },
  { emoji: '🎯', label: 'прямота' },
  { emoji: '🌟', label: 'харизма' },
  { emoji: '🧠', label: 'глубина' },
  { emoji: '💡', label: 'любопытство' },
]

const MAX = 3

export function OnbQualities() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string[]>([])

  function toggle(label: string) {
    haptic('light')
    setPicked(prev => {
      if (prev.includes(label)) return prev.filter(x => x !== label)
      if (prev.length >= MAX) return prev
      return [...prev, label]
    })
  }

  function next() {
    if (picked.length === 0) return
    haptic('medium')
    try { localStorage.setItem('svoy_krug_qualities', JSON.stringify(picked)) } catch { /* ignore */ }
    navigate('/onboarding/done')
  }

  return (
    <OnbShell step={6} total={7} backTo="/onboarding/hobbies">
      <div style={{ padding: '32px 22px 140px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: '0 0 6px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          ценю в людях
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 32px' }}>
          выберите до {MAX} качеств
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {QUALITIES.map(({ emoji, label }) => {
            const sel = picked.includes(label)
            const atMax = picked.length >= MAX && !sel
            return (
              <button
                key={label}
                onClick={() => { if (!atMax) toggle(label) }}
                style={{
                  ...sansStyle,
                  width: '100%',
                  padding: '17px 22px',
                  borderRadius: RADII.lg,
                  fontSize: 16,
                  fontWeight: sel ? 600 : 500,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : atMax ? COLORS.inkSoft : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.09)',
                  boxShadow: sel ? SHADOWS.panel : SHADOWS.chip,
                  opacity: atMax ? 0.45 : 1,
                  transition: 'all 180ms cubic-bezier(0.22,1,0.36,1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  cursor: atMax ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {sel && (
                  <span style={{
                    width: 22, height: 22, borderRadius: RADII.full,
                    background: COLORS.tomato, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
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

      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10,
        padding: '14px 22px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: 'rgba(245,239,230,0.95)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(26,22,18,0.07)',
      }}>
        <button
          onClick={next}
          disabled={picked.length === 0}
          style={{
            ...sansStyle, width: '100%', height: 56, borderRadius: RADII.full,
            fontSize: 15, fontWeight: 700,
            background: picked.length > 0 ? COLORS.tomato : 'rgba(26,22,18,0.10)',
            color: picked.length > 0 ? COLORS.cream : COLORS.inkSoft,
            border: 'none', boxShadow: picked.length > 0 ? SHADOWS.cta : 'none',
            transition: 'all 220ms ease', cursor: picked.length > 0 ? 'pointer' : 'default',
          }}
        >
          дальше →
        </button>
      </div>
    </OnbShell>
  )
}
