import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const STEP = 2
const TOTAL = 7
const MIN_AGE = 18
const MAX_AGE = 65
const DEFAULT_AGE = 27

export function OnbAge() {
  const navigate = useNavigate()
  const [age, setAge] = useState<number>(DEFAULT_AGE)

  function decrement() {
    if (age <= MIN_AGE) return
    haptic('light')
    setAge((v) => Math.max(MIN_AGE, v - 1))
  }

  function increment() {
    if (age >= MAX_AGE) return
    haptic('light')
    setAge((v) => Math.min(MAX_AGE, v + 1))
  }

  function next() {
    haptic('medium')
    try {
      localStorage.setItem('svoy_krug_age', String(age))
    } catch {
      // ignore
    }
    navigate('/onboarding/work')
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
    padding: '100px 22px 100px',
    overflowY: 'auto',
  }
  const title: CSSProperties = {
    ...serifStyle,
    fontSize: 36,
    lineHeight: 1.05,
    margin: 0,
    marginBottom: 48,
    color: COLORS.ink,
  }
  const stepperWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  }
  const stepperBtn: CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#fff',
    border: '1.5px solid rgba(26,22,18,0.12)',
    ...sansStyle,
    fontSize: 24,
    fontWeight: 300,
    color: COLORS.ink,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
  const ageDisplay: CSSProperties = {
    ...serifStyle,
    fontSize: 96,
    lineHeight: 1,
    color: COLORS.tomato,
    minWidth: 120,
    textAlign: 'center',
  }
  const helperText: CSSProperties = {
    ...sansStyle,
    fontSize: 13,
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginTop: 20,
  }
  const ctaWrap: CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    padding: '16px 22px calc(env(safe-area-inset-bottom, 0px) + 16px)',
    background: 'rgba(245,239,230,0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  }
  const ctaBtn: CSSProperties = {
    ...sansStyle,
    width: '100%',
    height: 56,
    borderRadius: 99,
    fontSize: 15,
    fontWeight: 700,
    background: COLORS.tomato,
    color: COLORS.cream,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 200ms ease',
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
              navigate('/onboarding/gender')
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
        <h1 style={title}>сколько вам лет?</h1>

        <div style={stepperWrap}>
          <button
            style={stepperBtn}
            onClick={decrement}
            aria-label="Уменьшить возраст"
            disabled={age <= MIN_AGE}
          >
            —
          </button>
          <span style={ageDisplay}>{age}</span>
          <button
            style={stepperBtn}
            onClick={increment}
            aria-label="Увеличить возраст"
            disabled={age >= MAX_AGE}
          >
            +
          </button>
        </div>

        <div style={helperText}>от 18 до 65 лет</div>
      </div>

      <div style={ctaWrap}>
        <button style={ctaBtn} onClick={next}>
          дальше →
        </button>
      </div>
    </div>
  )
}
