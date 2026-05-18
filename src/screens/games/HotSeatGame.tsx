import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle, overlineStyle } from '../../theme'
import { haptic } from '../../lib/telegram'

type Phase = 'setup' | 'between' | 'playing' | 'done'

const MIN_PLAYERS = 4
const MAX_PLAYERS = 6
const ROUND_SECONDS = 120

export function HotSeatGame() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('setup')
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)

  const timerRef = useRef<number | null>(null)

  const advanceRef = useRef<() => void>(() => {})
  advanceRef.current = advance

  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          haptic('heavy')
          advanceRef.current()
          return 0
        }
        if (s === 30 || s === 10) haptic('light')
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase, currentPlayer])

  function start() {
    haptic('medium')
    setCurrentPlayer(1)
    setSecondsLeft(ROUND_SECONDS)
    setPhase('playing')
  }

  function advance() {
    if (currentPlayer >= playerCount) {
      setPhase('done')
      return
    }
    setCurrentPlayer((p) => p + 1)
    setSecondsLeft(ROUND_SECONDS)
    setPhase('between')
  }

  function nextPlayer() {
    haptic('medium')
    setSecondsLeft(ROUND_SECONDS)
    setPhase('playing')
  }

  function skip() {
    haptic('light')
    advance()
  }

  function restart() {
    haptic('light')
    setCurrentPlayer(1)
    setSecondsLeft(ROUND_SECONDS)
    setPhase('setup')
  }

  const root: CSSProperties = {
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.ink,
    color: COLORS.cream,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 22px 28px',
    boxSizing: 'border-box',
    position: 'relative',
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 56,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(245,239,230,0.10)',
    border: '1px solid rgba(245,239,230,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.cream,
    zIndex: 30,
  }

  const primaryBtn: CSSProperties = {
    ...sansStyle,
    width: '100%',
    background: COLORS.tomato,
    color: COLORS.cream,
    border: 'none',
    padding: '15px',
    borderRadius: RADII.full,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(232,71,44,0.35)',
  }

  const secondaryBtn: CSSProperties = {
    ...sansStyle,
    width: '100%',
    background: 'rgba(245,239,230,0.10)',
    color: COLORS.cream,
    border: '1px solid rgba(245,239,230,0.18)',
    padding: '14px',
    borderRadius: RADII.full,
    fontSize: 14,
    fontWeight: 700,
  }

  const timeLeftPct = secondsLeft / ROUND_SECONDS

  return (
    <div style={root}>
      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ marginLeft: 52, marginBottom: 8 }}>
        <div style={{ ...overlineStyle, color: COLORS.honey }}>🔥 Горячий стул</div>
      </div>

      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px' }}>
              сколько вас<br />за столом?
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 28px' }}>
              Каждый по очереди садится «на горячий стул» на 2 минуты. Остальные задают любые вопросы — он отвечает честно.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((n) => {
                const active = playerCount === n
                return (
                  <button
                    key={n}
                    onClick={() => { haptic('light'); setPlayerCount(n) }}
                    style={{
                      ...sansStyle,
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      border: active ? `2px solid ${COLORS.honey}` : '1px solid rgba(245,239,230,0.20)',
                      background: active ? 'rgba(244,201,93,0.18)' : 'rgba(245,239,230,0.05)',
                      color: COLORS.cream,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>
          <button style={primaryBtn} onClick={start}>Начать →</button>
        </div>
      )}

      {phase === 'between' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 12 }}>
              {currentPlayer} из {playerCount}
            </div>
            <h2 style={{ ...serifStyle, fontSize: 38, lineHeight: 1.05, margin: '0 0 14px' }}>
              отлично!<br />
              теперь Игрок {currentPlayer}.
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: 0 }}>
              Передайте телефон и стул следующему игроку. Готовы начать?
            </p>
          </div>
          <button style={primaryBtn} onClick={nextPlayer}>Готов? Поехали →</button>
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 12 }}>
              {currentPlayer} из {playerCount}
            </div>
            <h2 style={{ ...serifStyle, fontSize: 32, lineHeight: 1.1, margin: '0 0 26px' }}>
              Игрок {currentPlayer}<br />на горячем стуле 🔥
            </h2>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div
              style={{
                ...serifStyle,
                fontSize: 96,
                lineHeight: 1,
                color: secondsLeft <= 15 ? COLORS.tomato : COLORS.honey,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
            </div>

            <div style={{ width: '100%', height: 6, background: 'rgba(245,239,230,0.10)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${timeLeftPct * 100}%`,
                  background: secondsLeft <= 15 ? COLORS.tomato : COLORS.honey,
                  borderRadius: 99,
                  transition: 'width 0.95s linear',
                }}
              />
            </div>

            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
              Остальные задают вопросы — он отвечает честно.
            </div>
          </div>

          <button style={secondaryBtn} onClick={skip}>Пропустить →</button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 38, lineHeight: 1.05, margin: '0 0 18px' }}>
              игра<br />окончена.
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: 0 }}>
              Все побывали на горячем стуле. Спасибо за честность.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button style={primaryBtn} onClick={restart}>Сыграть ещё →</button>
            <button style={secondaryBtn} onClick={() => navigate('/games')}>К списку игр</button>
          </div>
        </div>
      )}
    </div>
  )
}
