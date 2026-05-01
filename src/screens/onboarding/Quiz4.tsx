import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

interface OptionDef {
  id: string
  title: string
  hint: string
  icon: (color: string) => JSX.Element
}

function BookIcon(color: string) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M5 5h7c1.7 0 3 1.3 3 3v15c0-1.7-1.3-3-3-3H5V5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M23 5h-7c-1.7 0-3 1.3-3 3v15c0-1.7 1.3-3 3-3h7V5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon(color: string) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" stroke={color} strokeWidth="1.6" />
      <path
        d="M14 3v3M14 22v3M3 14h3M22 14h3M6 6l2 2M20 20l2 2M6 22l2-2M20 8l2-2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

const OPTIONS: OptionDef[] = [
  {
    id: 'deep',
    title: 'глубокий разговор',
    hint: 'темы, которые задевают и остаются после.',
    icon: (color) => BookIcon(color),
  },
  {
    id: 'easy',
    title: 'лёгкая атмосфера',
    hint: 'без напряжения, просто приятно и тепло.',
    icon: (color) => SunIcon(color),
  },
]

export function Quiz4() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string>('deep')

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflow: 'hidden',
  }
  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    padding: '78px 22px 28px',
    display: 'flex',
    flexDirection: 'column',
  }
  const progressWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  }
  const dotsWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }
  const stepLabel: CSSProperties = {
    ...sansStyle,
    fontSize: 12,
    color: COLORS.inkSoft,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }
  const heading: CSSProperties = {
    fontSize: 38,
    lineHeight: 1.05,
    margin: '6px 0 22px',
    color: COLORS.ink,
  }
  const optList: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flex: 1,
  }
  const cardBase = (isSelected: boolean): CSSProperties => ({
    position: 'relative',
    borderRadius: 22,
    padding: '20px 22px',
    transition: 'transform 220ms ease, background 220ms ease',
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    background: isSelected ? COLORS.ink : '#ffffff',
    color: isSelected ? COLORS.cream : COLORS.ink,
    border: isSelected ? '1px solid transparent' : '1px solid rgba(26,22,18,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    textAlign: 'left',
    width: '100%',
  })
  const cardTitle: CSSProperties = {
    ...serifStyle,
    fontSize: 26,
    lineHeight: 1.05,
    margin: 0,
  }
  const cardHint = (isSelected: boolean): CSSProperties => ({
    ...sansStyle,
    fontSize: 14,
    color: isSelected ? 'rgba(245,239,230,0.78)' : COLORS.inkSoft,
    margin: 0,
  })
  const iconBubble = (isSelected: boolean): CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: isSelected ? 'rgba(245,239,230,0.16)' : COLORS.cream2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  })
  const cardRow: CSSProperties = {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  }
  const bottomRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 18,
  }
  const backBtn: CSSProperties = {
    ...sansStyle,
    color: COLORS.inkSoft,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.01em',
  }
  const nextBtn: CSSProperties = {
    ...sansStyle,
    background: COLORS.tomato,
    color: COLORS.cream,
    padding: '16px 22px',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  function pick(id: string) {
    haptic('light')
    setPicked(id)
  }

  function next() {
    haptic('light')
    navigate('/onboarding/quiz5')
  }

  function back() {
    haptic('light')
    navigate('/onboarding/quiz1')
  }

  return (
    <div style={root}>
      <Grain opacity={0.5} />
      <div style={content}>
        <div style={progressWrap}>
          <span style={dotsWrap}>
            {[0, 1].map((i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: COLORS.tomato,
                }}
              />
            ))}
            <span
              style={{
                width: 22,
                height: 8,
                borderRadius: 4,
                background: COLORS.tomato,
              }}
            />
            {[0, 1].map((i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(26,22,18,0.2)',
                }}
              />
            ))}
          </span>
          <span style={stepLabel}>3 из 5</span>
        </div>

        <h2 style={heading}>
          <span style={serifStyle}>что важно </span>
          <span style={{ ...sansStyle, fontWeight: 700 }}>за ужином?</span>
        </h2>

        <div style={optList}>
          {OPTIONS.map((opt) => {
            const isSelected = picked === opt.id
            const iconColor = isSelected ? COLORS.cream : COLORS.ink
            return (
              <button
                key={opt.id}
                style={cardBase(isSelected)}
                onClick={() => pick(opt.id)}
              >
                <div style={cardRow}>
                  <div style={iconBubble(isSelected)}>{opt.icon(iconColor)}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={cardTitle}>{opt.title}</h3>
                    <p style={cardHint(isSelected)}>{opt.hint}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={bottomRow}>
          <button style={backBtn} onClick={back}>
            ← назад
          </button>
          <button style={nextBtn} onClick={next}>
            дальше
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke={COLORS.cream}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
