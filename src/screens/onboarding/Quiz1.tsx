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
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
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
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <path d="M3 13h22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 13v9M23 13v9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 16h22" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 4l3 9M20 4l-3 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CupIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <path d="M7 10h14v8a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5v-8Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21 12h2a2 2 0 0 1 0 4h-2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 7c0-2 2-2 2-4M15 7c0-2 2-2 2-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BrunchIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
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
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
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
    vibe: 'оживлённо · тепло',
    icon: (s) => <GlassIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'walk',
    title: 'прогулка в парке',
    hint: 'пешком, без шума, с глубокими темами.',
    vibe: 'спокойно · неспешно',
    icon: (s) => <BenchIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'coffee',
    title: 'утренний кофе',
    hint: 'неспешно, за чашкой, пока город просыпается.',
    vibe: 'тихо · светло',
    icon: (s) => <CupIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'brunch',
    title: 'бранч',
    hint: 'воскресенье, 11:00, никуда не торопиться.',
    vibe: 'расслабленно · вкусно',
    icon: (s) => <BrunchIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
  {
    id: 'games',
    title: 'настолки',
    hint: 'игра снимает неловкость — разговор начинается сам.',
    vibe: 'весело · живо',
    icon: (s) => <DiceIcon color={s ? COLORS.cream : COLORS.ink} />,
  },
]

const TOTAL_STEPS = 5
const CURRENT_STEP = 1

export function Quiz1() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string>('dinner')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  function pick(id: string) {
    haptic('light')
    setPicked(id)
  }

  function next() {
    haptic('light')
    navigate('/onboarding/quiz4')
  }

  // ── layout ──────────────────────────────────────────────
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
    padding: '60px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
  }

  // ── progress ─────────────────────────────────────────────
  const progressWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 26,
  }
  const segmentsRow: CSSProperties = {
    display: 'flex',
    flex: 1,
    gap: 4,
    alignItems: 'center',
  }
  const stepLabel: CSSProperties = {
    ...sansStyle,
    fontSize: 11,
    color: COLORS.inkSoft,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    flexShrink: 0,
  }

  // ── heading ───────────────────────────────────────────────
  const headingBlock: CSSProperties = { marginBottom: 18 }
  const heading: CSSProperties = {
    fontSize: 38,
    lineHeight: 1.06,
    margin: '0 0 7px',
    color: COLORS.ink,
  }
  const subtitle: CSSProperties = {
    ...sansStyle,
    fontSize: 13,
    color: COLORS.inkSoft,
    margin: 0,
    letterSpacing: '-0.01em',
  }

  // ── option list ───────────────────────────────────────────
  const optList: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    paddingBottom: 4,
  }

  // ── card ─────────────────────────────────────────────────
  function cardStyle(isSelected: boolean, isHovered: boolean): CSSProperties {
    return {
      position: 'relative',
      borderRadius: 20,
      padding: '15px 16px',
      transition: 'transform 200ms ease, box-shadow 200ms ease, background 220ms ease, border-color 220ms ease',
      transform: isSelected ? 'scale(1.013)' : isHovered ? 'scale(1.005)' : 'scale(1)',
      background: isSelected ? COLORS.ink : '#ffffff',
      color: isSelected ? COLORS.cream : COLORS.ink,
      border: isSelected
        ? '1.5px solid rgba(26,22,18,0.0)'
        : '1.5px solid rgba(26,22,18,0.07)',
      boxShadow: isSelected
        ? '0 8px 30px rgba(26,22,18,0.20), 0 2px 8px rgba(26,22,18,0.10)'
        : isHovered
        ? '0 4px 14px rgba(26,22,18,0.07)'
        : '0 1px 3px rgba(26,22,18,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      textAlign: 'left',
      width: '100%',
      cursor: 'pointer',
    }
  }

  function iconBubble(isSelected: boolean): CSSProperties {
    return {
      width: 50,
      height: 50,
      borderRadius: '50%',
      background: isSelected ? 'rgba(245,239,230,0.11)' : COLORS.cream2,
      border: isSelected ? '1px solid rgba(245,239,230,0.16)' : '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }
  }

  const cardTitle: CSSProperties = {
    ...serifStyle,
    fontSize: 22,
    lineHeight: 1.1,
    margin: '0 0 3px',
  }

  function cardHint(isSelected: boolean): CSSProperties {
    return {
      ...sansStyle,
      fontSize: 12,
      lineHeight: 1.45,
      color: isSelected ? 'rgba(245,239,230,0.62)' : COLORS.inkSoft,
      margin: 0,
    }
  }

  function vibeTag(): CSSProperties {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      marginTop: 7,
      padding: '3px 9px',
      borderRadius: 999,
      background: 'rgba(244,201,93,0.14)',
      border: '1px solid rgba(244,201,93,0.32)',
      ...sansStyle,
      fontSize: 11,
      fontWeight: 500,
      color: COLORS.honey,
      letterSpacing: '0.01em',
    }
  }

  const checkCircle: CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: COLORS.tomato,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
  }

  // ── bottom ────────────────────────────────────────────────
  const bottomRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
  }
  const skipBtn: CSSProperties = {
    ...sansStyle,
    color: COLORS.inkSoft,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    padding: '8px 4px',
  }
  const nextBtn: CSSProperties = {
    ...sansStyle,
    background: COLORS.tomato,
    color: COLORS.cream,
    padding: '14px 26px',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 6px 20px rgba(232,71,44,0.30), 0 2px 6px rgba(232,71,44,0.16)',
  }

  return (
    <div style={root}>
      <Grain opacity={0.45} />
      <div style={content}>

        {/* ── Progress ── */}
        <div style={progressWrap}>
          <div style={segmentsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                style={{
                  height: 3,
                  flex: 1,
                  borderRadius: 2,
                  background: i < CURRENT_STEP ? COLORS.tomato : 'rgba(26,22,18,0.13)',
                  transition: 'background 300ms ease',
                }}
              />
            ))}
          </div>
          <span style={stepLabel}>{CURRENT_STEP} / {TOTAL_STEPS}</span>
        </div>

        {/* ── Heading ── */}
        <div style={headingBlock}>
          <h2 style={heading}>
            <span style={serifStyle}>что для вас </span>
            <span style={{ ...sansStyle, fontWeight: 700 }}>идеальный вечер?</span>
          </h2>
          <p style={subtitle}>выберите то, что вам ближе всего</p>
        </div>

        {/* ── Options ── */}
        <div style={optList}>
          {OPTIONS.map((opt) => {
            const isSelected = picked === opt.id
            const isHovered = hoveredId === opt.id
            return (
              <button
                key={opt.id}
                style={cardStyle(isSelected, isHovered)}
                onClick={() => pick(opt.id)}
                onMouseEnter={() => setHoveredId(opt.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={iconBubble(isSelected)}>
                  {opt.icon(isSelected)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={cardTitle}>{opt.title}</p>
                  <p style={cardHint(isSelected)}>{opt.hint}</p>
                  {isSelected && opt.vibe && (
                    <span style={vibeTag()}>{opt.vibe}</span>
                  )}
                </div>

                {isSelected && (
                  <div style={checkCircle}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.2 2.2L8 3"
                        stroke={COLORS.cream}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Bottom ── */}
        <div style={bottomRow}>
          <button style={skipBtn} onClick={next}>
            пропустить
          </button>
          <button style={nextBtn} onClick={next}>
            дальше
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke={COLORS.cream}
                strokeWidth="2"
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
