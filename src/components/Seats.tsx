import type { CSSProperties } from 'react'

interface SeatsProps {
  taken: number
  total: number
  dark?: boolean
  color?: string
  emptyColor?: string
  size?: number
}

export function Seats({
  taken,
  total,
  dark = false,
  color,
  emptyColor,
  size = 8,
}: SeatsProps) {
  const fillColor = color ?? (dark ? '#F5EFE6' : '#1A1612')
  const borderColor = emptyColor ?? (dark ? 'rgba(245,239,230,0.55)' : 'rgba(26,22,18,0.35)')

  const wrap: CSSProperties = {
    display: 'inline-flex',
    gap: 5,
    alignItems: 'center',
  }
  const clampedTaken = Math.max(0, Math.min(total, taken))
  return (
    <span style={wrap} aria-label={`${clampedTaken} из ${total} мест занято`}>
      {Array.from({ length: total }).map((_, i) => {
        const isTaken = i < clampedTaken
        const dot: CSSProperties = {
          width: size,
          height: size,
          borderRadius: 99,
          background: isTaken ? fillColor : 'transparent',
          border: isTaken ? 'none' : `1.4px solid ${borderColor}`,
          display: 'inline-block',
          flexShrink: 0,
        }
        return <span key={i} style={dot} />
      })}
    </span>
  )
}
