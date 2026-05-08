import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
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

type Step = 'mood' | 'people' | 'result'

interface Mood { id: string; emoji: string; label: string; sub: string }

const MOODS: Mood[] = [
  { id: 'cosy',    emoji: '🌙', label: 'уютно',     sub: 'тихо и тепло'       },
  { id: 'lively',  emoji: '🔥', label: 'оживлённо', sub: 'много смеялись'      },
  { id: 'special', emoji: '✨', label: 'особенный', sub: 'такое редко бывает'  },
  { id: 'calm',    emoji: '😌', label: 'спокойно',  sub: 'размеренно, глубоко' },
]

const AVATAR_COLORS = [
  { bg: COLORS.tomato,  fg: COLORS.cream },
  { bg: COLORS.forest,  fg: COLORS.cream },
  { bg: '#C49820',      fg: COLORS.ink   },
  { bg: '#764E96',      fg: COLORS.cream },
  { bg: '#3264C3',      fg: COLORS.cream },
]

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2
    ? ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function openTelegramUser(telegramId: number) {
  const url = `tg://user?id=${telegramId}`
  if (window.Telegram?.WebApp?.openLink) window.Telegram.WebApp.openLink(url)
  else window.open(url)
}

// ── Main ──────────────────────────────────────────────────────────────
export function PostEventScreen() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [step, setStep]               = useState<Step>('mood')
  const [moodId, setMoodId]           = useState<string>('cosy')
  const [venueRating, setVenueRating] = useState<number>(0)
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [participants, setParticipants]   = useState<DbParticipant[]>([])
  const [mutualMatches, setMutualMatches] = useState<DbParticipant[]>([])
  const [bookingId, setBookingId]     = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)

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

  function toggle(id: string) {
    haptic('light')
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function finish() {
    if (saving) return
    haptic('medium')
    setSaving(true)
    try {
      if (bookingId) {
        const label = MOODS.find((m) => m.id === moodId)?.label ?? moodId
        await saveMoodToBooking(bookingId, label)
        if (venueRating > 0) await saveVenueRating(bookingId, venueRating)
      }
      if (user && meetupId && selected.size > 0) {
        await saveMatchRequests(user.id, [...selected], meetupId)
        const mutual = await findMutualMatches(user.id, meetupId)
        setMutualMatches(mutual)
      }
      setStep('result')
    } catch {
      setStep('result')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'mood')
    return <MoodStep moodId={moodId} setMoodId={setMoodId} onNext={() => setStep('people')} />
  if (step === 'people')
    return <PeopleStep participants={participants} selected={selected} onToggle={toggle}
             venueRating={venueRating} setVenueRating={setVenueRating}
             saving={saving} onFinish={finish} />
  return <ResultStep mutualMatches={mutualMatches} onHome={() => navigate('/home')} />
}

// ── Step 1: Mood ──────────────────────────────────────────────────────
function MoodStep({ moodId, setMoodId, onNext }: {
  moodId: string; setMoodId: (id: string) => void; onNext: () => void
}) {
  const active = MOODS.find((m) => m.id === moodId)

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.cream, color: COLORS.ink, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes moodPop { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
      `}</style>
      <Grain opacity={0.28} />

      {/* Warm glow */}
      <div style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 380,
        background: 'radial-gradient(ellipse at center, rgba(244,201,93,0.45) 0%, rgba(232,71,44,0.10) 45%, transparent 72%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '64px 24px 40px' }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 40 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i === 0 ? COLORS.tomato : 'rgba(26,22,18,0.10)', transition: 'background 300ms' }} />
          ))}
        </div>

        {/* Headline */}
        <div style={{ animation: 'fadeUp 500ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.tomato, textTransform: 'uppercase', marginBottom: 10 }}>
            тот вечер
          </div>
          <h1 style={{ ...serifStyle, margin: '0 0 6px', fontSize: 48, lineHeight: 0.96, letterSpacing: '-0.025em' }}>
            каким он был?
          </h1>
          <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 12, lineHeight: 1.55 }}>
            один штрих — и круг закроется.
          </p>
        </div>

        {/* Mood grid */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {MOODS.map((m, i) => {
            const isActive = moodId === m.id
            return (
              <button
                key={m.id}
                onClick={() => { haptic('light'); setMoodId(m.id) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 18px', borderRadius: 20,
                  background: isActive ? COLORS.ink : '#fff',
                  border: `1.5px solid ${isActive ? 'transparent' : 'rgba(26,22,18,0.07)'}`,
                  boxShadow: isActive ? '0 8px 24px rgba(26,22,18,0.18)' : '0 2px 8px rgba(26,22,18,0.05)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
                  cursor: 'pointer', textAlign: 'left',
                  animation: `fadeUp 420ms cubic-bezier(0.22,1,0.36,1) ${i * 55}ms both`,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ ...sansStyle, fontSize: 15, fontWeight: 700, color: isActive ? COLORS.cream : COLORS.ink }}>
                    {m.label}
                  </div>
                  <div style={{ ...sansStyle, fontSize: 12, color: isActive ? 'rgba(245,239,230,0.55)' : COLORS.inkSoft, marginTop: 2 }}>
                    {m.sub}
                  </div>
                </div>
                {isActive && (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: COLORS.tomato, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.3 2.3L9 2.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected mood hint */}
        {active && (
          <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, textAlign: 'center', marginTop: 20, marginBottom: 8, animation: 'fadeUp 300ms ease both' }}>
            вы выбрали: <span style={{ color: COLORS.ink, fontWeight: 600 }}>{active.emoji} {active.label}</span>
          </div>
        )}

        <button
          onClick={onNext}
          style={{
            marginTop: 12, width: '100%',
            background: COLORS.tomato, color: COLORS.cream,
            border: 'none', padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: '0 12px 28px rgba(232,71,44,0.30)', cursor: 'pointer',
          }}
        >
          дальше →
        </button>
      </div>
    </div>
  )
}

// ── Step 2: People + stars ────────────────────────────────────────────
function PeopleStep({ participants, selected, onToggle, venueRating, setVenueRating, saving, onFinish }: {
  participants: DbParticipant[]
  selected: Set<string>
  onToggle: (id: string) => void
  venueRating: number
  setVenueRating: (r: number) => void
  saving: boolean
  onFinish: () => void
}) {
  const navigate = useNavigate()
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.ink, color: COLORS.cream, overflowX: 'hidden' }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <Grain opacity={0.32} />

      {/* Top honey glow */}
      <div style={{
        position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 440, height: 320,
        background: 'radial-gradient(ellipse at center, rgba(244,201,93,0.22) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2, padding: '64px 24px 100px' }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 36 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: COLORS.tomato }} />
          ))}
        </div>

        {/* Headline */}
        <div style={{ animation: 'fadeUp 460ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.honey, textTransform: 'uppercase', marginBottom: 10 }}>
            люди за столом
          </div>
          <h1 style={{ ...serifStyle, margin: '0 0 8px', fontSize: 42, lineHeight: 1.0, letterSpacing: '-0.025em' }}>
            кого хотите<br />увидеть снова?
          </h1>
          <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5 }}>
            если взаимно — пришлём уведомление.
          </p>
        </div>

        {/* Participant list */}
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {participants.length === 0 ? (
            <div style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.40)', textAlign: 'center', padding: '32px 0' }}>
              загружаем участников...
            </div>
          ) : participants.map((p, i) => {
            const pal = AVATAR_COLORS[i % AVATAR_COLORS.length]!
            const isSel = selected.has(p.id)
            const firstName = p.name.split(' ')[0] ?? p.name
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 20,
                  background: isSel ? 'rgba(232,71,44,0.14)' : 'rgba(245,239,230,0.06)',
                  border: `1.5px solid ${isSel ? 'rgba(232,71,44,0.40)' : 'rgba(245,239,230,0.10)'}`,
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  cursor: 'pointer', textAlign: 'left',
                  animation: `fadeUp 380ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms both`,
                  transform: isSel ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: pal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isSel ? '0 0 0 2px rgba(232,71,44,0.50)' : 'none',
                  transition: 'box-shadow 200ms',
                }}>
                  <span style={{ ...sansStyle, fontSize: 15, fontWeight: 700, color: pal.fg }}>{getInitials(p.name)}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ ...sansStyle, fontSize: 15, fontWeight: 600, color: COLORS.cream }}>{firstName}</div>
                  {p.age && (
                    <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.45)', marginTop: 2 }}>{p.age} лет</div>
                  )}
                </div>

                {/* Heart */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: isSel ? COLORS.tomato : 'rgba(245,239,230,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  transform: isSel ? 'scale(1.12)' : 'scale(1)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isSel ? '#fff' : 'none'}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke={isSel ? '#fff' : 'rgba(245,239,230,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        {/* Venue rating */}
        <div style={{ marginTop: 36 }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(245,239,230,0.45)', textTransform: 'uppercase', marginBottom: 18 }}>
            оцените место
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= venueRating
              return (
                <button
                  key={star}
                  onClick={() => { haptic('light'); setVenueRating(star) }}
                  style={{
                    background: 'none', border: 'none', padding: '4px 6px',
                    cursor: 'pointer', lineHeight: 1,
                    fontSize: 36,
                    color: filled ? COLORS.honey : 'rgba(245,239,230,0.20)',
                    transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                    transform: filled ? 'scale(1.15)' : 'scale(1)',
                    filter: filled ? 'drop-shadow(0 2px 8px rgba(244,201,93,0.50))' : 'none',
                  }}
                  aria-label={`${star} звёзд`}
                >
                  ★
                </button>
              )
            })}
            {venueRating > 0 && (
              <span style={{ ...sansStyle, fontSize: 12, color: COLORS.honey, marginLeft: 8, fontWeight: 600 }}>
                {['', 'плохо', 'так себе', 'нормально', 'хорошо', 'отлично'][venueRating]}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={saving}
          onClick={onFinish}
          style={{
            marginTop: 36, width: '100%',
            background: saving ? 'rgba(245,239,230,0.15)' : COLORS.tomato,
            color: COLORS.cream, border: 'none',
            padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: saving ? 'none' : '0 12px 28px rgba(232,71,44,0.30)',
            cursor: saving ? 'default' : 'pointer',
            transition: 'all 250ms',
          }}
        >
          {saving ? 'сохраняем...' : 'завершить вечер →'}
        </button>

        <button
          style={{ marginTop: 14, width: '100%', background: 'transparent', color: 'rgba(245,239,230,0.35)', ...sansStyle, fontSize: 13, border: 'none', cursor: 'pointer', padding: '10px' }}
          onClick={() => { haptic('light'); navigate(-1) }}
        >
          назад
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Result ────────────────────────────────────────────────────
function ResultStep({ mutualMatches, onHome }: {
  mutualMatches: DbParticipant[]
  onHome: () => void
}) {
  const hasMutual = mutualMatches.length > 0

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100dvh',
      background: hasMutual ? COLORS.forest : COLORS.ink,
      color: COLORS.cream, overflowX: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'background 600ms ease',
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes shimmer{ 0%{opacity:0.5} 50%{opacity:1} 100%{opacity:0.5} }
      `}</style>
      <Grain opacity={0.35} />

      <div style={{
        position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 380,
        background: hasMutual
          ? 'radial-gradient(ellipse at center, rgba(244,201,93,0.35) 0%, transparent 68%)'
          : 'radial-gradient(ellipse at center, rgba(232,71,44,0.20) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 26px 60px' }}>

        {/* Icon */}
        <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 20, animation: 'popIn 600ms cubic-bezier(0.22,1,0.36,1) both' }}>
          {hasMutual ? '🎉' : '🌙'}
        </div>

        {/* Heading */}
        <h1 style={{ ...serifStyle, fontSize: 52, lineHeight: 0.98, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 14px', animation: 'fadeUp 500ms cubic-bezier(0.22,1,0.36,1) 100ms both' }}>
          {hasMutual ? 'взаимно!' : 'спасибо.'}
        </h1>

        <p style={{ ...sansStyle, fontSize: 15, color: 'rgba(245,239,230,0.65)', lineHeight: 1.6, textAlign: 'center', margin: '0 0 36px', animation: 'fadeUp 500ms cubic-bezier(0.22,1,0.36,1) 180ms both' }}>
          {hasMutual
            ? 'кто-то за этим столом тоже хочет встретиться снова.'
            : 'вечер сохранён.\nесли кто-то выберет вас — пришлём уведомление.'}
        </p>

        {/* Mutual match cards */}
        {hasMutual && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {mutualMatches.map((p, i) => {
              const pal = AVATAR_COLORS[i % AVATAR_COLORS.length]!
              const firstName = p.name.split(' ')[0] ?? p.name
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 20,
                  background: 'rgba(244,201,93,0.12)',
                  border: '1.5px solid rgba(244,201,93,0.28)',
                  animation: `fadeUp 420ms cubic-bezier(0.22,1,0.36,1) ${250 + i * 80}ms both`,
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: pal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 3px rgba(244,201,93,0.30)',
                  }}>
                    <span style={{ ...sansStyle, fontSize: 15, fontWeight: 700, color: pal.fg }}>{getInitials(p.name)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...sansStyle, fontSize: 15, fontWeight: 700, color: COLORS.cream }}>{firstName}</div>
                    <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(244,201,93,0.75)', marginTop: 2 }}>
                      ♥ тоже хочет встретиться снова
                    </div>
                  </div>
                  {p.telegram_id && (
                    <button
                      onClick={() => { haptic('medium'); openTelegramUser(p.telegram_id!) }}
                      style={{
                        flexShrink: 0, padding: '9px 16px', borderRadius: 99,
                        background: 'rgba(244,201,93,0.20)', border: '1px solid rgba(244,201,93,0.40)',
                        color: COLORS.honey, ...sansStyle, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >написать →</button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Next circle nudge */}
        <div style={{
          padding: '20px 22px', borderRadius: 20,
          background: 'rgba(245,239,230,0.07)',
          border: '1px solid rgba(245,239,230,0.10)',
          textAlign: 'center', marginBottom: 24,
          animation: 'fadeUp 500ms cubic-bezier(0.22,1,0.36,1) 350ms both',
        }}>
          <div style={{ ...serifStyle, fontSize: 22, color: COLORS.cream, lineHeight: 1.2, marginBottom: 6 }}>
            следующий круг<br />собирается уже скоро.
          </div>
          <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.45)' }}>
            записывайтесь — пока есть места.
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onHome}
          style={{
            width: '100%', background: COLORS.tomato, color: COLORS.cream,
            border: 'none', padding: '17px', borderRadius: 99,
            ...sansStyle, fontSize: 15, fontWeight: 700,
            boxShadow: '0 12px 28px rgba(232,71,44,0.32)', cursor: 'pointer',
            animation: 'fadeUp 500ms cubic-bezier(0.22,1,0.36,1) 420ms both',
          }}
        >
          на главную →
        </button>
      </div>
    </div>
  )
}
