import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle, overlineStyle } from '../theme'
import { haptic } from '../lib/telegram'
import { GAMES, type Game } from '../data/games'

export function GamesScreen() {
  const navigate = useNavigate()

  const root: CSSProperties = {
    width: '100%',
    minHeight: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowY: 'auto',
    paddingBottom: 40,
  }

  const headerWrap: CSSProperties = {
    position: 'relative',
    padding: '60px 24px 22px',
  }

  const back: CSSProperties = {
    position: 'absolute',
    top: 56,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(26,22,18,0.06)',
    border: '1px solid rgba(26,22,18,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.ink,
  }

  return (
    <div style={root}>
      <div style={headerWrap}>
        <button
          style={back}
          onClick={() => {
            haptic('light')
            navigate(-1)
          }}
          aria-label="Назад"
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

        <div style={{ marginTop: 8, marginLeft: 52 }}>
          <div style={{ ...overlineStyle, color: COLORS.tomato }}>игры за столом</div>
          <h1
            style={{
              ...serifStyle,
              margin: '8px 0 0',
              fontSize: 34,
              lineHeight: 1.05,
              color: COLORS.ink,
            }}
          >
            пять игр
            <br />
            на вечер.
          </h1>
          <p
            style={{
              ...sansStyle,
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: COLORS.inkSoft,
              maxWidth: 320,
            }}
          >
            Если разговор зашёл в тупик — откройте одну. Все играются с одного телефона.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 20px' }}>
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} onPlay={() => navigate(`/games/${g.id}`)} />
        ))}
      </div>
    </div>
  )
}

function GameCard({ game, onPlay }: { game: Game; onPlay: () => void }) {
  const card: CSSProperties = {
    background: COLORS.white,
    border: '1px solid rgba(26,22,18,0.08)',
    borderRadius: RADII.xl,
    padding: 20,
    boxShadow: SHADOWS.panel,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }

  const head: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  }

  const bubble: CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: RADII.lg,
    background: `rgba(${game.color}, 0.12)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    flexShrink: 0,
  }

  const pill: CSSProperties = {
    ...sansStyle,
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: RADII.full,
    background: 'rgba(26,22,18,0.06)',
    color: COLORS.inkSoft,
  }

  const playButton: CSSProperties = {
    ...sansStyle,
    width: '100%',
    background: `rgb(${game.color})`,
    color: COLORS.white,
    border: 'none',
    padding: '13px',
    borderRadius: RADII.full,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: `0 8px 20px rgba(${game.color}, 0.35)`,
  }

  return (
    <div style={card}>
      <div style={head}>
        <div style={bubble}>{game.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...serifStyle,
              fontSize: 22,
              lineHeight: 1.15,
              color: COLORS.ink,
            }}
          >
            {game.title}
          </div>
          <div
            style={{
              ...sansStyle,
              marginTop: 4,
              fontSize: 13,
              color: COLORS.inkSoft,
              lineHeight: 1.4,
            }}
          >
            {game.tagline}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={pill}>⏱ {game.duration}</span>
        <span style={pill}>👥 {game.players}</span>
      </div>

      <p
        style={{
          ...sansStyle,
          margin: 0,
          fontSize: 13,
          lineHeight: 1.55,
          color: COLORS.inkSoft,
        }}
      >
        {game.description}
      </p>

      <button
        style={playButton}
        onClick={() => {
          haptic('medium')
          onPlay()
        }}
      >
        Играть →
      </button>
    </div>
  )
}
