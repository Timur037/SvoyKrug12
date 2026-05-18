import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle, overlineStyle } from '../../theme'
import { haptic } from '../../lib/telegram'

type Phase = 'setup' | 'input' | 'voting' | 'reveal' | 'result' | 'done'

interface Round {
  player: number
  fact: string
  votes: { believe: number; notBelieve: number }
  truth: 'truth' | 'lie' | null
}

const MIN_PLAYERS = 4
const MAX_PLAYERS = 6

export function BelieveItGame() {
  const navigate = useNavigate()
  const [playerCount, setPlayerCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('setup')
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [factInput, setFactInput] = useState('')
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState<Round | null>(null)
  const [votesRecorded, setVotesRecorded] = useState(0)

  const root: CSSProperties = {
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.ink,
    color: COLORS.cream,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 22px 28px',
    boxSizing: 'border-box',
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

  function startGame() {
    haptic('medium')
    setCurrentPlayer(1)
    setRounds([])
    setFactInput('')
    setPhase('input')
  }

  function submitFact() {
    if (!factInput.trim()) return
    haptic('light')
    const round: Round = {
      player: currentPlayer,
      fact: factInput.trim(),
      votes: { believe: 0, notBelieve: 0 },
      truth: null,
    }
    setCurrentRound(round)
    setVotesRecorded(0)
    setPhase('voting')
  }

  function recordVote(believe: boolean) {
    if (!currentRound) return
    haptic('light')
    const updated: Round = {
      ...currentRound,
      votes: {
        believe: currentRound.votes.believe + (believe ? 1 : 0),
        notBelieve: currentRound.votes.notBelieve + (!believe ? 1 : 0),
      },
    }
    setCurrentRound(updated)
    setVotesRecorded((v) => v + 1)
  }

  function reveal(truth: 'truth' | 'lie') {
    if (!currentRound) return
    haptic('medium')
    const finished: Round = { ...currentRound, truth }
    setRounds((prev) => [...prev, finished])
    setCurrentRound(finished)
    setPhase('result')
  }

  function nextPlayer() {
    haptic('light')
    if (currentPlayer >= playerCount) {
      setPhase('done')
      return
    }
    setCurrentPlayer((p) => p + 1)
    setFactInput('')
    setCurrentRound(null)
    setPhase('input')
  }

  function restart() {
    haptic('light')
    setPhase('setup')
    setCurrentPlayer(1)
    setRounds([])
    setFactInput('')
    setCurrentRound(null)
    setVotesRecorded(0)
  }

  return (
    <div style={root}>
      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ marginLeft: 52, marginBottom: 8 }}>
        <div style={{ ...overlineStyle, color: COLORS.tomato }}>🎲 Верю / Не верю</div>
      </div>

      {phase === 'setup' && (
        <SetupPhase
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          onStart={startGame}
          primaryBtn={primaryBtn}
        />
      )}

      {phase === 'input' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 12 }}>
              Ход {currentPlayer} из {playerCount} · Игрок {currentPlayer}
            </div>
            <h2 style={{ ...serifStyle, fontSize: 30, lineHeight: 1.1, margin: '0 0 16px' }}>
              твой ход.<br />
              расскажи факт<br />
              о себе.
            </h2>
            <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Правду или ложь — решать тебе. Никто не должен видеть, что ты пишешь.
            </p>
            <textarea
              value={factInput}
              onChange={(e) => setFactInput(e.target.value)}
              placeholder="Например: я три года жил в Перу"
              style={{
                ...sansStyle,
                width: '100%',
                minHeight: 130,
                padding: 16,
                borderRadius: RADII.lg,
                background: 'rgba(245,239,230,0.08)',
                border: '1px solid rgba(245,239,230,0.18)',
                color: COLORS.cream,
                fontSize: 16,
                lineHeight: 1.4,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            style={{ ...primaryBtn, opacity: factInput.trim() ? 1 : 0.4 }}
            onClick={submitFact}
            disabled={!factInput.trim()}
          >
            Показать всем →
          </button>
        </div>
      )}

      {phase === 'voting' && currentRound && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: 30 }}>
          <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', marginBottom: 14 }}>
            Игрок {currentRound.player} говорит:
          </div>

          <div
            style={{
              padding: 22,
              borderRadius: RADII.xl,
              background: 'rgba(232,71,44,0.10)',
              border: '1px solid rgba(232,71,44,0.30)',
              ...serifStyle,
              fontSize: 24,
              lineHeight: 1.3,
              color: COLORS.cream,
              marginBottom: 18,
            }}
          >
            «{currentRound.fact}»
          </div>

          <div style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', textAlign: 'center', marginBottom: 18 }}>
            Передавайте телефон — каждый голосует.<br />
            <span style={{ color: COLORS.tomato, fontWeight: 700 }}>
              {votesRecorded} из {playerCount - 1}
            </span>
          </div>

          {votesRecorded < playerCount - 1 ? (
            <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
              <button
                style={{
                  ...sansStyle,
                  flex: 1,
                  background: 'rgba(45,74,62,0.30)',
                  color: COLORS.cream,
                  border: '1px solid rgba(45,74,62,0.55)',
                  padding: '18px',
                  borderRadius: RADII.full,
                  fontSize: 15,
                  fontWeight: 700,
                }}
                onClick={() => recordVote(true)}
              >
                Верю ✓
              </button>
              <button
                style={{
                  ...sansStyle,
                  flex: 1,
                  background: 'rgba(232,71,44,0.20)',
                  color: COLORS.cream,
                  border: '1px solid rgba(232,71,44,0.55)',
                  padding: '18px',
                  borderRadius: RADII.full,
                  fontSize: 15,
                  fontWeight: 700,
                }}
                onClick={() => recordVote(false)}
              >
                Не верю ✗
              </button>
            </div>
          ) : (
            <button style={{ ...primaryBtn, marginTop: 'auto' }} onClick={() => { haptic('medium'); setPhase('reveal') }}>
              Готово →
            </button>
          )}
        </div>
      )}

      {phase === 'reveal' && currentRound && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 28, lineHeight: 1.15, margin: '0 0 14px' }}>
              Игрок {currentRound.player},<br />правда или ложь?
            </h2>
            <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: 0 }}>
              Только ты знаешь правду. Раскрой карты.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              style={{
                ...sansStyle,
                flex: 1,
                background: COLORS.forest,
                color: COLORS.cream,
                border: 'none',
                padding: '20px',
                borderRadius: RADII.full,
                fontSize: 16,
                fontWeight: 700,
              }}
              onClick={() => reveal('truth')}
            >
              Правда
            </button>
            <button
              style={{
                ...sansStyle,
                flex: 1,
                background: COLORS.tomato,
                color: COLORS.cream,
                border: 'none',
                padding: '20px',
                borderRadius: RADII.full,
                fontSize: 16,
                fontWeight: 700,
              }}
              onClick={() => reveal('lie')}
            >
              Ложь
            </button>
          </div>
        </div>
      )}

      {phase === 'result' && currentRound && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <div
              style={{
                ...serifStyle,
                fontSize: 64,
                lineHeight: 1,
                color: currentRound.truth === 'truth' ? '#7ED4A8' : COLORS.tomato,
                marginBottom: 14,
              }}
            >
              {currentRound.truth === 'truth' ? 'Правда!' : 'Ложь!'}
            </div>
            <div style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.65)', marginBottom: 26 }}>
              {currentRound.votes.believe} верили · {currentRound.votes.notBelieve} не верили
            </div>
            <div
              style={{
                padding: 18,
                borderRadius: RADII.lg,
                background: 'rgba(245,239,230,0.06)',
                border: '1px solid rgba(245,239,230,0.12)',
                ...serifStyle,
                fontSize: 18,
                lineHeight: 1.35,
                color: 'rgba(245,239,230,0.85)',
              }}
            >
              «{currentRound.fact}»
            </div>
          </div>
          <button style={primaryBtn} onClick={nextPlayer}>
            {currentPlayer >= playerCount ? 'Завершить →' : 'Следующий →'}
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
          <div>
            <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.1, margin: '0 0 18px' }}>
              игра<br />окончена.
            </h2>
            <p style={{ ...sansStyle, fontSize: 13, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Вот что вы рассказали друг о друге:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rounds.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: RADII.md,
                    background: 'rgba(245,239,230,0.06)',
                    border: '1px solid rgba(245,239,230,0.12)',
                  }}
                >
                  <div style={{ ...overlineStyle, color: r.truth === 'truth' ? '#7ED4A8' : COLORS.tomato, marginBottom: 6 }}>
                    Игрок {r.player} · {r.truth === 'truth' ? 'правда' : 'ложь'}
                  </div>
                  <div style={{ ...sansStyle, fontSize: 14, color: COLORS.cream, lineHeight: 1.4 }}>
                    «{r.fact}»
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

function SetupPhase({
  playerCount,
  setPlayerCount,
  onStart,
  primaryBtn,
}: {
  playerCount: number
  setPlayerCount: (n: number) => void
  onStart: () => void
  primaryBtn: CSSProperties
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 30 }}>
      <div>
        <h2 style={{ ...serifStyle, fontSize: 36, lineHeight: 1.05, margin: '0 0 14px' }}>
          сколько вас<br />за столом?
        </h2>
        <p style={{ ...sansStyle, fontSize: 14, color: 'rgba(245,239,230,0.55)', lineHeight: 1.5, margin: '0 0 28px' }}>
          Один телефон передаётся по кругу. Каждый игрок говорит факт о себе — правду или нет.
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
                  border: active ? `2px solid ${COLORS.tomato}` : '1px solid rgba(245,239,230,0.20)',
                  background: active ? 'rgba(232,71,44,0.20)' : 'rgba(245,239,230,0.05)',
                  color: COLORS.cream,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>

      <button style={primaryBtn} onClick={onStart}>
        Начать →
      </button>
    </div>
  )
}
