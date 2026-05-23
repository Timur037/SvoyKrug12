import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { COLORS, SHADOWS, RADII, serifStyle, sansStyle, overlineStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { PriceChip } from '../components/PriceChip'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchCircles, fetchUnreviewedPastBooking, submitReport } from '../lib/db'
import type { DbCircle, GenderFilter, DbBookingWithMeetup } from '../lib/db'

import { useUser } from '../context/UserContext'

const CATEGORIES = [
  { id: 'all',       label: 'все',       clr: '26,22,18'   },
  { id: 'УЖИН',      label: 'ужин',      clr: '232,71,44'  },
  { id: 'КОФЕ',      label: 'кофе',      clr: '178,112,44' },
  { id: 'БРАНЧ',     label: 'бранч',     clr: '196,152,32' },
  { id: 'ПРОГУЛКА',  label: 'прогулка',  clr: '45,102,71'  },
  { id: 'НАСТОЛКИ',  label: 'настолки',  clr: '118,82,152' },
]

type GreetingPart = { lead: string; name: string }

function getGreeting(name: string = 'гость', date: Date = new Date()): GreetingPart {
  const h = date.getHours()
  const trimmed = (name || 'гость').trim() || 'гость'
  const display = `${trimmed}.`
  if (h >= 5 && h < 11) return { lead: 'доброе утро,', name: display }
  if (h >= 11 && h < 17) return { lead: 'добрый день,', name: display }
  if (h >= 17 && h < 23) return { lead: 'добрый вечер,', name: display }
  return { lead: 'ночной круг,', name: display }
}

function isToday(c: DbCircle): boolean {
  const t = c.time_short?.toLowerCase() ?? ''
  return t.includes('сегодня')
}

const ALL_GENDER_OPTIONS: { id: GenderFilter | 'all'; label: string }[] = [
  { id: 'all',        label: 'все'       },
  { id: 'mixed',      label: 'свой круг' },
  { id: 'women_only', label: '♀ женский' },
  { id: 'men_only',   label: '♂ мужской' },
  { id: 'pairs',      label: '◎ пары'    },
]

const GENDER_DESC: Partial<Record<GenderFilter | 'all', string>> = {
  mixed:      'мужчины и женщины — подбираем по интересам и возрасту',
  women_only: 'только женщины — другая атмосфера, другой разговор',
  men_only:   'только мужчины — разговор без светских норм',
  pairs:      'три пары за одним столом — парень и девушка, не друзья',
}

// Kind whitelist — padel and future formats won't leak into feed
const VALID_KINDS = ['УЖИН', 'КОФЕ', 'БРАНЧ', 'ПРОГУЛКА', 'НАСТОЛКИ', 'ВЕЧЕР']

const GENDER_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  women_only: { label: '♀ только женщины', bg: 'rgba(210,80,110,0.82)', color: '#fff' },
  men_only:   { label: '♂ только мужчины', bg: 'rgba(50,100,195,0.82)', color: '#fff' },
  pairs:      { label: '◎ вечер пар',      bg: 'rgba(178,112,44,0.82)', color: '#fff' },
}

