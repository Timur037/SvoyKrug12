import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { PriceChip } from '../components/PriceChip'
import { haptic } from '../lib/telegram'
import { fetchCircles } from '../lib/db'
import type { DbCircle } from '../lib/db'

const MOODS = [
  { id: 'live', label: 'оживлённо', bg: COLORS.tomato, fg: COLORS.cream },
  { id: 'calm', label: 'спокойно', bg: COLORS.ink, fg: COLORS.cream },
  { id: 'theme', label: 'с темой', bg: '#fff', fg: COLORS.ink },
  { id: 'morning', label: 'утро', bg: '#fff', fg: COLORS.ink },
] as const

export function HomeScreen() {
  const [activeMood, setActiveMood] = useState<string>('live')
  const [circles, setCircles] = useState<DbCircle[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchCircles().then(setCircles).catch(console.error)
  }, [])

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
    // Persist last-tapped circle id (for future detail screens to read).
    try { localStorage.setItem('svoy_krug_last_circle', id) } catch { /* ignore */ }
    navigate('/group')
  }

  return (
    <div style={root}>
      <Grain opacity={0.3} />
      <style>{`
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(232,71,44,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(232,71,44,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,71,44,0); }
        }
      `}</style>

      {/* Greeting */}
      <div style={{ padding: '60px 28px 0' }}>
        <h1 style={{ margin: 0, fontSize: 42, lineHeight: 0.96, letterSpacing: '-0.025em', color: COLORS.ink }}>
          <span style={serifStyle}>добрый вечер,</span>
          <br />
          <span style={serifStyle}>Артём.</span>
        </h1>
        <div style={{ ...sansStyle, fontSize: 13, color: COLORS.inkSoft, marginTop: 8, fontWeight: 500 }}>
          в Москве{' '}
          <span style={{ color: COLORS.ink, fontWeight: 700 }}>3 круга</span> на этой неделе
        </div>
      </div>

      {/* Mood chips */}
      <div style={{
        padding: '18px 28px 6px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {MOODS.map((m) => {
          const isActive = activeMood === m.id
          return (
            <button
              key={m.id}
              style={{
                ...sansStyle,
                padding: '8px 14px',
                borderRadius: 99,
                background: isActive ? m.bg : '#fff',
                color: isActive ? m.fg : COLORS.ink,
                fontSize: 12,
                fontWeight: 600,
                border: isActive ? '1px solid transparent' : '1px solid rgba(26,22,18,0.12)',
                flexShrink: 0,
                transition: 'all 220ms ease',
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
          все 3 →
        </button>
      </div>

      {/* Stacked card deck */}
      <div style={{ flex: 1, position: 'relative', margin: '14px 22px 0', paddingBottom: 90 }}>
        {circles.map((c, i) => (
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
              boxShadow: '0 14px 38px rgba(26,22,18,0.18), 0 4px 10px rgba(26,22,18,0.08)',
              border: '1px solid rgba(26,22,18,0.06)',
              background: '#000',
              zIndex: 10 - i,
              padding: 0,
              display: 'block',
              textAlign: 'left',
              cursor: 'pointer',
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
              <div>
                <span style={{
                  ...sansStyle,
                  padding: '5px 10px',
                  borderRadius: 99,
                  background: COLORS.tomato,
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
                  <Seats taken={c.taken} total={c.seats} dark />
                  <PriceChip value={c.price} dark />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* FAB — propose an evening */}
      <button
        onClick={() => { haptic('medium'); navigate('/build-circle') }}
        aria-label="Предложить вечер"
        style={{
          position: 'fixed',
          right: 22,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
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
          zIndex: 60,
          animation: 'pulse-dot 2.4s ease-out infinite',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={COLORS.cream} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      <TabBar active="home" />
    </div>
  )
}
