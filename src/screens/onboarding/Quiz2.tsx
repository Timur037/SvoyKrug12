import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'

const QUIZ_STEP = 4
const QUIZ_TOTAL = 4

export function Quiz2() {
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState(true)

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflow: 'hidden',
  }
  const content: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    padding: '78px 22px 28px',
    display: 'flex',
    flexDirection: 'column',
  }
  const heading: CSSProperties = {
    fontSize: 42,
    lineHeight: 1.04,
    margin: '6px 0 26px',
  }
  const card: CSSProperties = {
    background: '#ffffff',
    borderRadius: 26,
    padding: '26px 24px 26px',
    border: '1px solid rgba(26,22,18,0.06)',
    boxShadow: '0 14px 40px rgba(26,22,18,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  }
  const labelBadge: CSSProperties = {
    ...sansStyle,
    color: COLORS.tomato,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  }
  const cardHero: CSSProperties = {
    ...serifStyle,
    fontSize: 30,
    lineHeight: 1.1,
    margin: 0,
    color: COLORS.ink,
  }
  const toggleWrap: CSSProperties = {
    height: 64,
    background: enabled ? COLORS.tomato : 'rgba(26,22,18,0.12)',
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 22px 0 24px',
    transition: 'background 220ms ease',
    cursor: 'pointer',
    width: '100%',
  }
  const toggleText: CSSProperties = {
    ...sansStyle,
    color: COLORS.cream,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  }
  const toggleKnob: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: COLORS.cream,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: enabled ? 'translateX(0)' : 'translateX(-2px)',
    transition: 'transform 220ms ease',
  }
  const disclaimer: CSSProperties = {
    ...sansStyle,
    fontSize: 12,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
    marginTop: 16,
  }
  const bottomRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 24,
  }
  const backBtn: CSSProperties = {
    ...sansStyle,
    color: COLORS.inkSoft,
    fontSize: 14,
    fontWeight: 500,
  }
  const finishBtn: CSSProperties = {
    ...sansStyle,
    background: COLORS.ink,
    color: COLORS.cream,
    padding: '16px 24px',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  }

  function finish() {
    haptic('medium')
    // Don't set onboarded flag here — will be set in OnbDone
    navigate('/onboarding/hobbies')
  }

  return (
    <div style={root}>
      <Grain opacity={0.5} />
      <div style={content}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(26,22,18,0.10)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(QUIZ_STEP / QUIZ_TOTAL) * 100}%`, background: COLORS.tomato, transition: 'width 400ms ease' }} />
          </div>
          <span style={{ ...sansStyle, fontSize: 11, color: COLORS.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase' as const, flexShrink: 0 }}>
            {QUIZ_STEP} / {QUIZ_TOTAL}
          </span>
        </div>

        <h2 style={heading}>
          <span style={serifStyle}>уточним </span>
          <span style={{ ...sansStyle, fontWeight: 700 }}>главное.</span>
        </h2>

        <div style={card}>
          <span style={labelBadge}>только дружба</span>
          <h3 style={cardHero}>
            свидания — нет.
            <br />
            дружба — да.
            <br />
            без подтекста.
          </h3>

          <button
            style={toggleWrap}
            onClick={() => {
              haptic('light')
              setEnabled((v) => !v)
            }}
          >
            <span style={toggleText}>
              {enabled ? 'включено' : 'выключено'}
            </span>
            <span style={toggleKnob}>
              {enabled ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke={COLORS.tomato}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke={COLORS.inkSoft}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </button>

          <p style={disclaimer}>
            если кто-то ведёт себя как на свидании — мы переводим в другую
            компанию. ваш круг — это про дружбу.
          </p>
        </div>

        <div style={bottomRow}>
          <button
            style={backBtn}
            onClick={() => {
              haptic('light')
              navigate('/onboarding/quiz5')
            }}
          >
            ← назад
          </button>
          <button style={finishBtn} onClick={finish}>
            готово
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke={COLORS.cream}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