export function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [genderFilter, setGenderFilter] = useState<GenderFilter | 'all'>('all')
  const [circles, setCircles] = useState<DbCircle[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  const [unreviewedBooking, setUnreviewedBooking] = useState<DbBookingWithMeetup | null | undefined>(undefined)
  const [reviewDismissed, setReviewDismissed] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [supportText, setSupportText] = useState('')
  const [supportSent, setSupportSent] = useState(false)
  const [supportSending, setSupportSending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  // Apply format filter passed from FormatsScreen
  useEffect(() => {
    const fmt = (location.state as { format?: GenderFilter } | null)?.format
    if (fmt) setGenderFilter(fmt)
  }, [location.state])

  useEffect(() => {
    fetchCircles()
      .then((data) => { setCircles(data); setLoaded(true) })
      .catch(() => { setCircles([]); setLoaded(true) })
  }, [])

  useEffect(() => {
    if (!user) return
    fetchUnreviewedPastBooking(user.id)
      .then(setUnreviewedBooking)
      .catch(() => setUnreviewedBooking(null))
  }, [user])

  const userGender = (() => { try { return localStorage.getItem('svoy_krug_gender') ?? '' } catch { return '' } })()

  const genderOptions = ALL_GENDER_OPTIONS.filter((opt) => {
    if (opt.id === 'women_only') return userGender === 'женщина'
    if (opt.id === 'men_only')   return userGender === 'мужчина'
    return true
  })

  const displayCircles = circles
    .filter((c) => VALID_KINDS.some((k) => c.kind.includes(k)))
    .filter((c) => activeCategory === 'all' || c.kind.includes(activeCategory))
    .filter((c) => genderFilter === 'all' || c.gender_filter === genderFilter)

  const greeting = getGreeting(user?.name ?? 'гость')

  function openCircle(id: string) {
    haptic('light')
    try { localStorage.setItem('svoy_krug_last_circle', id) } catch { /* ignore */ }
    navigate('/circle')
  }

  const showSkeleton = !loaded

  return (
    <PageTransition>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        background: COLORS.cream,
        color: COLORS.ink,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Grain opacity={0.25} />

        {/* Ambient warm glow top */}
        <div style={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 480,
          height: 320,
          background: 'radial-gradient(ellipse at center, rgba(232,71,44,0.13) 0%, rgba(244,201,93,0.07) 45%, transparent 72%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <style>{`
          @keyframes pulse-dot {
            0% { box-shadow: 0 0 0 0 rgba(232,71,44,0.55); }
            70% { box-shadow: 0 0 0 9px rgba(232,71,44,0); }
            100% { box-shadow: 0 0 0 0 rgba(232,71,44,0); }
          }
          @keyframes cardIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes heroIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ── Hero ── */}
        <div style={{
          padding: '56px 26px 0',
          position: 'relative',
          zIndex: 2,
          animation: 'heroIn 550ms cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h1 style={{ margin: 0, flex: 1 }}>
              <span style={{ ...serifStyle, display: 'block', fontSize: 44, lineHeight: 0.94, letterSpacing: '-0.025em', color: COLORS.ink }}>
                {greeting.lead}
              </span>
              <span style={{ ...serifStyle, display: 'block', fontSize: 44, lineHeight: 0.94, letterSpacing: '-0.025em', color: COLORS.ink }}>
                {greeting.name}
              </span>
            </h1>

            {/* Top-right buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexShrink: 0 }}>
              {/* Support button */}
              <button
                style={{
                  width: 38, height: 38, borderRadius: RADII.full,
                  background: COLORS.white, border: `1px solid rgba(26,22,18,0.08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: SHADOWS.chip, cursor: 'pointer',
                }}
                onClick={() => { haptic('light'); setShowSupport(true) }}
                aria-label="Поддержка"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke={COLORS.inkSoft} strokeWidth="1.6"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={COLORS.inkSoft} strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="12" cy="17" r="0.8" fill={COLORS.inkSoft}/>
                </svg>
              </button>
              {/* Notification bell */}
              <button
                style={{
                  width: 38, height: 38, borderRadius: RADII.full,
                  background: COLORS.white, border: `1px solid rgba(26,22,18,0.08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: SHADOWS.chip, cursor: 'pointer',
                }}
                onClick={() => haptic('light')}
                aria-label="Уведомления"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={COLORS.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Social proof row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: COLORS.white,
              border: `1px solid rgba(26,22,18,0.07)`,
              borderRadius: RADII.full,
              padding: '7px 13px 7px 10px',
              boxShadow: SHADOWS.chip,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: COLORS.tomato,
                flexShrink: 0,
                animation: 'pulse-dot 2.6s ease-out infinite',
              }} />
              <span style={{ ...sansStyle, fontSize: 12, fontWeight: 600, color: COLORS.ink }}>
                {displayCircles.length}{' '}
                <span style={{ color: COLORS.inkSoft, fontWeight: 500 }}>
                  {displayCircles.length === 1 ? 'круг' : displayCircles.length < 5 ? 'круга' : 'кругов'} на этой неделе
                </span>
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: COLORS.white,
              border: `1px solid rgba(26,22,18,0.07)`,
              borderRadius: RADII.full,
              padding: '7px 13px',
              boxShadow: SHADOWS.chip,
            }}>
              <span style={{ ...sansStyle, fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}>📍 Москва</span>
            </div>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 2,
          paddingLeft: 22,
          paddingRight: 22,
          marginTop: 18,
          marginBottom: 4,
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            const rgb = cat.clr
            return (
              <button
                key={cat.id}
                onClick={() => { haptic('light'); setActiveCategory(cat.id) }}
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: RADII.full,
                  background: isActive ? `rgba(${rgb},0.10)` : 'rgba(26,22,18,0.04)',
                  border: `1.5px solid ${isActive ? `rgba(${rgb},0.28)` : 'transparent'}`,
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isActive ? `rgb(${rgb})` : 'rgba(26,22,18,0.18)',
                  transition: 'background 200ms',
                }} />
                <span style={{
                  ...sansStyle,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? `rgb(${rgb})` : 'rgba(26,22,18,0.45)',
                  WebkitTextFillColor: isActive ? `rgb(${rgb})` : 'rgba(26,22,18,0.45)',
                  whiteSpace: 'nowrap',
                  transition: 'color 200ms',
                  letterSpacing: '-0.01em',
                }}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Format filter toggle ── */}
        <div style={{
          paddingLeft: 22,
          paddingRight: 22,
          marginTop: 10,
          marginBottom: 0,
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            background: 'rgba(26,22,18,0.05)',
            borderRadius: RADII.full,
            padding: 3,
            gap: 2,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            flex: 1,
          }}>
            {genderOptions.map((opt) => {
              const isActive = genderFilter === opt.id
              let activeBg: string = COLORS.ink
              let activeColor: string = COLORS.cream
              if (opt.id === 'women_only') { activeBg = 'rgba(210,80,110,0.90)'; activeColor = '#fff' }
              if (opt.id === 'men_only')   { activeBg = 'rgba(50,100,195,0.90)'; activeColor = '#fff' }
              if (opt.id === 'pairs')      { activeBg = 'rgba(178,112,44,0.90)'; activeColor = '#fff' }
              return (
                <button
                  key={opt.id}
                  onClick={() => { haptic('light'); setGenderFilter(opt.id as GenderFilter | 'all') }}
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    padding: '6px 12px',
                    borderRadius: RADII.full,
                    border: 'none',
                    background: isActive ? activeBg : 'transparent',
                    color: isActive ? activeColor : 'rgba(26,22,18,0.45)',
                    ...sansStyle,
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(0.22,1,0.36,1)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Formats info link */}
          <button
            onClick={() => { haptic('light'); navigate('/formats') }}
            style={{
              WebkitAppearance: 'none',
              appearance: 'none',
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: RADII.full,
              background: 'rgba(26,22,18,0.06)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="О форматах"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={COLORS.inkSoft} strokeWidth="1.6"/>
              <path d="M12 11v5M12 8h.01" stroke={COLORS.inkSoft} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Gender description */}
        {genderFilter !== 'all' && GENDER_DESC[genderFilter] && (
          <div style={{
            ...sansStyle,
            fontSize: 11,
            color: COLORS.inkSoft,
            paddingLeft: 4,
            lineHeight: 1.4,
            animation: 'heroIn 220ms ease both',
          }}>
            {GENDER_DESC[genderFilter]}
          </div>
        )}
        </div>

        {/* ── Unreviewed past meetup banner ── */}
        {unreviewedBooking && !reviewDismissed && (
          <div style={{
            margin: '10px 20px 0',
            borderRadius: 20,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 4px 20px rgba(26,22,18,0.14)',
            animation: 'cardIn 400ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
            {/* Background photo */}
            {unreviewedBooking.meetup.photo && (
              <img
                src={unreviewedBooking.meetup.photo}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) saturate(0.8)' }}
              />
            )}
            {!unreviewedBooking.meetup.photo && (
              <div style={{ position: 'absolute', inset: 0, background: COLORS.ink }} />
            )}
            {/* Gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(244,201,93,0.18) 0%, transparent 60%)' }} />

            <div style={{ position: 'relative', zIndex: 2, padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  ...sansStyle, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: COLORS.honey,
                }}>
                  🌙 тот вечер
                </span>
                <button
                  onClick={() => { haptic('light'); setReviewDismissed(true) }}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(245,239,230,0.50)', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
                  aria-label="закрыть"
                >×</button>
              </div>

              {/* Title */}
              <div>
                <div style={{ ...serifStyle, fontSize: 24, color: COLORS.cream, lineHeight: 1.05, marginBottom: 4 }}>
                  {unreviewedBooking.meetup.title}
                </div>
                <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.60)' }}>
                  {unreviewedBooking.meetup.date_label} · {unreviewedBooking.meetup.place}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  haptic('medium')
                  try { localStorage.setItem('svoy_krug_review_meetup', unreviewedBooking.meetup.id) } catch { /* ignore */ }
                  navigate('/post-event')
                }}
                style={{
                  ...sansStyle,
                  alignSelf: 'flex-start',
                  padding: '10px 20px',
                  borderRadius: 999,
                  background: COLORS.cream,
                  color: COLORS.ink,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.20)',
                }}
              >
                как прошёл вечер?
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={COLORS.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        <div style={{
          padding: '14px 26px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
        }}>
          <span style={{ ...overlineStyle, color: COLORS.inkSoft }}>ближайшие круги</span>
          <button
            style={{
              ...sansStyle,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.tomato,
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
            }}
            onClick={() => { haptic('light'); navigate('/calendar') }}
          >
            все {displayCircles.length}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={COLORS.tomato} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Card list ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          padding: '4px 20px 108px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          position: 'relative',
          zIndex: 2,
        }}>
          {showSkeleton && [0, 1].map((i) => (
            <div
              key={`skeleton-${i}`}
              aria-hidden="true"
              style={{
                height: 240,
                borderRadius: RADII.xl,
                flexShrink: 0,
                background: 'linear-gradient(90deg, #EFE6D8 25%, #F5EFE6 50%, #EFE6D8 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.6s linear infinite',
              }}
            />
          ))}

          {!showSkeleton && displayCircles.map((c, i) => {
            const today = isToday(c)
            const remaining = Math.max(0, c.seats - c.taken)
            const almostFull = remaining <= 2 && remaining > 0
            return (
              <button
                key={c.id}
                onClick={() => openCircle(c.id)}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 244,
                  flexShrink: 0,
                  borderRadius: RADII.xl,
                  overflow: 'hidden',
                  boxShadow: SHADOWS.card,
                  border: '1px solid rgba(26,22,18,0.04)',
                  background: COLORS.ink,
                  padding: 0,
                  display: 'block',
                  textAlign: 'left',
                  cursor: 'pointer',
                  animation: `cardIn 460ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both`,
                }}
                aria-label={`${c.title}, ${c.kind} ${c.time_short}`}
              >
                {/* Photo */}
                <img
                  src={c.photo ?? ''}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'saturate(1.08) brightness(0.88)',
                  }}
                />

                {/* Gradient overlays */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(26,22,18,0.08) 0%, rgba(26,22,18,0.30) 45%, rgba(26,22,18,0.82) 100%)',
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(244,201,93,0.08) 0%, transparent 50%)',
                }} />

                {/* Inner content */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '16px 18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  {/* Top badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    {today && (
                      <span style={{
                        ...sansStyle,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 11px',
                        borderRadius: RADII.full,
                        background: COLORS.tomato,
                        color: COLORS.cream,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.cream, display: 'inline-block', animation: 'pulse-dot 2.2s ease-out infinite' }} />
                        сегодня
                      </span>
                    )}
                    <span style={{
                      ...sansStyle,
                      padding: '5px 11px',
                      borderRadius: RADII.full,
                      background: today ? 'rgba(26,22,18,0.52)' : COLORS.tomato,
                      color: COLORS.cream,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      backdropFilter: today ? 'blur(8px)' : undefined,
                    }}>
                      {c.kind}
                    </span>
                    {GENDER_BADGE[c.gender_filter] && (
                      <span style={{
                        ...sansStyle,
                        padding: '5px 11px',
                        borderRadius: RADII.full,
                        background: GENDER_BADGE[c.gender_filter].bg,
                        color: GENDER_BADGE[c.gender_filter].color,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        backdropFilter: 'blur(8px)',
                      }}>
                        {GENDER_BADGE[c.gender_filter].label}
                      </span>
                    )}
                    {almostFull && (
                      <span style={{
                        ...sansStyle,
                        padding: '5px 11px',
                        borderRadius: RADII.full,
                        background: 'rgba(244,201,93,0.22)',
                        border: '1px solid rgba(244,201,93,0.45)',
                        color: COLORS.honey,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                      }}>
                        последние места
                      </span>
                    )}
                  </div>

                  {/* Bottom info */}
                  <div>
                    {/* Time line */}
                    <div style={{
                      ...sansStyle,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(245,239,230,0.65)',
                      letterSpacing: '0.04em',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                    }}>
                      {c.time_short}
                    </div>

                    {/* Title */}
                    <div style={{
                      ...serifStyle,
                      fontSize: 28,
                      lineHeight: 1.04,
                      color: COLORS.cream,
                      marginBottom: 5,
                      textShadow: '0 2px 10px rgba(0,0,0,0.30)',
                    }}>
                      {c.title}
                    </div>

                    {/* Hint */}
                    <div style={{
                      ...sansStyle,
                      fontSize: 12,
                      color: 'rgba(245,239,230,0.72)',
                      fontWeight: 400,
                      marginBottom: 12,
                      letterSpacing: '-0.01em',
                    }}>
                      {c.hint}
                    </div>

                    {/* Bottom row: seats + price */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Seats taken={c.taken} total={c.seats} dark />
                        <span style={{ ...sansStyle, fontSize: 10, color: 'rgba(245,239,230,0.60)', fontWeight: 500 }}>
                          {remaining} {remaining === 1 ? 'место' : 'мест'} свободно
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <PriceChip value={c.price} dark />
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: RADII.full,
                          background: 'rgba(245,239,230,0.15)',
                          border: '1px solid rgba(245,239,230,0.22)',
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke={COLORS.cream} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Empty state */}
          {!showSkeleton && displayCircles.length === 0 && (
            <div style={{
              padding: '48px 0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{ ...serifStyle, fontSize: 22, color: COLORS.inkSoft }}>кругов пока нет</div>
              <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft }}>
                {circles.length === 0
                  ? 'скоро появятся новые встречи'
                  : 'попробуйте другой формат'}
              </div>
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        <button
          onClick={() => { haptic('medium'); navigate('/build-circle') }}
          aria-label="Предложить вечер"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
            width: 56,
            height: 56,
            borderRadius: RADII.full,
            background: COLORS.tomato,
            color: COLORS.cream,
            border: 'none',
            boxShadow: SHADOWS.fab,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-dot 2.6s ease-out infinite',
            cursor: 'pointer',
            zIndex: 40,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke={COLORS.cream} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        <TabBar active="home" notifDot />

        {/* Support bottom sheet overlay */}
        {showSupport && (
          <div onClick={() => { setShowSupport(false); setSupportSent(false); setSupportText('') }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(26,22,18,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
        )}

        {/* Support bottom sheet */}
        {showSupport && (
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 51,
            background: COLORS.cream, borderRadius: '24px 24px 0 0',
            padding: '20px 22px calc(env(safe-area-inset-bottom,0px) + 28px)',
            boxShadow: '0 -8px 40px rgba(26,22,18,0.18)',
            animation: 'sheetUp 300ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <style>{`@keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,22,18,0.15)', margin: '0 auto 20px' }} />

            {supportSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <div style={{ ...serifStyle, fontSize: 26, color: COLORS.ink, marginBottom: 8 }}>отправлено</div>
                <div style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5 }}>
                  мы получили ваше сообщение и скоро ответим.
                </div>
                <button onClick={() => { setShowSupport(false); setSupportSent(false); setSupportText('') }}
                  style={{ marginTop: 24, width: '100%', padding: '14px', borderRadius: 99, background: COLORS.ink, color: COLORS.cream, border: 'none', ...sansStyle, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  закрыть
                </button>
              </div>
            ) : (
              <>
                <div style={{ ...serifStyle, fontSize: 26, color: COLORS.ink, marginBottom: 6 }}>поддержка</div>
                <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
                  напишите нам — ответим в течение дня.
                </div>
                <textarea
                  value={supportText}
                  onChange={e => setSupportText(e.target.value)}
                  placeholder="опишите вашу проблему или вопрос..."
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px', borderRadius: 16,
                    border: '1.5px solid rgba(26,22,18,0.12)',
                    background: 'rgba(26,22,18,0.03)',
                    ...sansStyle, fontSize: 15, color: COLORS.ink,
                    resize: 'none', outline: 'none', lineHeight: 1.55,
                  }}
                />
                <button
                  disabled={!supportText.trim() || supportSending}
                  onClick={async () => {
                    if (!supportText.trim()) return
                    haptic('medium')
                    setSupportSending(true)
                    try {
                      await submitReport({ userId: user?.id ?? null, meetupId: null, reportedUserId: null, message: supportText.trim(), source: 'home' })
                      setSupportSent(true)
                    } catch { /* ignore */ }
                    finally { setSupportSending(false) }
                  }}
                  style={{
                    marginTop: 12, width: '100%', padding: '15px',
                    borderRadius: 99, border: 'none',
                    background: supportText.trim() ? COLORS.ink : 'rgba(26,22,18,0.12)',
                    color: COLORS.cream, ...sansStyle, fontSize: 15, fontWeight: 700,
                    cursor: supportText.trim() ? 'pointer' : 'default',
                    transition: 'background 200ms',
                  }}>
                  {supportSending ? 'отправляем...' : 'отправить →'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
