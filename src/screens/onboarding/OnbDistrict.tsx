import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const STEP = 4
const TOTAL = 7

const DISTRICTS: string[] = [
  'Центр',
  'Север',
  'Северо-Восток',
  'Восток',
  'Юго-Восток',
  'Юг',
  'Юго-Запад',
  'Запад',
  'Северо-Запад',
  'Подмосковье',
]

export function OnbDistrict() {
  const navigate = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)

  function pick(val: string) {
    if (picked) return
    haptic('light')
    setPicked(val)
    try {
      localStorage.setItem('svoy_krug_district', val)
    } catch {
      // ignore
    }
    setTimeout(() => navigate('/onboarding/quiz1'), 220)
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
    marginBottom: 8,
    color: COLORS.ink,
  }
  const sub: CSSProperties = {
    ...sansStyle,
    fontSize: 14,
    color: COLORS.inkSoft,
    margin: 0,
  }
  const tagsWrap: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
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
              navigate('/onboarding/work')
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
        <h1 style={title}>где живёте?</h1>
        <p style={sub}>выберите район Москвы</p>

        <div style={tagsWrap}>
          {DISTRICTS.map((label) => {
            const selected = picked === label
            const tagStyle: CSSProperties = {
              ...sansStyle,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '11px 20px',
              borderRadius: 99,
              fontSize: 15,
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
              <button key={label} style={tagStyle} onClick={() => pick(label)}>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
