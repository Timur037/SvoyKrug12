import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, sansStyle } from '../theme'
import { haptic } from '../lib/telegram'

type Tab = 'home' | 'cal' | 'me'

interface TabBarProps {
  active: Tab
}

interface TabConfig {
  key: Tab
  label: string
  path: string
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'круги', path: '/home' },
  { key: 'cal', label: 'мой вечер', path: '/calendar' },
  { key: 'me', label: 'вы', path: '/profile' },
]

function HandDrawnCircle({ color }: { color: string }) {
  // Hand-drawn ellipse around the active label.
  // viewBox roughly matches a label of width ~80px, height ~28px.
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 110 40"
      preserveAspectRatio="none"
      fill="none"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <path
        d="M14 22 C 14 8, 38 4, 60 5 C 86 6, 102 12, 100 22 C 98 32, 76 36, 52 35 C 28 34, 12 30, 14 22 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.92"
      />
    </svg>
  )
}

export function TabBar({ active }: TabBarProps) {
  const navigate = useNavigate()

  const wrap: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: 'rgba(245, 239, 230, 0.72)',
    backdropFilter: 'blur(18px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
    borderTop: '1px solid rgba(26,22,18,0.06)',
    zIndex: 50,
  }
  const inner: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '14px 18px 18px',
    maxWidth: 520,
    margin: '0 auto',
  }

  const itemStyle = (isActive: boolean): CSSProperties => ({
    ...sansStyle,
    position: 'relative',
    color: isActive ? COLORS.tomato : COLORS.inkSoft,
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    letterSpacing: '-0.01em',
    padding: '8px 14px',
    transition: 'color 220ms ease',
    textTransform: 'lowercase',
    background: 'transparent',
    border: 'none',
  })

  return (
    <nav style={wrap} aria-label="Главная навигация">
      <div style={inner}>
        {TABS.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              style={itemStyle(isActive)}
              onClick={() => {
                haptic('light')
                navigate(t.path)
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <HandDrawnCircle color={COLORS.tomato} />}
              <span style={{ position: 'relative', zIndex: 2 }}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
