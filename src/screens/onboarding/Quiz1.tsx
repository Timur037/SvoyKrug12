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
  vibe: string
  icon: (isSelected: boolean) => JSX.Element
}

function GlassIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M8 4h12l-1.4 9c-.5 3-2.7 5-4.6 5s-4.1-2-4.6-5L8 4Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 18v6M10 24h8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BenchIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M3 13h22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 13v9M23 13v9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 16h22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 4l3 9M20 4l-3 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CupIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M7 10h14v8a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5v-8Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21 12h2a2 2 0 0 1 0 4h-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 7c0-2 2-2 2-4M15 7c0-2 2-2 2-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BrunchIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="15" r="7" stroke={color} strokeWidth="1.6" />
      <path d="M7 15h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 9.5C10 8 11 6 14 6s4 2 4 3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 24h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 22v2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DiceIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="4" width="20" height="20" rx="4" stroke={color} strokeWidth="1.6" />
      <circle cx="9.5" cy="9.5" r="1.5" fill={color} />
      <circle cx="18.5" cy="9.5" r="1.5" fill={color} />
      <circle cx="14" cy="14" r="1.5" fill={color} />
      <circle cx="9.5" cy="18.5" r="1.5" fill={color} />
      <circle cx="18.5" cy="18.5" r="1.5" fill={color} />
    </svg>
  )
}

const OPTIONS: OptionDef[] = [
  {
    id: 'dinner',
    title: 'долгий ужин',
    hint: 'разговоры до полуночи, бокал, медленно.',
    vibe: '— оживлённо, тепло.',
    icon: (s) => <GlassIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'walk',
    title: 'прогулка в парке',
    hint: 'пешком, без шума, с глубокими темами.',
    vibe: '— спокойно, неспешно.',
    icon: (s) => <BenchIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'coffee',
    title: 'утренний кофе',
    hint: 'неспешно, за чашкой, пока город просыпается.',
    vibe: '— тихо, светло.',
    icon: (s) => <CupIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'brunch',
    title: 'бранч',
    hint: 'воскресенье, 11:00, никуда не торопиться.',
    vibe: '— расслабленно, вкусно.',
    icon: (s) => <BrunchIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'games',
    title: 'настолки',
    hint: 'игра снимает неловкость — разговор начинается сам.',
    vibe: '— весело, живо.',
    icon: (s) => <DiceIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
]

export function Quiz1() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string>('dinner')

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
    gap: 10,
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: 4,
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
  const vibeChip: CSSProperties = {
    ...serifStyle,
    color: COLORS.honey,
    fontSize: 18,
    marginTop: 4,
  }
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
  const skipBtn: CSSProperties = {
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
    navigate('/onboarding/quiz4')
  }

  return (
    <div style={root}>
      <Grain opacity={0.5} />
      <div style={content}>
        <div style={progressWrap}>
          <span style={dotsWrap}>
            <span
              style={{
                width: 22,
                height: 8,
                borderRadius: 4,
                background: COLORS.tomato,
              }}
            />
            {[0, 1, 2, 3].map((i) => (
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
          <span style={stepLabel}>1 из 5</span>
        </div>

        <h2 style={heading}>
          <span style={serifStyle}>что для вас </span>
          <span style={{ ...sansStyle, fontWeight: 700 }}>идеальный вечер?</span>
        </h2>

        <div style={optList}>
          {OPTIONS.map((opt) => {
            const isSelected = picked === opt.id
            return (
              <button
                key={opt.id}
                style={cardBase(isSelected)}
                onClick={() => pick(opt.id)}
              >
                <div style={cardRow}>
                  <div style={iconBubble(isSelected)}>{opt.icon(isSelected)}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={cardTitle}>{opt.title}</h3>
                    <p style={cardHint(isSelected)}>{opt.hint}</p>
                    {isSelected && opt.vibe && (
                      <span style={vibeChip}>{opt.vibe}</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={bottomRow}>
          <button style={skipBtn} onClick={next}>
            пропустить
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
