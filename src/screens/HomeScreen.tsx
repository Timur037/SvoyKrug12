import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, SHADOWS, RADII, serifStyle, sansStyle, overlineStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { PriceChip } from '../components/PriceChip'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchCircles } from '../lib/db'
import type { DbCircle } from '../lib/db'
import { MOCK_CIRCLES } from '../lib/mockCircles'
import { useUser } from '../context/UserContext'

const CATEGORIES = [
  { id: 'all',      label: 'все',       emoji: '' },
  { id: 'УЖИН',     label: 'ужин',      emoji: '🍽' },
  { id: 'КОФЕ',     label: 'кофе',      emoji: '☕' },
  { id: 'БРАНЧ',    label: 'бранч',     emoji: '🥐' },
  { id: 'ПРОГУЛКА', label: 'прогулка',  emoji: '🌿' },
  { id: 'НАСТОЛКИ', label: 'настолки',  emoji: '🎲' },
  { id: 'ВЕЧЕР',    label: 'вечер',     emoji: '🕯' },
] as const

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

export function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [_circles, setCircles] = useState<DbCircle[]>([])
  const [loaded, setLoaded] = useState<boolean>(true)
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    fetchCircles()
      .then((data) => { setCircles(data); setLoaded(true) })
      .catch((err) => { console.error(err); setLoaded(true) })
  }, [])

  const displayCircles = activeCategory === 'all'
    ? MOCK_CIRCLES
    : MOCK_CIRCLES.filter((c) => c.kind === activeCategory)

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

            {/* Notification bell */}
            <button
              style={{
                marginTop: 4,
                width: 38,
                height: 38,
                borderRadius: RADII.full,
                background: COLORS.white,
                border: `1px solid rgba(26,22,18,0.08)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: SHADOWS.chip,
                flexShrink: 0,
              }}
              onClick={() => haptic('light')}
              aria-label="Уведомления"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={COLORS.inkSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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
          padding: '18px 0 4px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'relative',
          zIndex: 2,
          paddingLeft: 26,
          paddingRight: 26,
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                style={{
                  ...sansStyle,
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: RADII.full,
                  background: isActive ? COLORS.ink : COLORS.white,
                  color: isActive ? COLORS.cream : COLORS.ink,
                  WebkitTextFillColor: isActive ? COLORS.cream : COLORS.ink,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  border: isActive ? '1.5px solid transparent' : `1.5px solid rgba(26,22,18,0.09)`,
                  flexShrink: 0,
                  transition: 'all 200ms cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: isActive ? '0 4px 14px rgba(26,22,18,0.20)' : SHADOWS.chip,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  cursor: 'pointer',
                }}
                onClick={() => { haptic('light'); setActiveCategory(cat.id) }}
              >
                {cat.emoji && <span aria-hidden="true" style={{ fontSize: 14 }}>{cat.emoji}</span>}
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* ── Section label ── */}
        <div style={{
          padding: '16px 26px 8px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
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
              <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft }}>попробуйте другой формат</div>
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
      </div>
    </PageTransition>
  )
}
