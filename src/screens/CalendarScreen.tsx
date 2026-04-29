import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchUserBookings } from '../lib/db'
import type { DbMeetup } from '../lib/db'
import { useUser } from '../context/UserContext'

const DAY_NAMES = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

interface WeekDay {
  d: string
  n: number
  fullDate: Date
  hot?: boolean
}

function getWeekDays(today: Date): WeekDay[] {
  const dow = today.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + offset)
  monday.setHours(0, 0, 0, 0)
  return DAY_NAMES.map((d, i) => {
    const fullDate = new Date(monday)
    fullDate.setDate(monday.getDate() + i)
    return { d, n: fullDate.getDate(), fullDate }
  })
}

function markHotDays(week: WeekDay[], upcoming: DbMeetup | null): WeekDay[] {
  if (!upcoming?.scheduled_at) return week
  const meetupDate = new Date(upcoming.scheduled_at)
  return week.map((day) => ({
    ...day,
    hot:
      day.fullDate.getDate() === meetupDate.getDate() &&
      day.fullDate.getMonth() === meetupDate.getMonth() &&
      day.fullDate.getFullYear() === meetupDate.getFullYear(),
  }))
}

export function CalendarScreen() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [upcoming, setUpcoming] = useState<DbMeetup | null>(null)
  const [past, setPast] = useState<DbMeetup[]>([])
  const today = new Date()
  const baseWeek = getWeekDays(today)
  const week = markHotDays(baseWeek, upcoming)

  useEffect(() => {
    if (!user) return
    fetchUserBookings(user.id)
      .then((bookings) => {
        const upcomingBooking = bookings.find((b) => b.meetup.status === 'upcoming')
        setUpcoming(upcomingBooking?.meetup ?? null)
        const pastMeetups = bookings
          .filter((b) => b.meetup.status === 'past')
          .map((b) => b.meetup)
          .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
        setPast(pastMeetups)
      })
      .catch(console.error)
  }, [user])

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
    overflowY: 'auto',
  }

  function openPastMeetup(m: DbMeetup) {
    haptic('light')
    try { localStorage.setItem('svoy_krug_review_meetup', m.id) } catch { /* ignore */ }
    navigate('/post-event')
  }

  return (
    <PageTransition>
      <div style={root}>
        <Grain opacity={0.3} />
        <div style={{ paddingTop: 64, paddingBottom: 110 }}>

          {/* Header */}
          <div style={{ padding: '0 22px 12px' }}>
            <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.inkSoft, textTransform: 'uppercase' }}>
              мой вечер
            </div>
            <h1 style={{ margin: '10px 0 0', fontSize: 42, lineHeight: 0.98, letterSpacing: '-0.02em' }}>
              <span style={serifStyle}>что у вас </span>
              <span style={{ ...sansStyle, fontWeight: 700 }}>впереди.</span>
            </h1>

            {/* Streak badge */}
            {past.length >= 2 && (
              <div style={{
                background: COLORS.honey,
                color: COLORS.ink,
                padding: '6px 12px',
                borderRadius: 99,
                ...sansStyle,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 10,
              }}>
                <span aria-hidden="true">🔥</span>
                <span>{past.length} {past.length === 1 ? 'вечер' : past.length < 5 ? 'вечера' : 'вечеров'} подряд</span>
              </div>
            )}
          </div>

          {/* Week strip */}
          <div style={{
            margin: '14px 22px 24px',
            padding: '16px',
            borderRadius: 20,
            background: '#fff',
            border: '1px solid rgba(26,22,18,0.06)',
            boxShadow: '0 2px 12px rgba(26,22,18,0.05)',
          }}>
            <div style={{
              ...sansStyle,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: COLORS.inkSoft,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {week.map((d) => {
                const isToday =
                  d.fullDate.getDate() === today.getDate() &&
                  d.fullDate.getMonth() === today.getMonth() &&
                  d.fullDate.getFullYear() === today.getFullYear()
                return (
                  <button
                    key={d.n}
                    style={{ textAlign: 'center', background: 'transparent', border: 'none', padding: '2px 0' }}
                    onClick={() => {
                      haptic('light')
                      if (d.hot) navigate('/group')
                    }}
                  >
                    <div style={{
                      ...sansStyle,
                      fontSize: 9,
                      fontWeight: 700,
                      color: d.hot ? COLORS.tomato : isToday ? COLORS.tomato : COLORS.inkSoft,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {d.d}
                    </div>
                    <div style={{
                      marginTop: 5,
                      width: 32,
                      height: 32,
                      lineHeight: '32px',
                      textAlign: 'center',
                      borderRadius: 99,
                      ...sansStyle,
                      fontSize: 14,
                      fontWeight: 700,
                      marginInline: 'auto',
                      fontVariantNumeric: 'tabular-nums',
                      background: d.hot ? COLORS.tomato : isToday ? COLORS.cream2 : 'transparent',
                      color: d.hot ? COLORS.cream : COLORS.ink,
                      border: isToday && !d.hot ? `1.5px solid ${COLORS.tomato}` : 'none',
                      boxShadow: d.hot ? '0 4px 12px rgba(232,71,44,0.35)' : 'none',
                      transition: 'background 200ms, box-shadow 200ms',
                    }}>
                      {d.n}
                    </div>
                    {d.hot && (
                      <div
                        aria-hidden="true"
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: COLORS.tomato,
                          margin: '3px auto 0',
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title above the card */}
          {upcoming && (
            <div style={{ padding: '0 22px 12px' }}>
              <div style={{
                ...sansStyle,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: COLORS.tomato,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                ваш ближайший круг
              </div>
              <h2 style={{
                ...serifStyle,
                margin: 0,
                fontSize: 36,
                lineHeight: 1.0,
                color: COLORS.ink,
                letterSpacing: '-0.01em',
                maxWidth: 320,
              }}>
                {upcoming.title}
              </h2>
            </div>
          )}

          {/* Upcoming card */}
          {upcoming && (
            <button
              style={{
                display: 'block',
                width: 'calc(100% - 44px)',
                margin: '0 22px 16px',
                borderRadius: 24,
                overflow: 'hidden',
                background: COLORS.tomato,
                color: COLORS.cream,
                boxShadow: '0 20px 48px rgba(232,71,44,0.30), 0 4px 12px rgba(232,71,44,0.15)',
                position: 'relative',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                animation: 'fadeIn 400ms cubic-bezier(0.22,1,0.36,1) both',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
              onClick={() => {
                haptic('medium')
                if (upcoming?.circle_id) {
                  try { localStorage.setItem('svoy_krug_last_circle', upcoming.circle_id) } catch { /* ignore */ }
                }
                navigate('/circle')
              }}
              aria-label="Открыть детали вечера"
            >
              {upcoming.photo && (
                <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                  <img
                    src={upcoming.photo}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'saturate(1.05) brightness(0.85) sepia(0.06)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(232,71,44,0.18) 0%, rgba(232,71,44,0.78) 100%)',
                  }} />
                </div>
              )}

              <div style={{ padding: '18px 22px 22px', position: 'relative' }}>
                <Grain opacity={0.18} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    ...sansStyle,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: COLORS.cream,
                    opacity: 0.95,
                    textTransform: 'uppercase',
                  }}>
                    {upcoming.date_label}
                  </div>
                  <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.82)', marginTop: 4 }}>
                    {upcoming.place}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Seats taken={upcoming.taken} total={upcoming.seats} dark />
                    <span style={{
                      background: COLORS.ink,
                      color: COLORS.cream,
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: 99,
                      ...sansStyle,
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'inline-block',
                    }}>
                      детали →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Empty state - no upcoming */}
          {!upcoming && (
            <div style={{ padding: '0 22px 24px' }}>
              <div style={{
                padding: '20px',
                borderRadius: 20,
                background: '#fff',
                border: '1px solid rgba(26,22,18,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ ...serifStyle, fontSize: 22, color: COLORS.ink, marginBottom: 8 }}>вечеров пока нет</div>
                <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft }}>загляните на главную и найдите свой круг.</div>
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div style={{ padding: '4px 22px 0' }}>
              <div style={{
                ...sansStyle,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: COLORS.inkSoft,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                было раньше
              </div>
              {past.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openPastMeetup(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 0',
                    borderTop: '1px solid rgba(26,22,18,0.08)',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: COLORS.cream2,
                        color: COLORS.ink,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...serifStyle,
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {(p.title?.[0] ?? '·').toLowerCase()}
                    </div>
                  )}
                  <div style={{ width: 48, ...sansStyle, fontSize: 11, fontWeight: 700, color: COLORS.inkSoft, letterSpacing: '0.04em', flexShrink: 0 }}>
                    {p.date_label}
                  </div>
                  <div style={{ flex: 1, ...serifStyle, fontSize: 20, color: COLORS.ink }}>
                    {p.title}
                  </div>
                  {p.mood && (
                    <span style={{
                      ...sansStyle,
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.tomato,
                      background: 'rgba(232,71,44,0.10)',
                      padding: '4px 10px',
                      borderRadius: 99,
                      flexShrink: 0,
                    }}>
                      {p.mood}
                    </span>
                  )}
                  {!p.mood && (
                    <span style={{
                      ...sansStyle,
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.inkSoft,
                      background: COLORS.cream2,
                      padding: '4px 10px',
                      borderRadius: 99,
                      flexShrink: 0,
                    }}>
                      оценить →
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Motivational footer */}
          <div style={{ padding: '24px 22px', textAlign: 'center' }}>
            <div style={{ ...serifStyle, fontSize: 20, color: COLORS.inkSoft, lineHeight: 1.3 }}>
              каждый вечер — это кто-то новый,<br />кто станет вашим.
            </div>
          </div>
        </div>

        <TabBar active="cal" />
      </div>
    </PageTransition>
  )
}
