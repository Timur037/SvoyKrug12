import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import {
  fetchBooking,
  fetchMeetupParticipants,
  saveMoodToBooking,
  saveVenueRating,
  saveMatchRequests,
  findMutualMatches,
  type DbParticipant,
} from '../lib/db'

// ── Types ──────────────────────────────────────────────────────────
type Step = 'mood' | 'people' | 'result'

interface Mood { id: string; emoji: string; label: string }

const MOODS: Mood[] = [
  { id: 'calm',      emoji: '😌', label: 'спокойно'  },
  { id: 'lively',   emoji: '🔥', label: 'оживлённо' },
  { id: 'celebrate', emoji: '🥂', label: 'праздник'  },
  { id: 'cosy',     emoji: '🌙', label: 'уютно'      },
  { id: 'special',  emoji: '✨', label: 'особенный'  },
]

const AVATAR_COLORS = [
  { bg: '#E8472C', fg: '#F5EFE6' },
  { bg: '#2D6647', fg: '#F5EFE6' },
  { bg: '#C49820', fg: '#1A1612' },
  { bg: '#764E96', fg: '#F5EFE6' },
  { bg: '#3264C3', fg: '#F5EFE6' },
]

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2
    ? ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function openTelegramUser(telegramId: number) {
  const url = `tg://user?id=${telegramId}`
  if (window.Telegram?.WebApp?.openLink) {
    window.Telegram.WebApp.openLink(url)
  } else {
    window.open(url)
  }
}

// ── Main component ─────────────────────────────────────────────────
export function PostEventScreen() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [step, setStep]                     = useState<Step>('mood')
  const [moodId, setMoodId]                 = useState<string>('cosy')
  const [venueRating, setVenueRating]       = useState<number>(0)
  const [selected, setSelected]             = useState<Set<string>>(new Set())
  const [participants, setParticipants]     = useState<DbParticipant[]>([])
  const [mutualMatches, setMutualMatches]   = useState<DbParticipant[]>([])
  const [bookingId, setBookingId]           = useState<string | null>(null)
  const [saving, setSaving]                 = useState(false)

  const meetupId = (() => {
    try { return localStorage.getItem('svoy_krug_review_meetup') } catch { return null }
  })()

  useEffect(() => {
    if (!user || !meetupId) return
    fetchBooking(user.id, meetupId).then(setBookingId).catch(console.error)
    fetchMeetupParticipants(meetupId)
      .then((all) => setParticipants(all.filter((p) => p.id !== user.id)))
      .catch(console.error)
  }, [user, meetupId])

  function togglePerson(id: string) {
    haptic('light')
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleFinish() {
    if (saving) return
    haptic('medium')
    setSaving(true)
    try {
      if (bookingId) {
        const moodLabel = MOODS.find((m) => m.id === moodId)?.label ?? moodId
        await saveMoodToBooking(bookingId, moodLabel)
        if (venueRating > 0) await saveVenueRating(bookingId, venueRating)
      }
      if (user && meetupId && selected.size > 0) {
        await saveMatchRequests(user.id, [...selected], meetupId)
        const mutual = await findMutualMatches(user.id, meetupId)
        setMutualMatches(mutual)
      }
      setStep('result')
    } catch (err) {
      console.error(err)
      setStep('result')
    } finally {
      setSaving(false)
    }
  }

  const sunrise: CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, height: 280,
    background: 'radial-gradient(ellipse at 50% -20%, rgba(244,201,93,0.50) 0%, rgba(244,201,93,0.15) 42%, transparent 75%)',
    pointerEvents: 'none', zIndex: 1,
  }

  if (step === 'mood') return <MoodStep moodId={moodId} setMoodId={setMoodId} onNext={() => setStep('people')} sunrise={sunrise} />
  if (step === 'people') return (
    <PeopleStep
      participants={participants}
      selected={selected}
      onToggle={togglePerson}
      venueRating={venueRating}
      setVenueRating={setVenueRating}
      saving={saving}
      onFinish={handleFinish}
      sunrise={sunrise}
    />
  )
  return <ResultStep mutualMatches={mutualMatches} onHome={() => navigate('/home')} />
}

