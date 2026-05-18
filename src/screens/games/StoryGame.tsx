import { useState, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle, overlineStyle } from '../../theme'
import { haptic } from '../../lib/telegram'

type Phase = 'setup' | 'playing' | 'done'

interface Line {
  player: number
  text: string
}

const MIN_PLAYERS = 4
const MAX_PLAYERS = 6
const ROUNDS_PER_PLAYER = 3

const OPENERS: string[] = [
  'Однажды в Москве встретились шесть незнакомцев. Они оказались в одном ресторане и...',
  'В маленьком кафе на Патриках один из гостей заметил кое-что необычное и...',
  'Это был обычный вечер, пока кто-то за столом не сказал, что...',
  'Никто из них не знал друг друга час назад. Но потом случилось то, что...',
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

export function StoryGame() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('setup')
  const [opener, setOpener] = useState<string>('')
  const [lines, setLines] = useState<Line[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [draft, setDraft] = useState('')

  const maxLines = playerCount * ROUNDS_PER_PLAYER
  const remaining = useMemo(() => maxLines - lines.length, [maxLines, lines.length])

  function start() {
    haptic('medium')
    setOpener(pickRandom(OPENERS))
    setLines([])
    setCurrentPlayer(1)
    setDraft('')
    setPhase('playing')
  }

  function addLine() {
    if (!draft.trim()) return
    haptic('light')
    const newLine: Line = { player: currentPlayer, text: draft.trim() }
    const updated = [...lines, newLine]
    setLines(updated)
    setDraft('')
    if (updated.length >= maxLines) {
      setPhase('done')
      return
    }
    setCurrentPlayer((p) => (p % playerCount) + 1)
  }

  function finish() {
    haptic('medium')
    setPhase('done')
  }

  function restart() {
    haptic('light')
    setPhase('setup')
    setLines([])
    setOpener('')
    setDraft('')
    setCurrentPlayer(1)
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
    background: 'rgb(178,112,44)',
    color: COLORS.cream,
    border: 'none',
    padding: '15px',
    borderRadius: RADII.full,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(178,112,44,0.35)',
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

  return (
    <div style={root}>
      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ marginLeft: 52, marginBottom: 8 }}>
        <div style={{ ...overlineStyle, color: 'rgb(220,160,90)' }}>📖 Общая история</div>
      </div>

      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px' }}>
              сколько вас<br />за столом?
            </h2>
            <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 28px' }}>
              Приложение даст начало истории. Каждый по очереди добавляет одно предложение. Три круга.
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
                      border: active ? '2px solid rgb(220,160,90)' : '1px solid rgba(245,239,230,0.20)',
                      background: active ? 'rgba(220,160,90,0.18)' : 'rgba(245,239,230,0.05)',
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

      {phase === 'playing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: 24, minHeight: 0 }}>
          <div style={{ ...sansStyle, fontSize: 12, color: 'rgba(245,239,230,0.55)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>Предложение {lines.length + 1} из {maxLines}</span>
            <span>осталось {remaining}</span>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 16,
              borderRadius: RADII.lg,
              background: 'rgba(245,239,230,0.05)',
              border: '1px solid rgba(245,239,230,0.10)',
              marginBottom: 16,
            }}
          >
            <p
              style={{
                ...serifStyle,
                fontSize: 18,
                lineHeight: 1.45,
                color: 'rgba(245,239,230,0.85)',
                margin: '0 0 12px',
              }}
            >
              {opener}
            </p>
            {lines.map((l, i) => (
              <p
                key={i}
                style={{
                  ...sansStyle,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: COLORS.cream,
                  margin: '0 0 8px',
                }}
              >
                <span style={{ color: 'rgb(220,160,90)', fontWeight: 700 }}>Игрок {l.player}: </span>
                {l.text}
              </p>
            ))}
          </div>

          <div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.65)', marginBottom: 8 }}>
              Игрок {currentPlayer}, добавь предложение:
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Одно предложение..."
              style={{
                ...sansStyle,
                width: '100%',
                minHeight: 80,
                padding: 14,
                borderRadius: RADII.md,
                background: 'rgba(245,239,230,0.08)',
                border: '1px solid rgba(245,239,230,0.18)',
                color: COLORS.cream,
                fontSize: 15,
                lineHeight: 1.4,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            <button
              style={{ ...primaryBtn, opacity: draft.trim() ? 1 : 0.4 }}
              onClick={addLine}
              disabled={!draft.trim()}
            >
              Добавить →
            </button>
            {lines.length > 0 && (
              <button style={{ ...secondaryBtn, marginTop: 10 }} onClick={finish}>
                Хватит, читать историю
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 24, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <h2 style={{ ...serifStyle, fontSize: 32, lineHeight: 1.1, margin: '0 0 14px' }}>
              ваша история.
            </h2>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: 20,
                borderRadius: RADII.lg,
                background: 'rgba(245,239,230,0.06)',
                border: '1px solid rgba(245,239,230,0.12)',
              }}
            >
              <p
                style={{
                  ...serifStyle,
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: COLORS.cream,
                  margin: 0,
                }}
              >
                {opener} {lines.map((l) => l.text).join(' ')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <button style={primaryBtn} onClick={restart}>Сначала →</button>
            <button style={secondaryBtn} onClick={() => navigate('/games')}>К списку игр</button>
          </div>
        </div>
      )}
    </div>
  )
}
