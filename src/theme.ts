import type { CSSProperties } from 'react'

export const COLORS = {
  cream: '#F5EFE6',
  cream2: '#EFE6D8',
  ink: '#1A1612',
  inkSoft: '#5C544B',
  tomato: '#E8472C',
  tomatoDeep: '#C7361E',
  forest: '#2D4A3E',
  forestDeep: '#1F3328',
  honey: '#F4C95D',
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