// ── Step 1: Mood ───────────────────────────────────────────────────
function MoodStep({ moodId, setMoodId, onNext, sunrise }: {
  moodId: string
  setMoodId: (id: string) => void
  onNext: () => void
  sunrise: CSSProperties
}) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.cream, color: COLORS.ink, overflowX: 'hidden' }}>
      <Grain opacity={0.28} />
      <div style={sunrise} />

      <div style={{ position: 'relative', zIndex: 5, padding: '100px 24px 60px' }}>
        <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.tomato, textTransform: 'uppercase' }}>
          тот вечер
        </div>
        <h1 style={{ ...serifStyle, margin: '12px 0 0', fontSize: 44, lineHeight: 1.0, letterSpacing: '-0.02em' }}>
          каким он был?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 12, lineHeight: 1.55 }}>
          один штрих — и круг закроется.
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 28, marginBottom: 40 }}>
          {['mood', 'people'].map((s, i) => (
            <div key={s} style={{ height: 3, borderRadius: 99, flex: 1, background: i === 0 ? COLORS.tomato : 'rgba(26,22,18,0.12)' }} />
          ))}
        </div>

        {/* Mood tiles */}
        <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 14 }}>
          настроение вечера
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {MOODS.map((m) => {
            const active = moodId === m.id
            return (
              <button
                key={m.id}
                onClick={() => { haptic('light'); setMoodId(m.id) }}
                style={{
                  flex: '1 1 60px', minWidth: 60,
                  padding: '14px 6px 10px', borderRadius: 18,
                  background: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  border: `2px solid ${active ? COLORS.tomato : 'rgba(26,22,18,0.06)'}`,
                  boxShadow: active ? '0 10px 24px rgba(232,71,44,0.18)' : '0 4px 10px rgba(26,22,18,0.04)',
                  transform: active ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 26 }}>{m.emoji}</span>
                <span style={{ ...sansStyle, fontSize: 10, fontWeight: 600, color: active ? COLORS.tomato : COLORS.inkSoft }}>
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onNext}
          style={{
            marginTop: 40, width: '100%',
            background: COLORS.tomato, color: COLORS.cream,
            border: 'none', padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: '0 12px 28px rgba(232,71,44,0.32)', cursor: 'pointer',
          }}
        >
          дальше →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: People + venue rating ─────────────────────────────────
function PeopleStep({ participants, selected, onToggle, venueRating, setVenueRating, saving, onFinish, sunrise }: {
  participants: DbParticipant[]
  selected: Set<string>
  onToggle: (id: string) => void
  venueRating: number
  setVenueRating: (r: number) => void
  saving: boolean
  onFinish: () => void
  sunrise: CSSProperties
}) {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.cream, color: COLORS.ink, overflowX: 'hidden' }}>
      <Grain opacity={0.28} />
      <div style={sunrise} />

      <div style={{ position: 'relative', zIndex: 5, padding: '100px 24px 80px' }}>
        <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.tomato, textTransform: 'uppercase' }}>
          люди за столом
        </div>
        <h1 style={{ ...serifStyle, margin: '12px 0 0', fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          кого хотите<br/>встретить снова?
        </h1>
        <p style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
          если взаимно — пришлём уведомление.
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 24, marginBottom: 32 }}>
          {['mood', 'people'].map((_, i) => (
            <div key={i} style={{ height: 3, borderRadius: 99, flex: 1, background: COLORS.tomato }} />
          ))}
        </div>

        {/* Participant cards */}
        {participants.length === 0 ? (
          <div style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', padding: '32px 0' }}>
            список участников пока загружается
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {participants.map((p, i) => {
              const palette = AVATAR_COLORS[i % AVATAR_COLORS.length]!
              const isSelected = selected.has(p.id)
              const firstName = p.name.split(' ')[0] ?? p.name
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: RADII.xl,
                    background: isSelected ? 'rgba(232,71,44,0.06)' : '#fff',
                    border: `1.5px solid ${isSelected ? 'rgba(232,71,44,0.22)' : 'rgba(26,22,18,0.07)'}`,
                    transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ ...sansStyle, fontSize: 14, fontWeight: 700, color: palette.fg }}>
                      {getInitials(p.name)}
                    </span>
                  </div>

                  {/* Name + age */}
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sansStyle, fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{firstName}</div>
                    {p.age && (
                      <div style={{ ...sansStyle, fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{p.age} лет</div>
                    )}
                  </div>

                  {/* Heart toggle */}
                  <button
                    onClick={() => onToggle(p.id)}
                    style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: isSelected ? COLORS.tomato : 'rgba(26,22,18,0.05)',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    aria-pressed={isSelected}
                    aria-label={`Хочу снова встретить ${firstName}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isSelected ? '#fff' : 'none'}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke={isSelected ? '#fff' : COLORS.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Venue rating */}
        <div style={{ marginTop: 36 }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 14 }}>
            оцените место
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => { haptic('light'); setVenueRating(star) }}
                style={{
                  flex: 1, padding: '14px 0', borderRadius: RADII.lg,
                  background: star <= venueRating ? 'rgba(196,152,32,0.12)' : 'rgba(26,22,18,0.04)',
                  border: `1.5px solid ${star <= venueRating ? 'rgba(196,152,32,0.35)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 180ms',
                  fontSize: 22, lineHeight: 1,
                }}
                aria-label={`${star} звезд`}
              >
                {star <= venueRating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={saving}
          onClick={onFinish}
          style={{
            marginTop: 36, width: '100%',
            background: saving ? COLORS.inkSoft : COLORS.tomato, color: COLORS.cream,
            border: 'none', padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: saving ? 'none' : '0 12px 28px rgba(232,71,44,0.32)',
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            transition: 'all 250ms',
          }}
        >
          {saving ? 'сохраняем...' : 'завершить вечер →'}
        </button>

        <button
          style={{ marginTop: 14, width: '100%', background: 'transparent', color: COLORS.inkSoft, ...sansStyle, fontSize: 13, fontWeight: 500, padding: '10px', border: 'none', cursor: 'pointer' }}
          onClick={() => { haptic('light'); navigate(-1) }}
        >
          назад
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Result ─────────────────────────────────────────────────
function ResultStep({ mutualMatches, onHome }: {
  mutualMatches: DbParticipant[]
  onHome: () => void
}) {
  const hasMutual = mutualMatches.length > 0

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.ink, color: COLORS.cream, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Grain opacity={0.35} />

      {/* Warm glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 320,
        background: hasMutual
          ? 'radial-gradient(ellipse at 50% 0%, rgba(244,201,93,0.40) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(232,71,44,0.22) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 28px 60px' }}>

        {/* Icon */}
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 24, textAlign: 'center' }}>
          {hasMutual ? '🎉' : '🌙'}
        </div>

        {/* Heading */}
        <h1 style={{ ...serifStyle, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.025em', textAlign: 'center', margin: 0 }}>
          {hasMutual ? 'взаимно!' : 'спасибо.'}
        </h1>

        <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.65)', marginTop: 14, lineHeight: 1.6, textAlign: 'center' }}>
          {hasMutual
            ? 'кто-то за этим столом тоже хочет встретиться снова.'
            : 'вечер сохранён. если кто-то выберет вас — пришлём уведомление.'}
        </p>

        {/* Mutual match cards */}
        {hasMutual && (
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mutualMatches.map((p, i) => {
              const palette = AVATAR_COLORS[i % AVATAR_COLORS.length]!
              const firstName = p.name.split(' ')[0] ?? p.name
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: RADII.xl,
                  background: 'rgba(244,201,93,0.10)',
                  border: '1.5px solid rgba(244,201,93,0.25)',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ ...sansStyle, fontSize: 14, fontWeight: 700, color: palette.fg }}>
                      {getInitials(p.name)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sansStyle, fontSize: 15, fontWeight: 600, color: COLORS.cream }}>{firstName}</div>
                    <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(244,201,93,0.80)', marginTop: 2 }}>тоже хочет встретиться ♥</div>
                  </div>
                  {p.telegram_id && (
                    <button
                      onClick={() => { haptic('medium'); openTelegramUser(p.telegram_id!) }}
                      style={{
                        flexShrink: 0, padding: '8px 14px', borderRadius: 99,
                        background: 'rgba(244,201,93,0.18)',
                        border: '1px solid rgba(244,201,93,0.35)',
                        color: COLORS.honey, ...sansStyle, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      написать →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Streak nudge */}
        <div style={{
          marginTop: 36, padding: '18px 20px', borderRadius: RADII.xl,
          background: 'rgba(245,239,230,0.06)', border: '1px solid rgba(245,239,230,0.10)',
          textAlign: 'center',
        }}>
          <div style={{ ...serifStyle, fontSize: 20, color: COLORS.cream, lineHeight: 1.2 }}>
            следующий круг<br/>собирается уже скоро.
          </div>
          <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.50)', marginTop: 8 }}>
            записывайтесь — пока есть места.
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onHome}
          style={{
            marginTop: 28, width: '100%',
            background: COLORS.tomato, color: COLORS.cream,
            border: 'none', padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: '0 12px 28px rgba(232,71,44,0.32)', cursor: 'pointer',
          }}
        >
          на главную →
        </button>
      </div>
    </div>
  )
}
