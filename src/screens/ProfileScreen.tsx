import { useState, type CSSProperties } from 'react'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { TabBar } from '../components/TabBar'
import { haptic } from '../lib/telegram'

type StickerKind = 'tomato' | 'ink' | 'cream' | 'forest' | 'honey'

interface VibeTag {
  t: string
  size: number
  rot: number
  kind: StickerKind
}

const VIBE_TAGS: VibeTag[] = [
  { t: 'разговоры о работе — нет',   size: 22, rot: -3, kind: 'tomato' },
  { t: 'вино, не виски',             size: 18, rot:  2, kind: 'ink'    },
  { t: 'утро > ночь',                size: 17, rot: -1, kind: 'cream'  },
  { t: 'десерт — да',                size: 14, rot:  4, kind: 'honey'  },
  { t: 'тёплые улицы, не клубы',     size: 20, rot:  1, kind: 'forest' },
  { t: 'смешно > глубоко',           size: 15, rot: -3, kind: 'cream'  },
  { t: 'один раз в неделю — хватит', size: 16, rot:  2, kind: 'tomato' },
]

const SETTINGS = [
  { l: 'только дружба', v: 'включено', tomato: true },
  { l: 'районы города', v: 'центр, замоскворечье' },
  { l: 'дни недели', v: 'чт · пт · сб' },
  { l: 'пауза', v: 'выключена' },
] as const

function palette(k: StickerKind): { bg: string; c: string; br: string; shadow: string } {
  switch (k) {
    case 'tomato':
      return {
        bg: COLORS.tomato,
        c: COLORS.cream,
        br: 'none',
        shadow: '0 8px 18px rgba(232,71,44,0.32), 0 1px 0 rgba(26,22,18,0.08)',
      }
    case 'ink':
      return {
        bg: COLORS.ink,
        c: COLORS.cream,
        br: 'none',
        shadow: '0 8px 18px rgba(26,22,18,0.30), 0 1px 0 rgba(26,22,18,0.08)',
      }
    case 'forest':
      return {
        bg: COLORS.forest,
        c: COLORS.cream,
        br: 'none',
        shadow: '0 8px 18px rgba(45,74,62,0.32), 0 1px 0 rgba(26,22,18,0.08)',
      }
    case 'honey':
      return {
        bg: COLORS.honey,
        c: COLORS.ink,
        br: 'none',
        shadow: '0 8px 18px rgba(244,201,93,0.45), 0 1px 0 rgba(26,22,18,0.06)',
      }
    case 'cream':
    default:
      return {
        bg: '#fff',
        c: COLORS.ink,
        br: '1px solid rgba(26,22,18,0.10)',
        shadow: '0 4px 12px rgba(26,22,18,0.10), 0 1px 0 rgba(26,22,18,0.04)',
      }
  }
}

function padFor(size: number): string {
  if (size >= 20) return '12px 18px'
  if (size >= 16) return '10px 14px'
  return '7px 11px'
}

