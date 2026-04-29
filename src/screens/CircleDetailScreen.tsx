import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { Seats } from '../components/Seats'
import { PriceChip } from '../components/PriceChip'
import { haptic } from '../lib/telegram'
import { useUser } from '../context/UserContext'
import {
  fetchCircleById,
  fetchMeetupsByCircle,
  fetchBooking,
  bookMeetup,
  cancelBooking,
  type DbCircle,
  type DbMeetup,
} from '../lib/db'
import { MOCK_CIRCLES, MOCK_MEETUPS } from '../lib/mockCircles'

export function CircleDetailScreen() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [circle, setCircle] = useState<DbCircle | null>(null)
  const [meetups, setMeetups] = useState<DbMeetup[]>([])
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [toast, setToast] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const circleId = (() => {
    try {
      return localStorage.getItem('svoy_krug_last_circle')
    } catch {
      return null
    }
  })()

  useEffect(() => {
    if (!circleId) {
      navigate(-1)
      return
    }
    // Use mock data for demo circles
    if (circleId.startsWith('mock-')) {
      const mockCircle = MOCK_CIRCLES.find((c) => c.id === circleId) ?? null
      const mockMeetup = MOCK_MEETUPS[circleId]
      setCircle(mockCircle)
      setMeetups(mockMeetup ? [mockMeetup] : [])
      setLoaded(true)
      return
    }
    Promise.all([fetchCircleById(circleId), fetchMeetupsByCircle(circleId)])
      .then(([c, ms]) => {
        setCircle(c)
        setMeetups(ms)
      })
      .catch(console.error)
      .finally(() => setLoaded(true))
  }, [circleId, navigate])

  const upcomingMeetup = meetups.find((m) => m.status === 'upcoming') ?? null

  useEffect(() => {
    if (!upcomingMeetup) return
    // Mock mode: don't query Supabase for bookings
    if (circleId?.startsWith('mock-')) return
    if (!user) return
    fetchBooking(user.id, upcomingMeetup.id)
      .then(setBookingId)
      .catch(console.error)
  }, [user, upcomingMeetup, circleId])

  async function handleBook() {
    if (!upcomingMeetup || booking) return
    haptic('medium')
    // Mock mode: simulate booking without Supabase
    if (circleId?.startsWith('mock-')) {
      setBooking(true)
      await new Promise((r) => setTimeout(r, 600))
      if (bookingId) {
        setBookingId(null)
        setMeetups((prev) =>
          prev.map((m) =>
            m.id === upcomingMeetup.id ? { ...m, taken: Math.max(0, m.taken - 1) } : m,
          ),
        )
      } else {
        setBookingId('mock-booking')
        setMeetups((prev) =>
          prev.map((m) =>
            m.id === upcomingMeetup.id ? { ...m, taken: m.taken + 1 } : m,
          ),
        )
        setToast(true)
        setTimeout(() => {
          setToast(false)
          navigate('/waiting')
        }, 1800)
      }
      setBooking(false)
      return
    }
    if (!user) return
    setBooking(true)
    try {
      if (bookingId) {
        await cancelBooking(bookingId, upcomingMeetup.id)
        setBookingId(null)
        setMeetups((prev) =>
          prev.map((m) =>
            m.id === upcomingMeetup.id ? { ...m, taken: Math.max(0, m.taken - 1) } : m,
          ),
        )
      } else {
        const id = await bookMeetup(user.id, upcomingMeetup.id)
        setBookingId(id)
        setMeetups((prev) =>
          prev.map((m) =>
            m.id === upcomingMeetup.id ? { ...m, taken: m.taken + 1 } : m,
          ),
        )
        setToast(true)
        setTimeout(() => {
          setToast(false)
          navigate('/waiting')
        }, 1800)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBooking(false)
    }
  }

  const remaining = upcomingMeetup
    ? Math.max(0, upcomingMeetup.seats - upcomingMeetup.taken)
    : 0
  const full = remaining === 0 && !bookingId

  if (!loaded) {
    return (
      <div
        style={{
          width: '100%',
          height: '100dvh',
          background: COLORS.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ ...serifStyle, fontSize: 24, color: 'rgba(245,239,230,0.4)' }}>...</div>
      </div>
    )
  }

  if (!circle) {
    return (
      <div
        style={{
          width: '100%',
          height: '100dvh',
          background: COLORS.ink,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div style={{ ...serifStyle, fontSize: 24, color: COLORS.cream }}>круг не найден</div>
        <button
          onClick={() => navigate('/home')}
          style={{
            ...sansStyle,
            color: COLORS.tomato,
            background: 'none',
            border: 'none',
            fontSize: 14,
          }}
        >
          ← на главную
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        background: COLORS.ink,
        color: COLORS.cream,
        overflowX: 'hidden',
      }}
    >
      <Grain opacity={0.35} />

      {/* Back button */}
      <button
        onClick={() => {
          haptic('light')
          navigate(-1)
        }}
        aria-label="Назад"
        style={{
          position: 'fixed',
          top: 52,
          left: 22,
          zIndex: 40,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(26,22,18,0.55)',
          border: '1px solid rgba(245,239,230,0.18)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.cream,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke={COLORS.cream}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Photo hero */}
      <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        {circle.photo ? (
          <img
            src={circle.photo}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(1.05) brightness(0.80) sepia(0.08)',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: COLORS.forest }} />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(26,22,18,0.25) 0%, rgba(26,22,18,0.85) 100%)',
          }}
        />

        {/* Badges on photo */}
        <div style={{ position: 'absolute', bottom: 20, left: 22, display: 'flex', gap: 8 }}>
          <span
            style={{
              ...sansStyle,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              background: COLORS.tomato,
              color: COLORS.cream,
              padding: '5px 10px',
              borderRadius: 99,
            }}
          >
            {circle.kind}
          </span>
          <span
            style={{
              ...sansStyle,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.10em',
              background: 'rgba(26,22,18,0.60)',
              color: COLORS.cream,
              padding: '5px 10px',
              borderRadius: 99,
              backdropFilter: 'blur(6px)',
            }}
          >
            {circle.time_short}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 22px 120px' }}>
        <h1
          style={{
            margin: 0,
            ...serifStyle,
            fontSize: 38,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: COLORS.cream,
          }}
        >
          {circle.title}
        </h1>

        {circle.hint && (
          <p
            style={{
              ...sansStyle,
              fontSize: 14,
              color: 'rgba(245,239,230,0.70)',
              margin: '10px 0 0',
              lineHeight: 1.5,
            }}
          >
            {circle.hint}
          </p>
        )}

        {circle.place && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 16,
              ...sansStyle,
              fontSize: 13,
              color: 'rgba(245,239,230,0.80)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="rgba(245,239,230,0.60)"
              />
            </svg>
            {circle.place}
          </div>
        )}

        {/* Price + Seats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <PriceChip value={circle.price} dark />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Seats
              taken={upcomingMeetup?.taken ?? circle.taken}
              total={upcomingMeetup?.seats ?? circle.seats}
              dark
            />
            <span
              style={{
                ...sansStyle,
                fontSize: 10,
                color: 'rgba(245,239,230,0.55)',
                fontWeight: 500,
              }}
            >
              {remaining} {remaining === 1 ? 'место' : remaining < 5 ? 'места' : 'мест'} свободно
            </span>
          </div>
        </div>

        {/* Upcoming meetup block */}
        {upcomingMeetup && (
          <div
            style={{
              marginTop: 28,
              padding: '16px',
              borderRadius: 18,
              background: 'rgba(245,239,230,0.07)',
              border: '1px solid rgba(245,239,230,0.10)',
            }}
          >
            <div
              style={{
                ...sansStyle,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: COLORS.tomato,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              ближайший вечер
            </div>
            <div style={{ ...serifStyle, fontSize: 22, color: COLORS.cream, lineHeight: 1.1 }}>
              {upcomingMeetup.title}
            </div>
            <div
              style={{
                ...sansStyle,
                fontSize: 13,
                color: 'rgba(245,239,230,0.65)',
                marginTop: 6,
              }}
            >
              {upcomingMeetup.date_label} · {upcomingMeetup.place}
            </div>
          </div>
        )}

        {/* No upcoming meetup */}
        {!upcomingMeetup && (
          <div
            style={{
              marginTop: 28,
              ...serifStyle,
              fontSize: 18,
              color: 'rgba(245,239,230,0.45)',
              lineHeight: 1.3,
            }}
          >
            пока нет запланированных вечеров
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {upcomingMeetup && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            padding: '16px 22px calc(env(safe-area-inset-bottom, 0px) + 20px)',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(26,22,18,0.98) 30%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={handleBook}
            disabled={full || booking}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 99,
              border: 'none',
              ...sansStyle,
              fontSize: 15,
              fontWeight: 700,
              cursor: full ? 'default' : 'pointer',
              transition: 'all 220ms ease',
              background: full
                ? 'rgba(245,239,230,0.12)'
                : bookingId
                  ? COLORS.forest
                  : COLORS.tomato,
              color: full ? 'rgba(245,239,230,0.40)' : COLORS.cream,
              boxShadow: full
                ? 'none'
                : bookingId
                  ? '0 10px 24px rgba(45,74,62,0.40)'
                  : '0 10px 28px rgba(232,71,44,0.40)',
              opacity: booking ? 0.7 : 1,
            }}
          >
            {booking ? '...' : full ? 'мест нет' : bookingId ? 'вы записаны ✓' : 'записаться →'}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 110,
            left: '50%',
            transform: 'translateX(-50%)',
            background: COLORS.tomato,
            color: COLORS.cream,
            zIndex: 100,
            padding: '12px 22px',
            borderRadius: 99,
            ...sansStyle,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(232,71,44,0.45)',
            whiteSpace: 'nowrap',
            animation: 'toastIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          вы записаны на вечер 🎉
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
