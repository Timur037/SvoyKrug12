import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, sansStyle } from '../theme'
import { Grain } from './Grain'
import { haptic } from '../lib/telegram'

interface OnbShellProps {
  step: number
  total: number
  backTo: string
  children: ReactNode
}

export function OnbShell({ step, total, backTo, children }: OnbShellProps) {
  const navigate = useNavigate()
  const pct = (step / total) * 100

  const header: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    background: 'rgba(245,239,230,0.95)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(26,22,18,0.07)',
  }

  return (
    <div style={{
      position: 'relative',
      background: COLORS.cream,
      color: COLORS.ink,
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Grain opacity={0.28} />

      <div style={header}>
        <div style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
        }}>
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: RADII.full,
              background: 'rgba(26,22,18,0.06)',
              border: '1px solid rgba(26,22,18,0.09)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Назад"
            onClick={() => { haptic('light'); navigate(backTo) }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span style={{ ...sansStyle, fontSize: 11, fontWeight: 700, color: COLORS.inkSoft, letterSpacing: '0.06em' }}>
            {step} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(26,22,18,0.08)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: COLORS.tomato,
            borderRadius: '0 2px 2px 0',
            transition: 'width 400ms cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        paddingTop: 72,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  )
}
