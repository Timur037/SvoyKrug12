import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const OPTIONS = ['мужчина', 'женщина', 'другое'] as const

const STEP = 1
const TOTAL = 7

export function OnbGender() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(val: string) {
    if (picked) return
    haptic('light')
    setPicked(val)
    try {
      localStorage.setItem('svoy_krug_gender', val)
    } catch {
      // ignore
    }
    setTimeout(() => navigate('/onboarding/age'), 220)
  }

  const root: CSSProperties = {
    position: 'relative',
    background: COLORS.cream,
    color: COLORS.ink,
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
  }
  const header: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    background: 'rgba(245,239,230,0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }
  const headerInner: CSSProperties = {
    position: 'relative',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
  }
  const backBtn: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(26,22,18,0.06)',
    border: '1px solid rgba(26,22,18,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.ink,
  }
  const progressTrack: CSSProperties = {
    height: 3,
    width: '100%',
    background: 'rgba(26,22,18,0.10)',
    overflow: 'hidden',
  }
  const progressFill: CSSProperties = {
    height: '100%',
    width: `${(STEP / TOTAL) * 100}%`,
    background: COLORS.tomato,
    transition: 'width 400ms ease',
  }
  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    padding: '100px 22px 32px',
    overflowY: 'auto',
  }
  const title: CSSProperties = {
    ...serifStyle,
    fontSize: 36,
    lineHeight: 1.05,
    margin: 0,
    color: COLORS.ink,
  }
  const optionsWrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 32,
  }

  return (
    <div style={root}>
      <Grain opacity={0.3} />

      <div style={header}>
        <div style={headerInner}>
          <button
            style={backBtn}
            aria-label="Назад"
            onClick={() => {
              haptic('light')
              navigate('/onboarding/3')
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke={COLORS.ink}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div style={progressTrack}>
          <div style={progressFill} />
        </div>
      </div>

      <div style={content}>
        <h1 style={title}>кто вы?</h1>

        <div style={optionsWrap}>
          {OPTIONS.map((opt) => {
            const selected = picked === opt
            const optStyle: CSSProperties = {
              ...sansStyle,
              width: '100%',
              height: 60,
              borderRadius: 99,
              fontSize: 16,
              fontWeight: 500,
              background: selected ? COLORS.ink : '#fff',
              color: selected ? COLORS.cream : COLORS.ink,
              border: selected
                ? '1.5px solid transparent'
                : '1.5px solid rgba(26,22,18,0.10)',
              transition: 'all 200ms ease',
              cursor: 'pointer',
            }
            return (
              <button key={opt} style={optStyle} onClick={() => pick(opt)}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
