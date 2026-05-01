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

function CalendarIcon(color: string) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect
        x="4"
        y="6"
        width="20"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M4 11h20"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9 3v5M19 3v5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon(color: string) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M21 17.5A8 8 0 0 1 10.5 7a1 1 0 0 0-1.3-1.2 9.5 9.5 0 1 0 13 13 1 1 0 0 0-1.2-1.3Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M22 6l.6 1.4L24 8l-1.4.6L22 10l-.6-1.4L20 8l1.4-.6L22 6Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const OPTIONS: OptionDef[] = [
  {
    id: 'weekly',
    title: 'раз в неделю',
    hint: 'хочу видеть разных людей регулярно.',
    icon: (color) => CalendarIcon(color),
  },
  {
    id: 'monthly',
    title: 'раз в месяц',
    hint: 'редко, но ярко — каждый раз событие.',
    icon: (color) => MoonIcon(color),
  },
]

const QUIZ_STEP = 3
const QUIZ_TOTAL = 4

export function Quiz5() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string>('weekly')

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
    navigate('/onboarding/quiz2')
  }

  function back() {
    haptic('light')
    navigate('/onboarding/quiz4')
  }

  return (
    <div style={root}>
      <Grain opacity={0.5} />
      <div style={content}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(26,22,18,0.10)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(QUIZ_STEP / QUIZ_TOTAL) * 100}%`, background: COLORS.tomato, transition: 'width 400ms ease' }} />
          </div>
          <span style={{ ...sansStyle, fontSize: 11, color: COLORS.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
            {QUIZ_STEP} / {QUIZ_TOTAL}
          </span>
        </div>

        <h2 style={heading}>
          <span style={serifStyle}>как часто </span>
          <span style={{ ...sansStyle, fontWeight: 700 }}>хотите встречаться?</span>
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
