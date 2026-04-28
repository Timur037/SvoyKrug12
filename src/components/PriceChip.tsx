import type { CSSProperties } from 'react'
import { COLORS, sansStyle } from '../theme'

interface PriceChipProps {
  value?: number
  dark?: boolean
  bg?: string
  fg?: string
}

export function PriceChip({
  value,
  dark = false,
  bg,
  fg,
}: PriceChipProps) {
  const isFree = !value || value <= 0
  const bgColor = bg ?? (dark ? 'rgba(245,239,230,0.16)' : COLORS.ink)
  const fgColor = fg ?? COLORS.cream

  const style: CSSProperties = {
    ...sansStyle,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 999,
    background: bgColor,
    color: fgColor,
    fontSize: isFree ? 13 : 14,
    fontWeight: isFree ? 600 : 700,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  }
  return (
    <span style={style}>
      {isFree ? 'бесплатно' : (
        <>{value}<span style={{ fontWeight: 500, opacity: 0.8, marginLeft: 1 }}>₽</span></>
      )}
    </span>
  )
}
