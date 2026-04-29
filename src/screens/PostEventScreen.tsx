import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import { fetchBooking, saveMoodToBooking } from '../lib/db'

interface Mood {
  id: string
  emoji: string
  label: string
}

const MOODS: Mood[] = [
  { id: 'calm',      emoji: '😌', label: 'спокойно' },
  { id: 'lively',   emoji: '🔥', label: 'оживлённо' },
  { id: 'celebrate', emoji: '🥂', label: 'праздник' },
  { id: 'cosy',     emoji: '🌙', label: 'уютно' },
  { id: 'special',  emoji: '✨', label: 'особенный' },
]

export function PostEventScreen() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [moodId, setMoodId] = useState<string>('cosy')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const meetupId = (() => {
    try { return localStorage.getItem('svoy_krug_review_meetup') } catch { return null }
  })()

  useEffect(() => {
    if (!user || !meetupId) return
    fetchBooking(user.id, meetupId)
      .then(setBookingId)
      .catch(console.error)
  }, [user, meetupId])

  async function handleSave() {
    haptic('medium')
    if (bookingId && !saving) {
      setSaving(true)
      try {
        await saveMoodToBooking(bookingId, MOODS.find((m) => m.id === moodId)?.label ?? moodId)
        setSaved(true)
      } catch (err) {
        console.error(err)
      } finally {
        setSaving(false)
      }
    }
    navigate('/home')
  }

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
    height: 260,
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

        <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.tomato, textTransform: 'uppercase' }}>
          воспоминание · вчера
        </div>

        <h1 style={{ ...serifStyle, margin: '14px 0 0', fontSize: 44, lineHeight: 1.0, letterSpacing: '-0.02em', color: COLORS.ink }}>
          тот вечер.
        </h1>

        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 14, lineHeight: 1.5, maxWidth: 320 }}>
          один штрих — и круг закроется. это влияет на следующий вечер.
        </p>

        {/* Mood picker */}
        <div style={{ marginTop: 36 }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 14 }}>
            настроение вечера
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {MOODS.map((m) => {
              const active = moodId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => { haptic('light'); setMoodId(m.id) }}
                  aria-label={m.label}
                  aria-pressed={active}
                  style={{
                    flex: '1 1 60px',
                    minWidth: 60,
                    padding: '14px 6px 10px',
                    borderRadius: 18,
                    background: active ? '#fff' : 'rgba(255,255,255,0.55)',
                    border: active ? `2px solid ${COLORS.tomato}` : '2px solid rgba(26,22,18,0.06)',
                    boxShadow: active ? '0 10px 24px rgba(232,71,44,0.18)' : '0 4px 10px rgba(26,22,18,0.04)',
                    transform: active ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms, border-color 220ms, background 220ms',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{m.emoji}</span>
                  <span style={{ ...sansStyle, fontSize: 10, fontWeight: 600, color: active ? COLORS.tomato : COLORS.inkSoft, letterSpacing: '-0.01em' }}>
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Memory quote */}
        <div style={{
          marginTop: 40,
          padding: '20px 22px',
          borderRadius: 20,
          background: COLORS.cream2,
          border: '1px solid rgba(26,22,18,0.06)',
        }}>
          <div style={{ ...serifStyle, fontSize: 22, color: COLORS.ink, lineHeight: 1.25 }}>
            этот вечер останется<br/>с вами.
          </div>
          <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
            следующий круг соберётся через неделю.
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={saving}
          style={{
            marginTop: 32,
            width: '100%',
            background: saved ? COLORS.forest : COLORS.tomato,
            color: COLORS.cream,
            border: 'none',
            padding: '18px',
            borderRadius: 99,
            ...sansStyle,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: saved ? '0 12px 28px rgba(45,74,62,0.30)' : '0 12px 28px rgba(232,71,44,0.35)',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'background 300ms ease, box-shadow 300ms ease',
          }}
          onClick={handleSave}
        >
          {saving ? '...' : saved ? 'сохранено ✓' : 'сохранить и вернуться →'}
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
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => { haptic('light'); navigate('/calendar') }}
        >
          закрыть без сохранения
        </button>
      </div>
    </div>
  )
}
