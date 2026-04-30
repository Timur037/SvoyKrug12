import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const HOBBIES: { emoji: string; label: string }[] = [
  { emoji: '🎵', label: 'музыка' },
  { emoji: '✈️', label: 'путешествия' },
  { emoji: '☕', label: 'кофе и чай' },
  { emoji: '📚', label: 'книги' },
  { emoji: '🎨', label: 'искусство' },
  { emoji: '🧘', label: 'йога' },
  { emoji: '🌿', label: 'природа и походы' },
  { emoji: '🏃', label: 'спорт' },
  { emoji: '🍳', label: 'кулинария' },
  { emoji: '🎬', label: 'кино' },
  { emoji: '📸', label: 'фотография' },
  { emoji: '💼', label: 'бизнес' },
  { emoji: '🧠', label: 'психология' },
  { emoji: '💻', label: 'технологии' },
  { emoji: '🎭', label: 'театр' },
  { emoji: '🍷', label: 'вино' },
  { emoji: '🎮', label: 'игры' },
  { emoji: '🐾', label: 'животные' },
]

const MAX_PICK = 5
const STEP = 1
const TOTAL = 4

export function OnbHobbies() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string[]>([])

  function toggle(label: string) {
    haptic('light')
    setPicked((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label)
      if (prev.length >= MAX_PICK) return prev
      return [...prev, label]
    })
  }

  function next() {
    if (picked.length === 0) return
    haptic('medium')
    try {
      localStorage.setItem('svoy_krug_hobbies', JSON.stringify(picked))
    } catch {
      // ignore
    }
    navigate('/onboarding/qualities')
  }

  const root: CSSProperties = {
    position: 'relative',
    background: COLORS.cream,
    color: COLORS.ink,
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  }
  const header: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    background: 'rgba(245,239,230,0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }
  const headerInner: CSSProperties = {
    position: 'relative',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
  }
  const backBtn: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(26,22,18,0.06)',
    border: '1px solid rgba(26,22,18,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.ink,
  }
  const progressTrack: CSSProperties = {
    height: 3,
    width: '100%',
    background: 'rgba(26,22,18,0.10)',
    overflow: 'hidden',
  }
  const progressFill: CSSProperties = {
    height: '100%',
    width: `${(STEP / TOTAL) * 100}%`,
    background: COLORS.tomato,
    transition: 'width 400ms ease',
  }
  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    padding: '100px 22px 100px',
    overflowY: 'auto',
  }
  const title: CSSProperties = {
    ...serifStyle,
    fontSize: 36,
    lineHeight: 1.05,
    margin: 0,
    marginBottom: 6,
    color: COLORS.ink,
  }
  const sub: CSSProperties = {
    ...sansStyle,
    fontSize: 14,
    color: COLORS.inkSoft,
    margin: 0,
  }
  const counter: CSSProperties = {
    ...sansStyle,
    fontSize: 12,
    color: COLORS.inkSoft,
    marginTop: 12,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }
  const tagsWrap: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  }
  const ctaWrap: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    padding: '16px 22px calc(env(safe-area-inset-bottom, 0px) + 16px)',
    background: 'rgba(245,239,230,0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }
  const isActive = picked.length > 0
  const ctaBtn: CSSProperties = {
    ...sansStyle,
    width: '100%',
    height: 56,
    borderRadius: 99,
    fontSize: 15,
    fontWeight: 700,
    background: isActive ? COLORS.tomato : 'rgba(26,22,18,0.12)',
    color: isActive ? COLORS.cream : 'rgba(26,22,18,0.35)',
    border: 'none',
    cursor: isActive ? 'pointer' : 'default',
    transition: 'all 200ms ease',
  }

  return (
    <div style={root}>
      <Grain opacity={0.3} />

      <div style={header}>
        <div style={headerInner}>
          <button
            style={backBtn}
            aria-label="Назад"
            onClick={() => {
              haptic('light')
              navigate('/onboarding/quiz2')
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke={COLORS.ink}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div style={progressTrack}>
          <div style={progressFill} />
        </div>
      </div>

      <div style={content}>
        <h1 style={title}>чем вы увлекаетесь?</h1>
        <p style={sub}>выберите до {MAX_PICK}</p>
        <div style={counter}>
          {picked.length} / {MAX_PICK}
        </div>

        <div style={tagsWrap}>
          {HOBBIES.map(({ emoji, label }) => {
            const selected = picked.includes(label)
            const disabled = !selected && picked.length >= MAX_PICK
            const tagStyle: CSSProperties = {
              ...sansStyle,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 500,
              background: selected ? COLORS.ink : '#fff',
              color: selected ? COLORS.cream : COLORS.ink,
              border: selected
                ? '1.5px solid transparent'
                : '1.5px solid rgba(26,22,18,0.10)',
              transition: 'all 200ms ease',
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }
            return (
              <button
                key={label}
                style={tagStyle}
                onClick={() => {
                  if (disabled) return
                  toggle(label)
                }}
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={ctaWrap}>
        <button style={ctaBtn} onClick={next} disabled={!isActive}>
          {isActive ? 'дальше →' : 'выберите хотя бы одно'}
        </button>
      </div>
    </div>
  )
}
