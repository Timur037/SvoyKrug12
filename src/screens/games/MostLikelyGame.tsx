import { useState, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, serifStyle, sansStyle, overlineStyle } from '../../theme'
import { haptic } from '../../lib/telegram'

const PROMPTS: string[] = [
  'первым заговорит с незнакомым человеком на вечеринке',
  'работает допоздна по собственному желанию',
  'знает наизусть слова любимой песни на иностранном языке',
  'приезжает на встречу первым',
  'следит за питанием, но никому об этом не говорит',
  'планирует отпуск за год вперёд',
  'смотрит фильмы на скорости 1.5×',
  'тайно хочет бросить всё и уехать жить в другой город',
  'может приготовить ужин из чего угодно в холодильнике',
  'отвечает на сообщения через несколько дней',
  'в детстве серьёзно думал стать актёром или певцом',
  'слушает одну и ту же песню на повторе весь день',
  'лучше всех умеет хранить чужие секреты',
  'первым предложит поехать в незнакомое место',
  'засыпает позже всех',
  'прочитал последнюю книгу больше года назад',
  'никогда не выбрасывает старые вещи',
  'знает историю каждого места, где бывает',
  'придумывает оправдания для опоздания заранее',
  'чаще всего платит за всех',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i] as T
    a[i] = a[j] as T
    a[j] = tmp
  }
  return a
}

export function MostLikelyGame() {
  const navigate = useNavigate()
  const initial = useMemo(() => shuffle(PROMPTS), [])
  const [order, setOrder] = useState<string[]>(initial)
  const [index, setIndex] = useState(0)

  const current = order[index] ?? PROMPTS[0]!

  function next() {
    haptic('medium')
    if (index + 1 >= order.length) {
      const last = order[order.length - 1]
      let reshuffled = shuffle(PROMPTS)
      // ensure no repeat at the seam
      if (reshuffled[0] === last && reshuffled.length > 1) {
        reshuffled = [reshuffled[1]!, reshuffled[0]!, ...reshuffled.slice(2)]
      }
      setOrder(reshuffled)
      setIndex(0)
    } else {
      setIndex((i) => i + 1)
    }
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
    background: COLORS.forest,
    color: COLORS.cream,
    border: 'none',
    padding: '15px',
    borderRadius: RADII.full,
    fontSize: 14,
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(45,74,62,0.40)',
  }

  return (
    <div style={root}>
      <button style={back} onClick={() => { haptic('light'); navigate(-1) }} aria-label="Назад">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke={COLORS.cream} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ marginLeft: 52, marginBottom: 8 }}>
        <div style={{ ...overlineStyle, color: '#7ED4A8' }}>👆 Кто скорее всего?</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 4px' }}>
        <div
          style={{
            ...serifStyle,
            fontSize: 28,
            color: 'rgba(245,239,230,0.55)',
            marginBottom: 18,
          }}
        >
          кто за этим столом<br />скорее всего...
        </div>
        <div
          style={{
            ...serifStyle,
            fontSize: 36,
            lineHeight: 1.18,
            color: COLORS.cream,
            padding: '0 4px',
          }}
        >
          {current}.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            ...sansStyle,
            fontSize: 13,
            color: 'rgba(245,239,230,0.55)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          На счёт три — все одновременно указывают пальцем 👆
        </div>
        <button style={primaryBtn} onClick={next}>
          Следующий →
        </button>
      </div>
    </div>
  )
}
