import type { CSSProperties } from 'react'
import { COLORS, sansStyle } from '../theme'

interface PriceChipProps {
  value?: number
  dark?: boolean
  bg?: string
  fg?: string
}

export function PriceChip({ value, dark = false, bg, fg }: PriceChipProps) {
  const isFree = !value || value <= 0

  let bgColor: string
  let fgColor: string

  if (bg) {
    bgColor = bg
    fgColor = fg ?? COLORS.cream
  } else if (isFree) {
    bgColor = dark ? 'rgba(244,201,93,0.22)' : COLORS.honey
    fgColor = COLORS.ink
  } else {
    bgColor = dark ? 'rgba(245,239,230,0.16)' : COLORS.ink
    fgColor = fg ?? COLORS.cream
  }

  const style: CSSProperties = {
    ...sansStyle,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 999,
    background: bgColor,
    color: fgColor,
    fontSize: isFree ? 12 : 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: isFree ? '0.01em' : '-0.02em',
  }

  return (
    <span style={style}>
      {isFree ? 'бесплатно' : (
        <>{value}<span style={{ fontWeight: 500, opacity: 0.72, marginLeft: 1, fontSize: 12 }}>₽</span></>
      )}
    </span>
  )
}
