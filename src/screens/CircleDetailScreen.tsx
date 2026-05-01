import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle, overlineStyle } from '../theme'
import { Grain } from '../components/Grain'
import { Seats } from '../components/Seats'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import {
  fetchCircleById, fetchMeetupsByCircle, fetchBooking,
  bookMeetup, cancelBooking,
  type DbCircle, type DbMeetup,
} from '../lib/db'
import { MOCK_CIRCLES, MOCK_MEETUPS } from '../lib/mockCircles'

const MOCK_AVATARS = ['А', 'М', 'В', 'С', 'Л']
const AVATAR_COLORS = [COLORS.tomato, COLORS.forest, 'rgba(120,95,75,0.9)', 'rgba(90,75,65,0.9)', 'rgba(45,74,62,0.9)']

function formatPrice(v: number) {
  return v === 0 ? 'бесплатно' : `${v.toLocaleString('ru-RU')} ₽`
}

export function CircleDetailScreen() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [circle, setCircle] = useState<DbCircle | null>(null)
  const [meetups, setMeetups] = useState<DbMeetup[]>([])
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [toast, setToast] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const circleId = (() => { try { return localStorage.getItem('svoy_krug_last_circle') } catch { return null } })()

  useEffect(() => {
    if (!circleId) { navigate(-1); return }
    // Try Supabase first; fall back to mock for non-UUID ids
    if (circleId.startsWith('mock-')) {
      setCircle(MOCK_CIRCLES.find(c => c.id === circleId) ?? null)
      const m = MOCK_MEETUPS[circleId]
      setMeetups(m ? [m] : [])
      setLoaded(true)
      return
    }
    Promise.all([fetchCircleById(circleId), fetchMeetupsByCircle(circleId)])
      .then(([c, ms]) => { setCircle(c); setMeetups(ms) })
      .catch(console.error)
      .finally(() => setLoaded(true))
  }, [circleId, navigate])

  const upcomingMeetup = meetups.find(m => m.status === 'upcoming') ?? null

  useEffect(() => {
    if (!upcomingMeetup || !user) return
    fetchBooking(user.id, upcomingMeetup.id).then(setBookingId).catch(console.error)
  }, [user, upcomingMeetup])

  async function handleBook() {
    if (!upcomingMeetup || booking) return
    if (!user) {
      setErrorMsg('не удалось создать профиль — попробуй перезагрузить страницу')
      return
    }
    // Mock meetup IDs are not real UUIDs — can't save to Supabase
    const isMockMeetup = upcomingMeetup.id.startsWith('mock-')
    if (isMockMeetup) {
      setErrorMsg('это демо-вечер, запись недоступна. Скоро добавим реальные вечера!')
      return
    }
    haptic('medium')
    setErrorMsg(null)
    setBooking(true)
    try {
      if (bookingId) {
        await cancelBooking(bookingId, upcomingMeetup.id)
        setBookingId(null)
        setMeetups(prev => prev.map(m => m.id === upcomingMeetup.id ? { ...m, taken: Math.max(0, m.taken - 1) } : m))
      } else {
        const id = await bookMeetup(user.id, upcomingMeetup.id)
        setBookingId(id)
        setMeetups(prev => prev.map(m => m.id === upcomingMeetup.id ? { ...m, taken: m.taken + 1 } : m))
        setToast(true)
        setTimeout(() => { setToast(false); navigate('/waiting') }, 1800)
      }
    } catch (err) {
      console.error('handleBook error:', err)
      setErrorMsg('не удалось записаться — попробуй ещё раз')
    }
    finally { setBooking(false) }
  }

  const taken = upcomingMeetup?.taken ?? circle?.taken ?? 0
  const total = upcomingMeetup?.seats ?? circle?.seats ?? 6
  const remaining = Math.max(0, total - taken)
  const full = remaining === 0 && !bookingId
  const almostFull = remaining <= 2 && remaining > 0

  if (!loaded) return (
    <div style={{ width: '100%', height: '100dvh', background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...serifStyle, fontSize: 24, color: 'rgba(245,239,230,0.3)' }}>·  ·  ·</div>
    </div>
  )

  if (!circle) return (
    <div style={{ width: '100%', height: '100dvh', background: COLORS.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ ...serifStyle, fontSize: 24, color: COLORS.cream }}>круг не найден</div>
      <button onClick={() => navigate('/home')} style={{ ...sansStyle, color: COLORS.tomato, background: 'none', border: 'none', fontSize: 14, cursor: 'pointer' }}>← на главную</button>
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: COLORS.ink, color: COLORS.cream, overflowX: 'hidden' }}>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <Grain opacity={0.30} />

      {/* ── Hero photo ── */}
      <div style={{ position: 'relative', height: '52vh', minHeight: 280, overflow: 'hidden' }}>
        {circle.photo ? (
          <img src={circle.photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.10) brightness(0.78)' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.ink})` }} />
        )}
        {/* Gradient layers */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,22,18,0.30) 0%, rgba(26,22,18,0.10) 40%, rgba(26,22,18,0.90) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(244,201,93,0.06) 0%, transparent 60%)' }} />

        {/* Back */}
        <button
          onClick={() => { haptic('light'); navigate(-1) }}
          aria-label="Назад"
          style={{
            position: 'absolute', top: 52, left: 20, zIndex: 40,
            width: 40, height: 40, borderRadius: RADII.full,
            background: 'rgba(26,22,18,0.50)',
            border: '1px solid rgba(245,239,230,0.18)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Badges */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            ...sansStyle, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', background: COLORS.tomato, color: COLORS.cream,
            padding: '6px 12px', borderRadius: RADII.full,
          }}>{circle.kind}</span>
          <span style={{
            ...sansStyle, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            background: 'rgba(26,22,18,0.55)', color: COLORS.cream,
            padding: '6px 12px', borderRadius: RADII.full,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>{circle.time_short}</span>
          {almostFull && (
            <span style={{
              ...sansStyle, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
              textTransform: 'uppercase', background: 'rgba(244,201,93,0.20)',
              border: '1px solid rgba(244,201,93,0.45)', color: COLORS.honey,
              padding: '6px 12px', borderRadius: RADII.full,
            }}>последние места</span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '26px 22px 140px', animation: 'slideUp 400ms cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Title */}
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, letterSpacing: '-0.02em', color: COLORS.cream }}>
          {circle.title}
        </h1>
        {circle.hint && (
          <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.65)', margin: '0 0 22px', lineHeight: 1.55 }}>
            {circle.hint}
          </p>
        )}

        {/* Info row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {/* Location hidden until 4h before — show teaser */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(245,239,230,0.07)', border: '1px solid rgba(245,239,230,0.12)',
            borderRadius: RADII.full, padding: '8px 14px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="rgba(245,239,230,0.35)" />
            </svg>
            <span style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.50)', fontWeight: 500 }}>место — за 4 часа до встречи</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(244,201,93,0.10)', border: '1px solid rgba(244,201,93,0.22)',
            borderRadius: RADII.full, padding: '8px 14px',
          }}>
            <span style={{ ...sansStyle, fontSize: 13, color: COLORS.honey, fontWeight: 600 }}>
              {formatPrice(circle.price)}
            </span>
          </div>
        </div>

        {/* Seats + social proof */}
        <div style={{
          padding: '20px', borderRadius: RADII.xl,
          background: 'rgba(245,239,230,0.06)', border: '1px solid rgba(245,239,230,0.10)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ ...overlineStyle, color: 'rgba(245,239,230,0.45)', marginBottom: 6 }}>мест занято</div>
              <Seats taken={taken} total={total} dark />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                ...serifStyle, fontSize: 36, lineHeight: 1,
                color: remaining === 0 ? 'rgba(245,239,230,0.30)' : COLORS.tomato,
              }}>{remaining}</div>
              <div style={{ ...sansStyle, fontSize: 11, color: 'rgba(245,239,230,0.45)', marginTop: 2 }}>
                {remaining === 1 ? 'место' : remaining < 5 ? 'места' : 'мест'} свободно
              </div>
            </div>
          </div>

          {/* Mini avatar row — people already booked */}
          {taken > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex' }}>
                {MOCK_AVATARS.slice(0, Math.min(taken, 5)).map((initial, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: RADII.full,
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    border: '2px solid rgba(26,22,18,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: i === 0 ? 0 : -8,
                    ...sansStyle, fontSize: 11, fontWeight: 700, color: COLORS.cream,
                  }}>
                    {initial}
                  </div>
                ))}
              </div>
              <span style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.55)', fontWeight: 500 }}>
                уже {taken} {taken === 1 ? 'человек' : 'человека'} записались
              </span>
            </div>
          )}
        </div>

        {/* Upcoming meetup */}
        {upcomingMeetup && (
          <div style={{
            padding: '18px 20px', borderRadius: RADII.xl,
            background: 'rgba(245,239,230,0.06)', border: '1px solid rgba(245,239,230,0.10)',
            marginBottom: 16,
          }}>
            <div style={{ ...overlineStyle, color: COLORS.tomato, marginBottom: 10 }}>ближайший вечер</div>
            <div style={{ ...serifStyle, fontSize: 24, color: COLORS.cream, lineHeight: 1.1, marginBottom: 6 }}>
              {upcomingMeetup.title}
            </div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.60)', marginBottom: 14 }}>
              {upcomingMeetup.date_label} · место придёт за 4 часа
            </div>
            <button
              onClick={() => { haptic('light'); navigate('/chat') }}
              style={{
                ...sansStyle, width: '100%', padding: '12px 16px',
                borderRadius: RADII.full, background: 'rgba(245,239,230,0.09)',
                border: '1px solid rgba(245,239,230,0.14)', color: COLORS.cream,
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span>написать группе</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(245,239,230,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Booked state message */}
        {bookingId && (
          <div style={{
            padding: '16px 20px', borderRadius: RADII.lg,
            background: `${COLORS.forest}22`, border: `1px solid ${COLORS.forest}55`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: RADII.full, background: COLORS.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4 4L19 7" stroke={COLORS.cream} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ ...sansStyle, fontSize: 13, fontWeight: 600, color: COLORS.cream }}>вы записаны</div>
              <div style={{ ...sansStyle, fontSize: 11, color: 'rgba(245,239,230,0.55)', marginTop: 2 }}>адрес придёт за 6 часов до встречи</div>
            </div>
          </div>
        )}

        {!upcomingMeetup && (
          <div style={{ ...serifStyle, fontSize: 18, color: 'rgba(245,239,230,0.35)', lineHeight: 1.3 }}>
            пока нет запланированных вечеров
          </div>
        )}
      </div>

      {/* ── Fixed bottom CTA ── */}
      {upcomingMeetup && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          padding: '14px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(26,22,18,0.97) 28%)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}>
          {/* Error message */}
          {errorMsg && (
            <div style={{ ...sansStyle, fontSize: 12, color: COLORS.honey, textAlign: 'center', marginBottom: 10, lineHeight: 1.4 }}>
              {errorMsg}
            </div>
          )}
          {/* Seats preview above button */}
          {!bookingId && !full && !errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              <Seats taken={taken} total={total} dark />
              <span style={{ ...sansStyle, fontSize: 11, color: 'rgba(245,239,230,0.45)' }}>
                {remaining} {remaining < 5 ? 'места' : 'мест'} из {total}
              </span>
            </div>
          )}
          <button
            onClick={handleBook}
            disabled={full || booking}
            style={{
              width: '100%', padding: '17px', borderRadius: RADII.full,
              border: 'none', ...sansStyle, fontSize: 16, fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: full ? 'default' : 'pointer',
              transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
              background: full
                ? 'rgba(245,239,230,0.10)'
                : bookingId ? COLORS.forest : COLORS.tomato,
              color: full ? 'rgba(245,239,230,0.30)' : COLORS.cream,
              boxShadow: full ? 'none' : bookingId ? SHADOWS.ctaForest : SHADOWS.cta,
              opacity: booking ? 0.65 : 1,
            }}
          >
            {booking ? '·  ·  ·' : full ? 'мест нет' : bookingId ? '✓ вы записаны' : 'записаться →'}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 120, left: '50%',
          transform: 'translateX(-50%)',
          background: COLORS.tomato, color: COLORS.cream,
          zIndex: 100, padding: '13px 24px', borderRadius: RADII.full,
          ...sansStyle, fontSize: 14, fontWeight: 600,
          boxShadow: SHADOWS.cta, whiteSpace: 'nowrap',
          animation: 'toastIn 300ms cubic-bezier(0.22,1,0.36,1) both',
        }}>
          вы записаны на вечер 🎉
        </div>
      )}
    </div>
  )
}
