import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle, overlineStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchUserBookings } from '../lib/db'
import type { DbMeetup } from '../lib/db'
import { useUser } from '../context/UserContext'

const DAY_NAMES = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

interface WeekDay { d: string; n: number; fullDate: Date; hot?: boolean }

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

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
}

function markHotDays(week: WeekDay[], upcoming: DbMeetup | null): WeekDay[] {
  if (!upcoming?.scheduled_at) return week
  const meetupDate = new Date(upcoming.scheduled_at)
  return week.map((day) => ({
    ...day,
    hot: isSameDay(day.fullDate, meetupDate),
  }))
}

export function CalendarScreen() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [upcoming, setUpcoming] = useState<DbMeetup | null>(null)
  const [past, setPast] = useState<DbMeetup[]>([])
  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
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

  function openPastMeetup(m: DbMeetup) {
    haptic('light')
    try { localStorage.setItem('svoy_krug_review_meetup', m.id) } catch { /* ignore */ }
    navigate('/post-event')
  }

  function meetupOnDay(date: Date): DbMeetup | null {
    if (upcoming?.scheduled_at && isSameDay(new Date(upcoming.scheduled_at), date)) return upcoming
    return past.find((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), date)) ?? null
  }

  const selectedMeetup = meetupOnDay(selectedDay)
  const isSelectedUpcoming = selectedMeetup?.status === 'upcoming'
  const isSelectedPast = selectedMeetup?.status === 'past'
  const selectedDayLabel = selectedDay.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <PageTransition>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        background: COLORS.cream,
        color: COLORS.ink,
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}>
        <Grain opacity={0.25} />
        <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>

        <div style={{ paddingTop: 60, paddingBottom: 110 }}>

          {/* Header */}
          <div style={{ padding: '0 24px 20px' }}>
            <span style={{ ...overlineStyle, color: COLORS.inkSoft, display: 'block', marginBottom: 10 }}>мой вечер</span>
            <h1 style={{ margin: 0, fontSize: 44, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
              <span style={serifStyle}>что у вас </span>
              <span style={{ ...sansStyle, fontWeight: 800 }}>впереди.</span>
            </h1>
            {past.length >= 2 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: COLORS.honey, color: COLORS.ink,
                padding: '7px 14px', borderRadius: RADII.full,
                ...sansStyle, fontSize: 12, fontWeight: 700, marginTop: 14,
              }}>
                🔥 {past.length} {past.length < 5 ? 'вечера' : 'вечеров'} подряд
              </div>
            )}
          </div>

          {/* Week strip */}
          <div style={{
            margin: '0 18px 24px',
            padding: '18px 16px',
            borderRadius: RADII.xl,
            background: COLORS.white,
            border: '1px solid rgba(26,22,18,0.06)',
            boxShadow: SHADOWS.panel,
          }}>
            <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: COLORS.inkSoft, textTransform: 'uppercase', marginBottom: 14 }}>
              {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {week.map((d) => {
                const isToday = isSameDay(d.fullDate, today)
                const isSelected = isSameDay(d.fullDate, selectedDay)
                const hasPastMeetup = past.some((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), d.fullDate))
                const bg = d.hot
                  ? COLORS.tomato
                  : isSelected
                    ? COLORS.ink
                    : hasPastMeetup
                      ? 'rgba(244,201,93,0.22)'
                      : isToday
                        ? COLORS.cream2
                        : 'transparent'
                const fg = d.hot
                  ? COLORS.cream
                  : isSelected
                    ? COLORS.cream
                    : COLORS.ink
                return (
                  <button
                    key={d.n}
                    style={{ textAlign: 'center', background: 'transparent', border: 'none', padding: '2px 0', cursor: 'pointer' }}
                    onClick={() => { haptic('light'); setSelectedDay(d.fullDate) }}
                  >
                    <div style={{ ...sansStyle, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: d.hot ? COLORS.tomato : isToday ? COLORS.tomato : COLORS.inkSoft }}>
                      {d.d}
                    </div>
                    <div style={{
                      marginTop: 5,
                      width: 32, height: 32, lineHeight: '32px',
                      textAlign: 'center', borderRadius: RADII.full,
                      ...sansStyle, fontSize: 14, fontWeight: 700,
                      marginInline: 'auto', fontVariantNumeric: 'tabular-nums',
                      background: bg,
                      color: fg,
                      border: isToday && !d.hot && !isSelected ? `1.5px solid ${COLORS.tomato}` : 'none',
                      boxShadow: d.hot ? '0 4px 12px rgba(232,71,44,0.35)' : 'none',
                    }}>
                      {d.n}
                    </div>
                    {d.hot && <div style={{ width: 4, height: 4, borderRadius: '50%', background: COLORS.tomato, margin: '4px auto 0' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day */}
          <div style={{ padding: '0 18px 8px' }}>
            <span style={{ ...overlineStyle, color: isSelectedUpcoming ? COLORS.tomato : COLORS.inkSoft, display: 'block', marginBottom: 14 }}>
              {selectedDayLabel}
            </span>
            {selectedMeetup ? (
              <button
                style={{
                  display: 'block', width: '100%',
                  borderRadius: RADII.xl, overflow: 'hidden',
                  background: COLORS.ink, color: COLORS.cream,
                  boxShadow: '0 20px 50px rgba(26,22,18,0.22)',
                  border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer',
                  animation: 'fadeUp 400ms cubic-bezier(0.22,1,0.36,1) both',
                }}
                onClick={() => {
                  haptic('medium')
                  if (isSelectedPast) {
                    openPastMeetup(selectedMeetup)
                    return
                  }
                  if (selectedMeetup.circle_id) {
                    try { localStorage.setItem('svoy_krug_last_circle', selectedMeetup.circle_id) } catch { /* ignore */ }
                  }
                  navigate('/circle')
                }}
              >
                {selectedMeetup.photo && (
                  <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
                    <img src={selectedMeetup.photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.80)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(26,22,18,0.88) 100%)' }} />
                  </div>
                )}
                <div style={{ padding: '20px 22px 22px', position: 'relative' }}>
                  <Grain opacity={0.15} />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ ...overlineStyle, color: 'rgba(245,239,230,0.55)', marginBottom: 8 }}>{selectedMeetup.date_label}</div>
                    <div style={{ ...serifStyle, fontSize: 28, lineHeight: 1.05, color: COLORS.cream, marginBottom: 4 }}>{selectedMeetup.title}</div>
                    <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.45)', marginBottom: 16 }}>📍 место — за 4 часа до встречи</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Seats taken={selectedMeetup.taken} total={selectedMeetup.seats} dark />
                      <span style={{ ...sansStyle, background: isSelectedPast ? COLORS.honey : COLORS.tomato, color: isSelectedPast ? COLORS.ink : COLORS.cream, padding: '10px 18px', borderRadius: RADII.full, fontSize: 13, fontWeight: 700, boxShadow: SHADOWS.cta }}>
                        {isSelectedPast ? 'оценить →' : 'детали →'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div style={{ padding: '28px 22px', borderRadius: RADII.xl, background: COLORS.white, border: '1px solid rgba(26,22,18,0.06)', boxShadow: SHADOWS.panel, textAlign: 'center' }}>
                <div style={{ ...serifStyle, fontSize: 22, color: COLORS.ink, marginBottom: 8 }}>в этот день нет круга</div>
                <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginBottom: 18 }}>запишитесь на другой вечер</div>
                <button onClick={() => { haptic('light'); navigate('/home') }} style={{ ...sansStyle, background: COLORS.ink, color: COLORS.cream, padding: '12px 22px', borderRadius: RADII.full, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  найти круг →
                </button>
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div style={{ padding: '8px 18px 0' }}>
              <span style={{ ...overlineStyle, color: COLORS.inkSoft, display: 'block', marginBottom: 14 }}>было раньше</span>
              <div style={{ background: COLORS.white, borderRadius: RADII.xl, border: '1px solid rgba(26,22,18,0.06)', boxShadow: SHADOWS.panel, overflow: 'hidden' }}>
                {past.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => openPastMeetup(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(26,22,18,0.06)',
                      width: '100%', background: 'transparent',
                      border: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {p.photo ? (
                      <img src={p.photo} alt="" style={{ width: 44, height: 44, borderRadius: RADII.md, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: RADII.md, background: COLORS.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', ...serifStyle, fontSize: 20, flexShrink: 0 }}>
                        {(p.title?.[0] ?? '·').toLowerCase()}
                      </div>
                    )}
                    <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, color: COLORS.inkSoft, letterSpacing: '0.04em', flexShrink: 0, width: 44 }}>{p.date_label}</div>
                    <div style={{ flex: 1, ...serifStyle, fontSize: 18, color: COLORS.ink }}>{p.title}</div>
                    <span style={{
                      ...sansStyle, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      color: p.mood ? COLORS.tomato : COLORS.inkSoft,
                      background: p.mood ? COLORS.tomatoLight : COLORS.cream2,
                      padding: '5px 11px', borderRadius: RADII.full,
                    }}>
                      {p.mood ?? 'оценить →'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer quote */}
          <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
            <div style={{ ...serifStyle, fontSize: 18, color: COLORS.inkSoft, lineHeight: 1.4 }}>
              каждый вечер — это кто-то новый,<br />кто станет вашим.
            </div>
          </div>
        </div>

        <TabBar active="cal" />
      </div>
    </PageTransition>
  )
}
