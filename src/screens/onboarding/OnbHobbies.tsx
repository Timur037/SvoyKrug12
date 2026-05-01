import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const HOBBIES = [
  { emoji: '🎵', label: 'музыка' }, { emoji: '✈️', label: 'путешествия' },
  { emoji: '☕', label: 'кофе и чай' }, { emoji: '📚', label: 'книги' },
  { emoji: '🎨', label: 'искусство' }, { emoji: '🧘', label: 'йога' },
  { emoji: '🌿', label: 'природа и походы' }, { emoji: '🏃', label: 'спорт' },
  { emoji: '🍳', label: 'кулинария' }, { emoji: '🎬', label: 'кино' },
  { emoji: '📸', label: 'фотография' }, { emoji: '💼', label: 'бизнес' },
  { emoji: '🧠', label: 'психология' }, { emoji: '💻', label: 'технологии' },
  { emoji: '🎭', label: 'театр' }, { emoji: '🍷', label: 'вино' },
  { emoji: '🎮', label: 'игры' }, { emoji: '🐾', label: 'животные' },
]

const MAX = 10

export function OnbHobbies() {
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
    try { localStorage.setItem('svoy_krug_hobbies', JSON.stringify(picked)) } catch { /* ignore */ }
    navigate('/onboarding/qualities')
  }

  return (
    <OnbShell step={5} total={7} backTo="/onboarding/quiz1">
      <div style={{ padding: '32px 22px 140px', flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        <h1 style={{ margin: '0 0 6px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          что вам интересно?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 28px' }}>
          выберите до {MAX} тем — найдём похожих
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {HOBBIES.map(({ emoji, label }) => {
            const sel = picked.includes(label)
            return (
              <button
                key={label}
                onClick={() => toggle(label)}
                style={{
                  ...sansStyle,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '11px 16px',
                  borderRadius: RADII.full,
                  fontSize: 14,
                  fontWeight: sel ? 600 : 500,
                  background: sel ? COLORS.ink : COLORS.white,
                  color: sel ? COLORS.cream : COLORS.ink,
                  border: sel ? '1.5px solid transparent' : '1.5px solid rgba(26,22,18,0.10)',
                  boxShadow: sel ? SHADOWS.panel : SHADOWS.chip,
                  transition: 'all 180ms cubic-bezier(0.22,1,0.36,1)',
                  transform: sel ? 'scale(1.04)' : 'scale(1)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>{emoji}</span>
                {label}
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
        <div style={{ ...sansStyle, fontSize: 12, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 10 }}>
          {picked.length === 0 ? 'выберите хотя бы одно' : `выбрано: ${picked.length}`}
        </div>
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
