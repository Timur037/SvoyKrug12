import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { PageTransition } from '../components/PageTransition'
import { haptic } from '../lib/telegram'
import { fetchUpcomingMeetup, type DbMeetup } from '../lib/db'

function dayWord(n: number) {
  const m = n % 10, m100 = n % 100
  if (m === 1 && m100 !== 11) return 'день'
  if ([2,3,4].includes(m) && ![12,13,14].includes(m100)) return 'дня'
  return 'дней'
}
function hourWord(n: number) {
  const m = n % 10, m100 = n % 100
  if (m === 1 && m100 !== 11) return 'час'
  if ([2,3,4].includes(m) && ![12,13,14].includes(m100)) return 'часа'
  return 'часов'
}
function weekdayRu(date: Date) {
  return ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][date.getDay()] ?? ''
}

export function BreathingScreen() {
  const navigate = useNavigate()
  const [now, setNow] = useState(Date.now())
  const [showReassurance, setShowReassurance] = useState(false)
  const [meetup, setMeetup] = useState<DbMeetup | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetchUpcomingMeetup().then(setMeetup).catch(console.error)
  }, [])

  const target = useMemo(() => {
    if (meetup?.scheduled_at) return new Date(meetup.scheduled_at).getTime()
    return Date.now() + (2 * 24 + 4) * 3600 * 1000
  }, [meetup])

  const ms = Math.max(0, target - now)
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)

  const windowMs = 72 * 3600 * 1000
  const pct = ms <= 0 ? 1 : Math.max(0, 1 - ms / windowMs)

  const dayLabel  = meetup?.scheduled_at ? weekdayRu(new Date(meetup.scheduled_at)) : 'пятница'
  const circleLabel = meetup?.title ?? 'ваш круг'
  const placeRevealTime = meetup?.scheduled_at
    ? (() => { const d = new Date(meetup.scheduled_at); d.setHours(d.getHours() - 6); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}` })()
    : '16:30'

  const countdownText = ms === 0
    ? 'вечер уже начался'
    : days > 0
      ? `через ${days} ${dayWord(days)} ${hours} ${hourWord(hours)}`
      : `через ${hours} ${hourWord(hours)}`

  return (
    <PageTransition>
      <div style={{
        position: 'relative', width: '100%', height: '100dvh',
        background: COLORS.cream, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Grain opacity={0.20} />

        {/* Animated rings */}
        <style>{`
          @keyframes breathe {
            0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.06; }
            50% { transform:translate(-50%,-50%) scale(1.08); opacity:0.10; }
          }
          @keyframes breatheSlow {
            0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.04; }
            50% { transform:translate(-50%,-50%) scale(1.12); opacity:0.07; }
          }
        `}</style>
        <div style={{ position:'absolute', top:'52%', left:'50%', width:360, height:360, borderRadius:'50%', border:`1.5px solid ${COLORS.tomato}`, animation:'breatheSlow 4s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'52%', left:'50%', width:260, height:260, borderRadius:'50%', border:`1.5px solid ${COLORS.tomato}`, animation:'breathe 4s ease-in-out infinite 0.6s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'52%', left:'50%', width:160, height:160, borderRadius:'50%', background:'rgba(232,71,44,0.06)', border:`1px solid rgba(232,71,44,0.12)`, animation:'breathe 4s ease-in-out infinite 1.2s', pointerEvents:'none' }} />

        {/* Progress line */}
        <div style={{
          position:'absolute', bottom: 0, left:0, height:3,
          width:`${pct * 100}%`, background:COLORS.tomato,
          transition:'width 1s ease', opacity:0.6,
        }} />

        {/* Back */}
        <button
          style={{
            position:'absolute', top:52, left:22, zIndex:10,
            width:40, height:40, borderRadius:RADII.full,
            background:'rgba(255,255,255,0.7)',
            border:'1px solid rgba(26,22,18,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
          }}
          onClick={() => { haptic('light'); navigate('/calendar') }}
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Main content */}
        <div style={{
          position:'relative', zIndex:5,
          display:'flex', flexDirection:'column',
          alignItems:'center', textAlign:'center',
          padding:'0 32px', maxWidth:440, width:'100%',
          overflowY:'auto', scrollbarWidth:'none',
        }}>
          <div style={{ ...sansStyle, fontSize:10, fontWeight:700, letterSpacing:'0.18em', color:COLORS.inkSoft, textTransform:'uppercase', marginBottom:28 }}>
            {circleLabel} · {dayLabel}
          </div>

          <h1 style={{ ...serifStyle, margin:'0 0 8px', fontSize:42, lineHeight:1.05, color:COLORS.ink, letterSpacing:'-0.02em' }}>
            место откроется
          </h1>
          <div style={{ ...serifStyle, fontSize:38, lineHeight:1.1, color:COLORS.tomato, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>
            {countdownText}
          </div>

          <p style={{ ...sansStyle, fontSize:14, color:COLORS.inkSoft, marginTop:24, lineHeight:1.6, maxWidth:260 }}>
            вы получите адрес, когда круг будет готов выйти из дома.
          </p>

          <button
            style={{
              marginTop:28,
              background:COLORS.ink, color:COLORS.cream,
              border:'none', padding:'14px 26px', borderRadius:RADII.full,
              ...sansStyle, fontSize:14, fontWeight:700,
              boxShadow:SHADOWS.panel, cursor:'pointer',
            }}
            onClick={() => { haptic('medium'); navigate('/group') }}
          >
            открыть разговорник →
          </button>

          <button
            style={{
              marginTop:18, ...sansStyle, fontSize:12, color:COLORS.inkSoft,
              background:'transparent', border:'none',
              textDecoration:'underline', textUnderlineOffset:3, opacity:0.7, cursor:'pointer',
            }}
            onClick={() => { haptic('light'); setShowReassurance(v => !v) }}
          >
            {showReassurance ? 'свернуть' : 'что если я не смогу прийти?'}
          </button>

          {showReassurance && (
            <div style={{
              marginTop:18, padding:'22px', textAlign:'left', width:'100%',
              background:COLORS.white, border:'1px solid rgba(26,22,18,0.08)',
              borderRadius:RADII.xl, boxShadow:SHADOWS.panel,
              boxSizing:'border-box',
            }}>
              <div style={{ ...serifStyle, fontSize:22, color:COLORS.ink, marginBottom:10 }}>
                ничего страшного.
              </div>
              <p style={{ ...sansStyle, fontSize:13, color:COLORS.inkSoft, lineHeight:1.6, margin:'0 0 14px' }}>
                напишите за 2 часа до начала — мы тихо передадим место кому-то ещё. без штрафов и обиды.
              </p>
              <div style={{ padding:'10px 14px', borderRadius:RADII.md, background:COLORS.cream2, ...sansStyle, fontSize:12, color:COLORS.inkSoft }}>
                адрес откроется в <span style={{ color:COLORS.tomato, fontWeight:700 }}>{placeRevealTime}</span> в день встречи
              </div>
              <button
                style={{ marginTop:14, ...sansStyle, fontSize:13, fontWeight:600, color:COLORS.tomato, background:'transparent', border:'none', padding:0, cursor:'pointer' }}
                onClick={() => { haptic('light'); navigate('/calendar') }}
              >
                перенести вечер →
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
