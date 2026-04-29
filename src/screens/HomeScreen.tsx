import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
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

const MOODS = [
  { id: 'live', label: 'оживлённо', bg: COLORS.tomato, fg: COLORS.cream },
  { id: 'calm', label: 'спокойно', bg: COLORS.ink, fg: COLORS.cream },
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

function getTimeGradient(h: number): string {
  if (h >= 5 && h < 9)   return 'radial-gradient(ellipse at 55% 0%, rgba(244,201,93,0.28) 0%, transparent 65%)'
  if (h >= 9 && h < 17)  return 'none'
  if (h >= 17 && h < 21) return 'radial-gradient(ellipse at 50% 0%, rgba(232,71,44,0.12) 0%, rgba(244,201,93,0.08) 40%, transparent 70%)'
  return 'radial-gradient(ellipse at 50% 0%, rgba(26,22,18,0.10) 0%, transparent 60%)'
}

function isToday(c: DbCircle): boolean {
  const t = c.time_short?.toLowerCase() ?? ''
  return t.includes('сегодня')
}

export function HomeScreen() {
  const [activeMood, setActiveMood] = useState<string>('live')
  const [_circles, setCircles] = useState<DbCircle[]>([])
  const [loaded, setLoaded] = useState<boolean>(true)
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    fetchCircles()
      .then((data) => {
        setCircles(data)
        setLoaded(true)
      })
      .catch((err) => {
        console.error(err)
        setLoaded(true)
      })
  }, [])

  const displayCircles = MOCK_CIRCLES

  const greeting = getGreeting(user?.name ?? 'гость')
  const timeGradient = getTimeGradient(new Date().getHours())

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  function openCircle(id: string) {
    haptic('light')
    try { localStorage.setItem('svoy_krug_last_circle', id) } catch { /* ignore */ }
    navigate('/circle')
  }

  const showSkeleton = !loaded

  return (
    <PageTransition>
      <div style={root}>
        <Grain opacity={0.3} />
        {timeGradient !== 'none' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 280,
            background: timeGradient,
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        )}
        <style>{`
          @keyframes pulse-dot {
            0% { box-shadow: 0 0 0 0 rgba(232,71,44,0.55); }
            70% { box-shadow: 0 0 0 8px rgba(232,71,44,0); }
            100% { box-shadow: 0 0 0 0 rgba(232,71,44,0); }
          }
          @keyframes cardIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Greeting */}
        <div style={{ padding: '60px 28px 0', position: 'relative', zIndex: 2 }}>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 0.96, letterSpacing: '-0.025em', color: COLORS.ink }}>
            <span style={serifStyle}>{greeting.lead}</span>
            <br />
            <span style={serifStyle}>{greeting.name}</span>
          </h1>
          <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginTop: 8, fontWeight: 500 }}>
            {!loaded ? (
              <>ищем вечера в Москве...</>
            ) : (
              <>в Москве{' '}
                <span style={{ color: COLORS.ink, fontWeight: 700 }}>
                  {displayCircles.length} {displayCircles.length === 1 ? 'круг' : displayCircles.length < 5 ? 'круга' : 'кругов'}
                </span>{' '}на этой неделе</>
            )}
          </div>
        </div>

        {/* Mood chips */}
        <div style={{
          padding: '18px 28px 6px',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'relative',
          zIndex: 2,
        }}>
          {MOODS.map((m) => {
            const isActive = activeMood === m.id
            return (
              <button
                key={m.id}
                style={{
                  ...sansStyle,
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '9px 16px',
                  borderRadius: 99,
                  background: isActive ? m.bg : 'rgba(255,255,255,0.85)',
                  color: isActive ? m.fg : COLORS.ink,
                  fontSize: 12,
                  fontWeight: 600,
                  border: isActive ? '1px solid transparent' : '1px solid rgba(26,22,18,0.10)',
                  flexShrink: 0,
                  transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: isActive ? '0 6px 16px rgba(26,22,18,0.15)' : '0 2px 6px rgba(26,22,18,0.06)',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                }}
                onClick={() => { haptic('light'); setActiveMood(m.id) }}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Section title */}
        <div style={{
          padding: '18px 28px 6px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}>
          <span style={{
            ...sansStyle,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: COLORS.inkSoft,
            textTransform: 'uppercase',
          }}>ближайшие круги</span>
          <button
            style={{
              ...sansStyle,
              fontSize: 12,
              color: COLORS.tomato,
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
            }}
            onClick={() => { haptic('light'); navigate('/calendar') }}
          >
            все {displayCircles.length} →
          </button>
        </div>

        {/* Stacked card deck */}
        <div style={{
          flex: 1,
          position: 'relative',
          margin: '14px 22px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          minHeight: displayCircles.length * 72 + 240 + 90,
          paddingBottom: 90,
        }}>
          {showSkeleton && (
            <>
              {[0, 1].map((i) => (
                <div
                  key={`skeleton-${i}`}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 8 + i * 72,
                    height: 240,
                    borderRadius: 24,
                    border: '1px solid rgba(26,22,18,0.06)',
                    boxShadow: '0 14px 38px rgba(26,22,18,0.10)',
                    background: 'linear-gradient(90deg, #EFE6D8 25%, #F5EFE6 50%, #EFE6D8 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.6s linear infinite',
                    zIndex: 10 - i,
                  }}
                />
              ))}
            </>
          )}

          {!showSkeleton && displayCircles.map((c, i) => {
            const today = isToday(c)
            const remaining = Math.max(0, c.seats - c.taken)
            return (
              <button
                key={c.id}
                onClick={() => openCircle(c.id)}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 8 + i * 72,
                  height: 240,
                  borderRadius: 24,
                  overflow: 'hidden',
                  transform: `rotate(${c.tilt}deg)`,
                  boxShadow: '0 16px 42px rgba(26,22,18,0.20), 0 4px 12px rgba(26,22,18,0.08)',
                  border: '1px solid rgba(26,22,18,0.05)',
                  background: '#000',
                  zIndex: 10 - i,
                  padding: 0,
                  display: 'block',
                  textAlign: 'left',
                  cursor: 'pointer',
                  animation: `cardIn 400ms ease ${i * 80}ms both`,
                }}
                aria-label={`${c.title}, ${c.kind} ${c.time_short}`}
              >
                <img
                  src={c.photo ?? ''}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'saturate(1.05) brightness(0.92) sepia(0.06)',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(232,71,44,0) 30%, rgba(26,22,18,0.72) 100%)',
                }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(244,201,93,0.10), rgba(232,71,44,0.06))',
                  mixBlendMode: 'soft-light' as const,
                }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: COLORS.cream,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {today && (
                      <span style={{
                        ...sansStyle,
                        padding: '5px 10px',
                        borderRadius: 99,
                        background: COLORS.tomato,
                        color: COLORS.cream,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: COLORS.cream,
                          display: 'inline-block',
                        }} />
                        сегодня
                      </span>
                    )}
                    <span style={{
                      ...sansStyle,
                      padding: '5px 10px',
                      borderRadius: 99,
                      background: today ? 'rgba(26,22,18,0.55)' : COLORS.tomato,
                      color: COLORS.cream,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                    }}>
                      {c.kind}
                    </span>
                  </div>
                  <div>
                    <div style={{
                      ...serifStyle,
                      fontSize: 30,
                      lineHeight: 1.02,
                      color: COLORS.cream,
                      marginBottom: 6,
                      textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                    }}>
                      {c.title}
                    </div>
                    <div style={{
                      ...sansStyle,
                      fontSize: 12,
                      color: 'rgba(245,239,230,0.78)',
                      fontWeight: 500,
                      marginBottom: 10,
                    }}>
                      {c.hint}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Seats taken={c.taken} total={c.seats} dark />
                        <span style={{
                          ...sansStyle,
                          fontSize: 10,
                          color: 'rgba(245,239,230,0.70)',
                          fontWeight: 500,
                        }}>
                          {remaining} {remaining === 1 ? 'место' : 'мест'} осталось
                        </span>
                      </div>
                      <PriceChip value={c.price} dark />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* FAB — propose an evening */}
        <div
          style={{
            position: 'fixed',
            right: 18,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 60,
          }}
        >
          <button
            onClick={() => { haptic('light'); navigate('/build-circle') }}
            style={{
              ...sansStyle,
              background: COLORS.ink,
              color: COLORS.cream,
              fontSize: 12,
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: 99,
              border: 'none',
              boxShadow: '0 6px 16px rgba(26,22,18,0.18)',
              cursor: 'pointer',
            }}
          >
            предложить вечер
          </button>
          <button
            onClick={() => { haptic('medium'); navigate('/build-circle') }}
            aria-label="Предложить вечер"
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: COLORS.tomato,
              color: COLORS.cream,
              border: 'none',
              boxShadow: '0 14px 30px rgba(232,71,44,0.45), 0 4px 12px rgba(26,22,18,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse-dot 2.4s ease-out infinite',
              cursor: 'pointer',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke={COLORS.cream} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <TabBar active="home" notifDot />
      </div>
    </PageTransition>
  )
}
