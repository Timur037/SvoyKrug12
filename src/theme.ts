import type { CSSProperties } from 'react'

export const COLORS = {
  cream: '#F5EFE6',
  cream2: '#EFE6D8',
  cream3: '#E8DDD0',
  ink: '#1A1612',
  inkSoft: '#5C544B',
  inkSubtle: 'rgba(26,22,18,0.45)',
  tomato: '#E8472C',
  tomatoDeep: '#C7361E',
  tomatoLight: 'rgba(232,71,44,0.12)',
  forest: '#2D4A3E',
  forestDeep: '#1F3328',
  honey: '#F4C95D',
  honeyDeep: '#D4A940',
  white: '#FFFFFF',
} as const

export const SHADOWS = {
  card: '0 20px 52px rgba(26,22,18,0.18), 0 4px 16px rgba(26,22,18,0.08)',
  cardHover: '0 28px 60px rgba(26,22,18,0.24), 0 6px 20px rgba(26,22,18,0.10)',
  cta: '0 12px 32px rgba(232,71,44,0.42), 0 4px 12px rgba(232,71,44,0.18)',
  ctaForest: '0 12px 32px rgba(45,74,62,0.42)',
  chip: '0 2px 8px rgba(26,22,18,0.08)',
  panel: '0 2px 16px rgba(26,22,18,0.06)',
  panelLg: '0 8px 32px rgba(26,22,18,0.10)',
  fab: '0 14px 36px rgba(232,71,44,0.40), 0 4px 12px rgba(26,22,18,0.16)',
} as const

export const RADII = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
} as const

export const serifStyle: CSSProperties = {
  fontFamily: '"Instrument Serif", "Times New Roman", serif',
  fontStyle: 'italic',
  fontWeight: 400,
  letterSpacing: '-0.01em',
}

export const sansStyle: CSSProperties = {
  fontFamily: '"Inter Tight", system-ui, sans-serif',
  letterSpacing: '-0.02em',
}

export const caveatStyle: CSSProperties = {
  fontFamily: '"Caveat", "Instrument Serif", serif',
  fontWeight: 600,
}

export const overlineStyle: CSSProperties = {
  ...sansStyle,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
} as CSSProperties
