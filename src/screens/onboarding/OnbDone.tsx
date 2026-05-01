import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { Grain } from '../../components/Grain'
import { haptic } from '../../lib/telegram'
import { upsertUser, saveProfile } from '../../lib/user'

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    if (!v) return fallback
    return JSON.parse(v) as T
  } catch { return fallback }
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
    } catch (err) { console.error('saveProfile error:', err) }
    navigate('/home', { replace: true })
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100dvh',
      background: COLORS.ink,
      color: COLORS.cream,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Grain opacity={0.35} />

      {/* Warm glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 340,
        height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(232,71,44,0.18) 0%, rgba(244,201,93,0.08) 50%, transparent 72%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative rings */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 280,
        height: 280,
        borderRadius: '50%',
        border: '1px solid rgba(245,239,230,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 200,
        height: 200,
        borderRadius: '50%',
        border: '1px solid rgba(245,239,230,0.08)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 32px' }}>
        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: RADII.full,
          background: 'linear-gradient(145deg, rgba(232,71,44,0.9), rgba(199,54,30,0.9))',
          boxShadow: '0 20px 48px rgba(232,71,44,0.40)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 36px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5l5 5L20 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ ...serifStyle, fontSize: 44, lineHeight: 1.0, margin: '0 0 16px', color: COLORS.cream }}>
          теперь мы знаем<br />вас чуть лучше
        </h1>

        <p style={{
          ...sansStyle,
          fontSize: 16,
          lineHeight: 1.6,
          color: 'rgba(245,239,230,0.65)',
          margin: '0 0 48px',
          maxWidth: 280,
        }}>
          подберём тёплую компанию. скорее всего, вы будете говорить о том, что важно.
        </p>

        {/* Stats line */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderRadius: RADII.lg,
          overflow: 'hidden',
          border: '1px solid rgba(245,239,230,0.10)',
          marginBottom: 48,
        }}>
          {[
            { n: '847', label: 'человек' },
            { n: '5–6', label: 'за столом' },
            { n: '∞', label: 'разговоров' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1,
              padding: '16px 12px',
              textAlign: 'center',
              borderLeft: i > 0 ? '1px solid rgba(245,239,230,0.08)' : 'none',
              background: 'rgba(245,239,230,0.04)',
            }}>
              <div style={{ ...serifStyle, fontSize: 28, color: COLORS.honey, lineHeight: 1 }}>{s.n}</div>
              <div style={{ ...sansStyle, fontSize: 10, color: 'rgba(245,239,230,0.45)', marginTop: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={finish}
          style={{
            ...sansStyle,
            width: '100%',
            height: 58,
            borderRadius: RADII.full,
            fontSize: 16,
            fontWeight: 700,
            background: COLORS.cream,
            color: COLORS.ink,
            border: 'none',
            boxShadow: SHADOWS.panelLg,
            cursor: 'pointer',
            letterSpacing: '-0.02em',
          }}
        >
          найти свой круг →
        </button>
      </div>
    </div>
  )
}
