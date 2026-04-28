import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { Seats } from '../components/Seats'
import { haptic } from '../lib/telegram'

const WEEK = [
  { d: 'пн', n: 25 },
  { d: 'вт', n: 26 },
  { d: 'ср', n: 27 },
  { d: 'чт', n: 28 },
  { d: 'пт', n: 29, hot: true },
  { d: 'сб', n: 30 },
  { d: 'вс', n: 1 },
]

const PAST = [
  { date: '18 окт', title: 'кофе у Чистых', mood: 'тепло' },
  { date: '4 окт', title: 'прогулка по Неглинке', mood: 'хочу ещё' },
  { date: '21 сен', title: 'ужин у Маросейки', mood: 'тихо' },
]

const UPCOMING_PHOTO = 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&q=80&auto=format&fit=crop'

export function CalendarScreen() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
    overflowY: 'auto',
  }

  return (
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
        </div>

        {/* Week strip */}
        <div style={{
          margin: '14px 22px 24px',
          padding: '14px',
          borderRadius: 18,
          background: '#fff',
          border: '1px solid rgba(26,22,18,0.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {WEEK.map((d) => (
              <button
                key={d.n}
                style={{ textAlign: 'center', background: 'transparent', border: 'none' }}
                onClick={() => {
                  haptic('light')
                  if (d.hot) navigate('/group')
                }}
              >
                <div style={{
                  ...sansStyle,
                  fontSize: 10,
                  fontWeight: 600,
                  color: COLORS.inkSoft,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {d.d}
                </div>
                <div style={{
                  marginTop: 6,
                  width: 30,
                  height: 30,
                  lineHeight: '30px',
                  textAlign: 'center',
                  borderRadius: 99,
                  ...sansStyle,
                  fontSize: 14,
                  fontWeight: 700,
                  marginInline: 'auto',
                  fontVariantNumeric: 'tabular-nums',
                  background: d.hot ? COLORS.tomato : 'transparent',
                  color: d.hot ? COLORS.cream : COLORS.ink,
                }}>
                  {d.n}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Solution B: title above the card, in deep ink italic serif on cream */}
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
            лёгкий вечер на Покровке
          </h2>
        </div>

        {/* Upcoming card — photo + time + CTA only */}
        <button
          style={{
            display: 'block',
            width: 'calc(100% - 44px)',
            margin: '0 22px 16px',
            borderRadius: 24,
            overflow: 'hidden',
            background: COLORS.tomato,
            color: COLORS.cream,
            boxShadow: '0 18px 40px rgba(232,71,44,0.25)',
            position: 'relative',
            border: 'none',
            padding: 0,
            textAlign: 'left',
          }}
          onClick={() => { haptic('medium'); navigate('/group') }}
          aria-label="Открыть детали вечера"
        >
          {/* Photo */}
          <div style={{
            position: 'relative',
            height: 140,
            overflow: 'hidden',
          }}>
            <img
              src={UPCOMING_PHOTO}
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
                пятница · 29 · 19:30
              </div>
              <div style={{
                ...sansStyle,
                fontSize: 13,
                color: 'rgba(245,239,230,0.82)',
                marginTop: 4,
              }}>
                место откроется в пятницу 16:30
              </div>
              <div style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Seats taken={5} total={6} dark />
                <span
                  style={{
                    background: COLORS.ink,
                    color: COLORS.cream,
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: 99,
                    ...sansStyle,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-block',
                  }}
                >
                  детали →
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Past */}
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
          {PAST.map((p, i) => (
            <button
              key={i}
              onClick={() => { haptic('light'); navigate('/post-event') }}
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
              <div style={{
                width: 48,
                ...sansStyle,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.inkSoft,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {p.date}
              </div>
              <div style={{ flex: 1, ...serifStyle, fontSize: 20, color: COLORS.ink }}>
                {p.title}
              </div>
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
            </button>
          ))}
        </div>
      </div>

      <TabBar active="cal" />
    </div>
  )
}