export function ProfileScreen() {
  const [tags, setTags] = useState<VibeTag[]>(VIBE_TAGS)

  const root: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    background: COLORS.cream,
    color: COLORS.ink,
    overflowX: 'hidden',
    overflowY: 'auto',
  }

  function addVibe() {
    haptic('light')
    const candidates: Array<Pick<VibeTag, 't' | 'kind'>> = [
      { t: 'кофе с молоком', kind: 'cream' },
      { t: 'пешком по городу', kind: 'forest' },
      { t: 'без громкой музыки', kind: 'ink' },
      { t: 'книги > сериалы', kind: 'tomato' },
      { t: 'свет > тёмные комнаты', kind: 'honey' },
    ]
    const used = new Set(tags.map((t) => t.t))
    const next = candidates.find((c) => !used.has(c.t))
    if (!next) return
    const sizes = [14, 17, 20, 22]
    const rotations = [-4, -2, 1, 3, -1]
    const fallbackSize = sizes[tags.length % sizes.length] ?? 17
    const fallbackRot = rotations[tags.length % rotations.length] ?? 0
    setTags((prev) => [
      ...prev,
      {
        t: next.t,
        kind: next.kind,
        size: fallbackSize,
        rot: fallbackRot,
      },
    ])
  }

  return (
    <div style={root}>
      <Grain opacity={0.3} />
      <div style={{ paddingTop: 64, paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ padding: '0 22px 14px' }}>
          <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.inkSoft, textTransform: 'uppercase' }}>
            вы
          </div>
          <h1 style={{ margin: '10px 0 0', fontSize: 46, lineHeight: 0.98, letterSpacing: '-0.025em' }}>
            <span style={serifStyle}>Артём,</span>
            <br />
            <span style={{ ...sansStyle, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>29.</span>
          </h1>
          <div style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, marginTop: 6 }}>
            в Свой Круг с октября ·{' '}
            <span style={{ color: COLORS.ink, fontWeight: 700 }}>4 вечера</span>
          </div>
        </div>

        {/* Stats ink block */}
        <div style={{
          margin: '0 22px 22px',
          borderRadius: 24,
          padding: '22px',
          background: COLORS.ink,
          color: COLORS.cream,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Grain opacity={0.3} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {[
              { n: 4, l: 'вечеров', accent: true },
              { n: 23, l: 'людей встречено', accent: false },
              { n: 7, l: 'мест в Москве', accent: false },
            ].map((s) => (
              <div key={s.l}>
                <div style={{
                  ...serifStyle,
                  fontSize: 46,
                  lineHeight: 1,
                  color: s.accent ? COLORS.tomato : COLORS.cream,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.n}
                </div>
                <div style={{
                  ...sansStyle,
                  fontSize: 11,
                  color: 'rgba(245,239,230,0.72)',
                  marginTop: 6,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const,
                }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticker vibes */}
        <div style={{ padding: '0 22px 22px' }}>
          <div style={{
            ...serifStyle,
            fontSize: 32,
            color: COLORS.ink,
            lineHeight: 1,
            marginBottom: 18,
          }}>
            вы — это
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px 10px',
            alignItems: 'center',
            paddingBottom: 6,
          }}>
            {tags.map((tag, i) => {
              const p = palette(tag.kind)
              return (
                <button
                  key={`${tag.t}-${i}`}
                  style={{
                    background: p.bg,
                    color: p.c,
                    border: p.br,
                    padding: padFor(tag.size),
                    borderRadius: 14,
                    ...sansStyle,
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: tag.size,
                    letterSpacing: '-0.01em',
                    transform: `rotate(${tag.rot}deg)`,
                    boxShadow: p.shadow,
                    cursor: 'pointer',
                    transition: 'transform .25s ease',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => haptic('light')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = `rotate(${tag.rot * 0.4}deg) scale(1.04)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${tag.rot}deg) scale(1)`
                  }}
                >
                  {tag.t}
                </button>
              )
            })}
            <button
              onClick={addVibe}
              style={{
                padding: '9px 14px',
                borderRadius: 14,
                background: 'transparent',
                color: COLORS.inkSoft,
                border: '1.5px dashed rgba(26,22,18,0.22)',
                ...sansStyle,
                fontSize: 14,
                fontWeight: 500,
                transform: 'rotate(-1deg)',
                cursor: 'pointer',
              }}
            >
              + добавить вайб
            </button>
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '0 22px' }}>
          <div style={{
            ...sansStyle,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: COLORS.inkSoft,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            настройки
          </div>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            border: '1px solid rgba(26,22,18,0.06)',
            overflow: 'hidden',
          }}>
            {SETTINGS.map((row, i) => (
              <button
                key={row.l}
                style={{
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(26,22,18,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => haptic('light')}
              >
                <span style={{ ...sansStyle, fontSize: 14, fontWeight: 500, color: COLORS.ink }}>
                  {row.l}
                </span>
                <span style={{
                  ...sansStyle,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'tomato' in row && row.tomato ? COLORS.tomato : COLORS.inkSoft,
                }}>
                  {row.v} →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <TabBar active="me" />
    </div>
  )
}
