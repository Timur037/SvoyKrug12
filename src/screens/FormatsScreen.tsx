import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../theme'
import { Grain } from '../components/Grain'
import { haptic } from '../lib/telegram'
import { FORMATS } from '../data/formats'
import type { Format } from '../data/formats'
import type { GenderFilter } from '../lib/db'

export function FormatsScreen() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const navigate = useNavigate()

  function toggle(id: string) {
    haptic('light')
    setExpanded((prev) => (prev === id ? null : id))
  }

  function applyFormat(id: GenderFilter | 'all') {
    haptic('medium')
    navigate('/home', { state: { format: id } })
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100dvh',
      background: COLORS.cream,
      color: COLORS.ink,
      overflowX: 'hidden',
    }}>
      <Grain opacity={0.22} />

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(245,239,230,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(26,22,18,0.06)',
        padding: '52px 22px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => { haptic('light'); navigate(-1) }}
          style={{
            width: 36, height: 36,
            borderRadius: RADII.full,
            background: 'rgba(26,22,18,0.06)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label="Назад"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke={COLORS.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <div style={{ ...serifStyle, fontSize: 22, lineHeight: 1.1, color: COLORS.ink }}>Форматы</div>
          <div style={{ ...sansStyle, fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>выберите как хотите провести вечер</div>
        </div>
      </div>

      {/* Format cards */}
      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FORMATS.map((f) => (
          <FormatCard
            key={f.id}
            format={f}
            isExpanded={expanded === f.id}
            onToggle={() => toggle(f.id)}
            onApply={() => applyFormat(f.id as GenderFilter)}
          />
        ))}
      </div>
    </div>
  )
}

function FormatCard({
  format: f,
  isExpanded,
  onToggle,
  onApply,
}: {
  format: Format
  isExpanded: boolean
  onToggle: () => void
  onApply: () => void
}) {
  const rgb = f.color

  return (
    <div style={{
      borderRadius: RADII.xl,
      background: COLORS.white,
      boxShadow: isExpanded ? SHADOWS.card : '0 1px 4px rgba(26,22,18,0.06)',
      border: `1.5px solid ${isExpanded ? `rgba(${rgb},0.25)` : 'rgba(26,22,18,0.06)'}`,
      overflow: 'hidden',
      transition: 'box-shadow 220ms, border-color 220ms',
    }}>
      {/* Card header — always visible, tap to expand */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '18px 18px 16px',
          background: isExpanded ? `rgba(${rgb},0.05)` : 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          transition: 'background 220ms',
        }}
      >
        {/* Emoji badge */}
        <div style={{
          width: 48, height: 48,
          borderRadius: RADII.lg,
          background: `rgba(${rgb},0.10)`,
          border: `1.5px solid rgba(${rgb},0.18)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}>
          {f.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...serifStyle, fontSize: 20, color: COLORS.ink, lineHeight: 1.15 }}>{f.name}</div>
          <div style={{ ...sansStyle, fontSize: 12, color: `rgb(${rgb})`, fontWeight: 600, marginTop: 3 }}>{f.tagline}</div>
          <div style={{
            ...sansStyle, fontSize: 11, color: COLORS.inkSoft, marginTop: 4,
            background: `rgba(${rgb},0.08)`,
            display: 'inline-block', padding: '2px 8px', borderRadius: RADII.full,
          }}>
            {f.who}
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          style={{ flexShrink: 0, transition: 'transform 220ms', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6" stroke={COLORS.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 18px 20px' }}>
          <div style={{
            height: 1,
            background: `rgba(${rgb},0.12)`,
            marginBottom: 16,
          }} />

          {/* Description */}
          <p style={{
            ...sansStyle,
            fontSize: 14,
            lineHeight: 1.65,
            color: COLORS.ink,
            margin: '0 0 16px',
          }}>
            {f.description}
          </p>

          {/* Details bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <div style={{ ...sansStyle, fontSize: 11, fontWeight: 700, color: COLORS.inkSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              что вас ждёт
            </div>
            {f.details.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: `rgb(${rgb})`,
                  flexShrink: 0,
                  marginTop: 6,
                }} />
                <span style={{ ...sansStyle, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onApply}
            style={{
              width: '100%',
              padding: '13px 0',
              borderRadius: RADII.full,
              background: `rgb(${rgb})`,
              color: COLORS.cream,
              border: 'none',
              ...sansStyle,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 16px rgba(${rgb},0.30)`,
              letterSpacing: '-0.01em',
            }}
          >
            Смотреть круги →
          </button>
        </div>
      )}
    </div>
  )
}
