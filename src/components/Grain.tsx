import type { CSSProperties } from 'react'

interface GrainProps {
  opacity?: number
  blend?: CSSProperties['mixBlendMode']
}

export function Grain({ opacity = 1, blend = 'multiply' }: GrainProps) {
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity,
    mixBlendMode: blend,
    backgroundImage:
      'radial-gradient(rgba(26,22,18,0.08) 0.6px, transparent 0.6px)',
    backgroundSize: '4px 4px',
    zIndex: 1,
  }
  return <div style={style} aria-hidden="true" />
}
