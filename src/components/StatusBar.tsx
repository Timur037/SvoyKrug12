import type { CSSProperties } from 'react'
import { sansStyle } from '../theme'

interface StatusBarProps {
  color?: string
  time?: string
}

export function StatusBar({ color = '#1A1612', time = '9:41' }: StatusBarProps) {
  const wrap: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    padding: '14px 22px 0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    color,
    zIndex: 10,
    pointerEvents: 'none',
  }
  const timeStyle: CSSProperties = {
    ...sansStyle,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  }
  const icons: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  }

  return (
    <div style={wrap} aria-hidden="true">
      <span style={timeStyle}>{time}</span>
      <span style={icons}>
        {/* Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill={color} />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill={color} />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill={color} />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill={color} />
        </svg>
        {/* WiFi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path
            d="M7.5 1.2c2.55 0 4.86 0.97 6.6 2.55"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M2.4 4.55C3.85 3.2 5.6 2.4 7.5 2.4s3.65 0.8 5.1 2.15"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M4.4 6.7C5.25 5.95 6.33 5.5 7.5 5.5s2.25 0.45 3.1 1.2"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="7.5" cy="9.2" r="1.1" fill={color} />
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="3"
            stroke={color}
            strokeOpacity="0.55"
            fill="none"
          />
          <rect x="2" y="2" width="19" height="8" rx="1.6" fill={color} />
          <rect
            x="23.5"
            y="3.5"
            width="2"
            height="5"
            rx="1"
            fill={color}
            fillOpacity="0.55"
          />
        </svg>
      </span>
    </div>
  )
}
