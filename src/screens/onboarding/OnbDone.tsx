import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'
import { upsertUser, saveProfile } from '../../lib/user'

const STEP = 7
const TOTAL = 7

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (!v) return fallback
    return JSON.parse(v) as T
  } catch {
    return fallback
  }
}

export function OnbDone() {
  const navigate = useNavigate()

  async function finish() {
    haptic('medium')
    try {
      localStorage.setItem('svoy_krug_onboarded', '1')

      const gender   = localStorage.getItem('svoy_krug_gender') ?? undefined
      const ageRaw   = localStorage.getItem('svoy_krug_age')
      const age      = ageRaw ? parseInt(ageRaw, 10) : undefined
      const work     = localStorage.getItem('svoy_krug_work') ?? undefined
      const district = localStorage.getItem('svoy_krug_district') ?? undefined
      const hobbies  = readLS<string[]>('svoy_krug_hobbies', [])
      const qualities = readLS<string[]>('svoy_krug_qualities', [])

      const user = await upsertUser()
      await saveProfile(user.id, { gender, age, work, district, hobbies, qualities })
    } catch (err) {
      console.error('saveProfile error:', err)
    }
    navigate('/home', { replace: true })
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
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 32px 120px',
    textAlign: 'center',
  }
  const badge: CSSProperties = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.tomato}, ${COLORS.honey})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 16px 40px rgba(232,71,44,0.35)',
    marginBottom: 32,
  }
  const headline: CSSProperties = {
    ...serifStyle,
    fontSize: 40,
    lineHeight: 1.0,
    margin: 0,
    marginBottom: 20,
    color: COLORS.ink,
  }
  const card: CSSProperties = {
    background: '#fff',
    borderRadius: 22,
    padding: '20px 24px',
    border: '1px solid rgba(26,22,18,0.06)',
    boxShadow: '0 8px 24px rgba(26,22,18,0.06)',
    marginBottom: 48,
  }
  const cardText: CSSProperties = {
    ...sansStyle,
    fontSize: 15,
    lineHeight: 1.6,
    color: COLORS.inkSoft,
    margin: 0,
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
    background: COLORS.ink,
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
              navigate('/onboarding/qualities')
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
        <div style={badge}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12.5l5 5L20 7"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 style={headline}>
          теперь мы знаем
          <br />
          вас чуть лучше
        </h1>

        <div style={card}>
          <p style={cardText}>
            подберём для вас тёплую компанию. скорее всего, вы будете говорить
            о том, что важно. ✨
          </p>
        </div>
      </div>

      <div style={ctaWrap}>
        <button style={ctaBtn} onClick={finish}>
          найти свой круг →
        </button>
      </div>
    </div>
  )
}
