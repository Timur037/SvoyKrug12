import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'

interface PersonTile {
  id: string
  label: string
  color: string
  fg: string
  border?: boolean
  you?: boolean
}

const PEOPLE: PersonTile[] = [
  { id: 'a', label: 'редактор, 28', color: COLORS.cream2, fg: COLORS.ink },
  { id: 'b', label: 'переехала',     color: COLORS.tomato, fg: COLORS.cream },
  { id: 'c', label: 'ходит в горы',  color: '#fff',        fg: COLORS.ink,   border: true },
  { id: 'd', label: 'историк, 31',   color: COLORS.cream2, fg: COLORS.ink },
  { id: 'e', label: 'пишет тихо',    color: COLORS.ink,    fg: COLORS.cream },
  { id: 'f', label: 'вы',            color: COLORS.tomato, fg: COLORS.cream, you: true },
]

const MOODS = ['тихо', 'тепло', 'хочу ещё'] as const

export function PostEventScreen() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<number>(1)
  const [thanked, setThanked] = useState<Set<string>>(new Set())

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
  }

  const sunrise: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    background:
      'radial-gradient(ellipse at 50% -20%, rgba(244,201,93,0.55) 0%, rgba(244,201,93,0.18) 40%, rgba(245,239,230,0) 75%)',
    pointerEvents: 'none',
    zIndex: 1,
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 60,
    left: 22,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(26,22,18,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.ink,
    zIndex: 10,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }

  function toggleThanks(id: string) {
    haptic('light')
    setThanked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={root}>
      <Grain opacity={0.28} />
      <div style={sunrise} />

      <button style={back} onClick={() => { haptic('light'); navigate('/calendar') }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ position: 'relative', zIndex: 5, padding: '120px 24px 60px' }}>

        <div style={{
          ...sansStyle,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: COLORS.tomato,
          textTransform: 'uppercase',
        }}>
          вечер · вчера
        </div>

        <h1 style={{ margin: '12px 0 0', fontSize: 44, lineHeight: 1.0, letterSpacing: '-0.02em', color: COLORS.ink }}>
          <span style={serifStyle}>как было?</span>
        </h1>

        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 12, lineHeight: 1.5, maxWidth: 320 }}>
          один штрих — и вечер закроется. это влияет на следующий круг.
        </p>

        {/* Mood slider */}
        <div style={{ marginTop: 36 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            ...sansStyle,
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.inkSoft,
            marginBottom: 10,
            padding: '0 4px',
          }}>
            {MOODS.map((m, i) => (
              <span
                key={m}
                style={{
                  color: mood === i ? COLORS.tomato : COLORS.inkSoft,
                  transition: 'color 200ms',
                }}
              >
                {m}
              </span>
            ))}
          </div>

          <div style={{
            position: 'relative',
            height: 44,
            background: '#fff',
            borderRadius: 999,
            border: '1px solid rgba(26,22,18,0.06)',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
          }}>
            {MOODS.map((_, i) => (
              <button
                key={i}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 999,
                  background: mood === i ? COLORS.tomato : 'transparent',
                  color: mood === i ? COLORS.cream : COLORS.inkSoft,
                  ...sansStyle,
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 220ms ease',
                }}
                onClick={() => { haptic('light'); setMood(i) }}
                aria-label={MOODS[i]}
              >
                {mood === i ? MOODS[i] : '·'}
              </button>
            ))}
          </div>
        </div>

        {/* People to thank */}
        <div style={{ marginTop: 36 }}>
          <div style={{
            ...sansStyle,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: COLORS.inkSoft,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            кому скажете спасибо
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {PEOPLE.map((p) => {
              const active = thanked.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => toggleThanks(p.id)}
                  disabled={p.you}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 18,
                    background: p.color,
                    color: p.fg,
                    border: p.border ? '1px solid rgba(26,22,18,0.12)' : 'none',
                    padding: 10,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    ...sansStyle,
                    fontSize: 11,
                    fontWeight: 600,
                    boxShadow: active
                      ? `inset 0 0 0 3px ${COLORS.tomato}, 0 6px 14px rgba(232,71,44,0.25)`
                      : '0 4px 10px rgba(26,22,18,0.08)',
                    transition: 'box-shadow 220ms, transform 220ms',
                    transform: active ? 'scale(0.98)' : 'scale(1)',
                    opacity: p.you ? 0.65 : 1,
                    position: 'relative',
                  }}
                >
                  <span>{p.label}</span>
                  {active && !p.you && (
                    <span style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: COLORS.tomato,
                      color: COLORS.cream,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke={COLORS.cream} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          style={{
            marginTop: 40,
            width: '100%',
            background: COLORS.ink,
            color: COLORS.cream,
            border: 'none',
            padding: '18px',
            borderRadius: 99,
            ...sansStyle,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: '0 12px 28px rgba(26,22,18,0.18)',
          }}
          onClick={() => { haptic('medium'); navigate('/home') }}
        >
          в следующую пятницу →
        </button>

        <button
          style={{
            marginTop: 14,
            width: '100%',
            background: 'transparent',
            color: COLORS.inkSoft,
            ...sansStyle,
            fontSize: 13,
            fontWeight: 500,
            padding: '10px',
          }}
          onClick={() => { haptic('light'); navigate('/calendar') }}
        >
          закрыть и вернуться
        </button>
      </div>
    </div>
  )
}
