import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, sansStyle } from '../theme'
import { haptic } from '../lib/telegram'

type Tab = 'home' | 'cal' | 'me'

interface TabBarProps {
  active: Tab
  notifDot?: boolean
}

interface TabConfig {
  key: Tab
  label: string
  path: string
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'круги',     path: '/home' },
  { key: 'cal',  label: 'мой вечер', path: '/calendar' },
  { key: 'me',   label: 'вы',        path: '/profile' },
]

function HandDrawnCircle({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 64"
      preserveAspectRatio="none"
      fill="none"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <path
        d="M14 34 C 13 14, 36 5, 62 6 C 90 7, 108 16, 107 34 C 106 50, 82 60, 56 59 C 28 58, 13 52, 14 34 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.88"
      />
    </svg>
  )
}

function TabIcon({ tab, color }: { tab: Tab; color: string }) {
  if (tab === 'home') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7"    r="2.8" stroke={color} strokeWidth="1.5" />
      <circle cx="6"  cy="17"   r="2.8" stroke={color} strokeWidth="1.5" />
      <circle cx="18" cy="17"   r="2.8" stroke={color} strokeWidth="1.5" />
    </svg>
  )
  if (tab === 'cal') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.5" />
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function TabBar({ active, notifDot = false }: TabBarProps) {
  const navigate = useNavigate()

  const wrap: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: 'rgba(245,239,230,0.78)',
    backdropFilter: 'blur(20px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
    borderTop: '1px solid rgba(26,22,18,0.07)',
    zIndex: 50,
  }

  const inner: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '10px 18px 14px',
    maxWidth: 520,
    margin: '0 auto',
  }

  const itemStyle = (isActive: boolean): CSSProperties => ({
    ...sansStyle,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    color: isActive ? COLORS.tomato : COLORS.inkSoft,
    fontSize: 11,
    fontWeight: isActive ? 600 : 500,
    letterSpacing: '-0.01em',
    padding: '6px 20px 4px',
    transition: 'color 200ms ease',
    background: 'transparent',
    border: 'none',
    minWidth: 70,
  })

  return (
    <nav style={wrap} aria-label="Главная навигация">
      <div style={inner}>
        {TABS.map((t) => {
          const isActive = t.key === active
          const showDot = notifDot && t.key === 'home'
          const iconColor = isActive ? COLORS.tomato : COLORS.inkSoft
          return (
            <button
              key={t.key}
              style={itemStyle(isActive)}
              onClick={() => { haptic('light'); navigate(t.path) }}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <HandDrawnCircle color={COLORS.tomato} />}
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TabIcon tab={t.key} color={iconColor} />
                {showDot && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -4,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: COLORS.tomato,
                      border: '1.5px solid rgba(245,239,230,0.9)',
                      zIndex: 3,
                    }}
                  />
                )}
              </span>
              <span style={{ position: 'relative', zIndex: 2 }}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
