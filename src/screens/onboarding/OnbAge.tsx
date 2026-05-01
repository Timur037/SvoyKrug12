import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, RADII, SHADOWS, serifStyle, sansStyle } from '../../theme'
import { OnbShell } from '../../components/OnbShell'
import { haptic } from '../../lib/telegram'

const MIN_AGE = 18
const MAX_AGE = 65

export function OnbAge() {
  const navigate = useNavigate()
  const [age, setAge] = useState(27)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function decrement() { if (age > MIN_AGE) { haptic('light'); setAge(v => v - 1) } }
  function increment() { if (age < MAX_AGE) { haptic('light'); setAge(v => v + 1) } }

  function startEditing() {
    haptic('light')
    setInputVal(String(age))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  function commitInput() {
    const parsed = parseInt(inputVal, 10)
    if (!isNaN(parsed)) {
      setAge(Math.min(MAX_AGE, Math.max(MIN_AGE, parsed)))
    }
    setEditing(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitInput()
    if (e.key === 'Escape') setEditing(false)
  }

  function next() {
    haptic('medium')
    try { localStorage.setItem('svoy_krug_age', String(age)) } catch { /* ignore */ }
    navigate('/onboarding/work')
  }

  return (
    <OnbShell step={2} total={7} backTo="/onboarding/gender">
      <div style={{ padding: '32px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: '0 0 8px', ...serifStyle, fontSize: 40, lineHeight: 1.0, color: COLORS.ink }}>
          сколько вам лет?
        </h1>
        <p style={{ ...sansStyle, fontSize: 14, color: COLORS.inkSoft, margin: '0 0 48px' }}>
          нажмите на цифру чтобы ввести
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 'auto' }}>
          {/* Minus */}
          <button
            onClick={decrement}
            disabled={age <= MIN_AGE}
            style={{
              width: 56, height: 56, borderRadius: RADII.full,
              background: COLORS.white, border: '1.5px solid rgba(26,22,18,0.12)',
              boxShadow: SHADOWS.chip, ...sansStyle, fontSize: 22, fontWeight: 300,
              color: age <= MIN_AGE ? COLORS.inkSoft : COLORS.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: age <= MIN_AGE ? 'default' : 'pointer',
              opacity: age <= MIN_AGE ? 0.4 : 1,
            }}
          >−</button>

          {/* Age display / input */}
          <div style={{ position: 'relative', minWidth: 130, textAlign: 'center' }}>
            {editing ? (
              <input
                ref={inputRef}
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onBlur={commitInput}
                onKeyDown={handleKey}
                autoFocus
                style={{
                  ...serifStyle,
                  fontSize: 100,
                  lineHeight: 1,
                  color: COLORS.tomato,
                  width: 150,
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${COLORS.tomato}`,
                  outline: 'none',
                  fontVariantNumeric: 'tabular-nums',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
            ) : (
              <button
                onClick={startEditing}
                title="Нажмите чтобы ввести возраст"
                style={{
                  ...serifStyle,
                  fontSize: 100,
                  lineHeight: 1,
                  color: COLORS.tomato,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'text',
                  fontVariantNumeric: 'tabular-nums',
                  padding: 0,
                  position: 'relative',
                }}
              >
                {age}
                {/* underline hint */}
                <span style={{
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 2,
                  background: 'rgba(232,71,44,0.25)',
                  borderRadius: 1,
                  display: 'block',
                }} />
              </button>
            )}
          </div>

          {/* Plus */}
          <button
            onClick={increment}
            disabled={age >= MAX_AGE}
            style={{
              width: 56, height: 56, borderRadius: RADII.full,
              background: COLORS.white, border: '1.5px solid rgba(26,22,18,0.12)',
              boxShadow: SHADOWS.chip, ...sansStyle, fontSize: 22, fontWeight: 300,
              color: age >= MAX_AGE ? COLORS.inkSoft : COLORS.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: age >= MAX_AGE ? 'default' : 'pointer',
              opacity: age >= MAX_AGE ? 0.4 : 1,
            }}
          >+</button>
        </div>
      </div>

      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10,
        padding: '16px 22px calc(env(safe-area-inset-bottom, 0px) + 16px)',
        background: 'rgba(245,239,230,0.95)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(26,22,18,0.07)',
      }}>
        <button
          onClick={next}
          style={{
            ...sansStyle, width: '100%', height: 56, borderRadius: RADII.full,
            fontSize: 15, fontWeight: 700, background: COLORS.tomato,
            color: COLORS.cream, border: 'none', boxShadow: SHADOWS.cta, cursor: 'pointer',
          }}
        >
          дальше →
        </button>
      </div>
    </OnbShell>
  )
}
