import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle, overlineStyle } from '../../theme'
import { haptic } from '../../lib/telegram'

type Phase = 'setup' | 'input' | 'assign' | 'playing' | 'done'

const MIN_PLAYERS = 4
const MAX_PLAYERS = 6
const ROUND_SECONDS = 60

export function GuessWhoGame() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('setup')
  const [characters, setCharacters] = useState<string[]>([])
  const [inputIndex, setInputIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [assignment, setAssignment] = useState<string[]>([])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'playing' || !revealed) {
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
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [phase, revealed, currentTurn])

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

  function startInput() {
    haptic('medium')
    setCharacters([])
    setInputIndex(0)
    setInputValue('')
    setPhase('input')
  }

  function submitCharacter() {
    if (!inputValue.trim()) return
    haptic('light')
    const next = [...characters, inputValue.trim()]
    setCharacters(next)
    setInputValue('')
    if (next.length >= playerCount) {
      // assign — circular shift so nobody gets their own
      const assigned = next.map((_, i) => next[(i + 1) % next.length] ?? '')
      setAssignment(assigned)
      setScores(new Array(playerCount).fill(0))
      setCurrentTurn(0)
      setRevealed(false)
      setSecondsLeft(ROUND_SECONDS)
      setPhase('assign')
    } else {
      setInputIndex((i) => i + 1)
    }
  }

  function startPlaying() {
    haptic('medium')
    setPhase('playing')
    setRevealed(false)
    setSecondsLeft(ROUND_SECONDS)
  }

  function reveal() {
    haptic('medium')
    setRevealed(true)
  }

  function guessed() {
    haptic('medium')
    setScores((prev) => prev.map((s, i) => (i === currentTurn ? s + 1 : s)))
    advance()
  }

  function skip() {
    haptic('light')
    advance()
  }

  function advance() {
    if (currentTurn >= playerCount - 1) {
      setPhase('done')
      return
    }
    setCurrentTurn((t) => t + 1)
    setRevealed(false)
    setSecondsLeft(ROUND_SECONDS)
  }

  function restart() {
    haptic('light')
    setPhase('setup')
    setCharacters([])
    setInputIndex(0)
    setInputValue('')
    setAssignment([])
    setCurrentTurn(0)
    setRevealed(false)
    setScores([])
    setSecondsLeft(ROUND_SECONDS)
  }

  return (
    <div style={root}>
      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ marginLeft: 52, marginBottom: 8 }}>
        <div style={{ ...overlineStyle, color: '#B69CD8' }}>🎭 Угадай персонажа</div>
      </div>

      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px' }}>
              сколько вас<br />за столом?
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 28px' }}>
              Каждый загадывает знаменитость для соседа. Никто не знает, кого ему загадали.
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
                      border: active ? '2px solid #B69CD8' : '1px solid rgba(245,239,230,0.20)',
                      background: active ? 'rgba(182,156,216,0.18)' : 'rgba(245,239,230,0.05)',
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
          <button style={primaryBtn} onClick={startInput}>Начать →</button>
        </div>
      )}

      {phase === 'input' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 12 }}>
              Ход {inputIndex + 1} из {playerCount}
            </div>
            <h2 style={{ ...serifStyle, fontSize: 30, lineHeight: 1.1, margin: '0 0 14px' }}>
              Игрок {inputIndex + 1},<br />
              загадай знаменитость.
            </h2>
            <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Кого-то известного: актёра, певца, политика, персонажа. Не показывай экран соседям.
            </p>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Например: Леонардо ДиКаприо"
              style={{
                ...sansStyle,
                width: '100%',
                padding: 16,
                borderRadius: RADII.lg,
                background: 'rgba(245,239,230,0.08)',
                border: '1px solid rgba(245,239,230,0.18)',
                color: COLORS.cream,
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: inputValue.trim() ? 1 : 0.4 }}
            onClick={submitCharacter}
            disabled={!inputValue.trim()}
          >
            Готово →
          </button>
        </div>
      )}

      {phase === 'assign' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px' }}>
              готово!<br />
              начинаем угадывать.
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.55, margin: 0 }}>
              Персонажи распределены случайно. Никто не получил своего собственного.
              <br /><br />
              Каждый по очереди берёт телефон, прикладывает экраном от себя ко лбу — и пытается угадать своего персонажа за 60 секунд, задавая вопросы да/нет.
            </p>
          </div>
          <button style={primaryBtn} onClick={startPlaying}>Игрок 1 готов →</button>
        </div>
      )}

      {phase === 'playing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          {!revealed ? (
            <>
              <div>
                <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 12 }}>
                  Ход {currentTurn + 1} из {playerCount}
                </div>
                <h2 style={{ ...serifStyle, fontSize: 32, lineHeight: 1.1, margin: '0 0 18px' }}>
                  Игрок {currentTurn + 1},<br />твой ход.
                </h2>
                <div
                  style={{
                    padding: 24,
                    borderRadius: RADII.xl,
                    background: 'rgba(182,156,216,0.10)',
                    border: '1px solid rgba(182,156,216,0.30)',
                    ...sansStyle,
                    fontSize: 16,
                    lineHeight: 1.5,
                    color: COLORS.cream,
                    textAlign: 'center',
                  }}
                >
                  📱<br />
                  держи телефон<br />экраном от себя — ко лбу.
                </div>
              </div>
              <button style={primaryBtn} onClick={reveal}>Показать мой персонаж</button>
            </>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <div
                  style={{
                    ...sansStyle,
                    fontSize: 18,
                    fontWeight: 700,
                    color: secondsLeft <= 10 ? COLORS.tomato : 'rgba(245,239,230,0.85)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(Math.floor(secondsLeft / 60)).padStart(1, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
                </div>
                <div
                  style={{
                    ...serifStyle,
                    fontSize: 56,
                    lineHeight: 1.1,
                    color: COLORS.honey,
                    textAlign: 'center',
                    padding: '0 8px',
                  }}
                >
                  {assignment[currentTurn]}
                </div>
                <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', textAlign: 'center', maxWidth: 240 }}>
                  Все за столом видят это. Задавай вопросы да/нет.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{
                    ...sansStyle,
                    flex: 1,
                    background: COLORS.forest,
                    color: COLORS.cream,
                    border: 'none',
                    padding: '18px',
                    borderRadius: RADII.full,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                  onClick={guessed}
                >
                  Угадал! ✓
                </button>
                <button
                  style={{
                    ...sansStyle,
                    flex: 1,
                    background: 'rgba(245,239,230,0.10)',
                    color: COLORS.cream,
                    border: '1px solid rgba(245,239,230,0.18)',
                    padding: '18px',
                    borderRadius: RADII.full,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                  onClick={skip}
                >
                  Пропустить →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.1, margin: '0 0 18px' }}>
              игра<br />окончена.
            </h2>
            <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Кто кого угадал:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scores.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: RADII.md,
                    background: 'rgba(245,239,230,0.06)',
                    border: '1px solid rgba(245,239,230,0.12)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ ...sansStyle, fontSize: 14, color: COLORS.cream }}>
                    Игрок {i + 1}
                    <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.55)', marginTop: 2 }}>
                      загадан: {assignment[i]}
                    </div>
                  </div>
                  <div
                    style={{
                      ...serifStyle,
                      fontSize: 22,
                      color: s > 0 ? '#7ED4A8' : 'rgba(245,239,230,0.40)',
                    }}
                  >
                    {s > 0 ? 'угадал' : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
            <button style={primaryBtn} onClick={restart}>Сыграть ещё →</button>
            <button style={secondaryBtn} onClick={() => navigate('/games')}>К списку игр</button>
          </div>
        </div>
      )}
    </div>
  )
}
