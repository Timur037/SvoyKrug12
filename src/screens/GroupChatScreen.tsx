import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, serifStyle, sansStyle } from '../theme'
import { haptic } from '../lib/telegram'

type Message = {
  id: string
  senderId: string
  senderName: string
  text: string
  time: string
}

const MOCK_PARTICIPANTS = [
  { id: 'u1', name: 'Маша', age: 28 },
  { id: 'u2', name: 'Саша', age: 31 },
  { id: 'u3', name: 'Лёня', age: 26 },
  { id: 'you', name: 'Вы', age: 0 },
]

const MOCK_MESSAGES: Message[] = [
  { id: '1', senderId: 'u1', senderName: 'Маша', text: 'Привет всем! Не могу дождаться 🙌', time: '19:02' },
  { id: '2', senderId: 'u2', senderName: 'Саша', text: 'Привет! Я первый раз, немного волнуюсь', time: '19:04' },
  { id: '3', senderId: 'u1', senderName: 'Маша', text: 'Я тоже первый раз, но говорят всегда классно выходит', time: '19:05' },
  { id: '4', senderId: 'you', senderName: 'Вы', text: 'Отлично! Я уже был на одном — уверен, понравится', time: '19:08' },
  { id: '5', senderId: 'u3', senderName: 'Лёня', text: 'Ребят, кто-нибудь знает где точно вход в ресторан? Со стороны Тверской или с переулка?', time: '19:11' },
  { id: '6', senderId: 'u2', senderName: 'Саша', text: 'Вход с Тверской, 22, спросите хостес «столик Свой Круг»', time: '19:13' },
  { id: '7', senderId: 'u3', senderName: 'Лёня', text: 'Спасибо! 👍', time: '19:14' },
]

const CIRCLE_TITLES: Record<string, string> = {
  'mock-1': 'Ужин у камина',
  'mock-2': 'Утренний кофе',
  'mock-3': 'Вино и идеи',
  'mock-4': 'Долгий ужин на Покровке',
}

function getCircleTitle(): string {
  try {
    const id = localStorage.getItem('svoy_krug_last_circle')
    if (id && CIRCLE_TITLES[id]) return CIRCLE_TITLES[id]
  } catch {
    // ignore
  }
  return 'Группа'
}

function nowHM(): string {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function GroupChatScreen() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const title = useMemo(() => getCircleTitle(), [])
  const participantsCount = MOCK_PARTICIPANTS.length

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    haptic('light')
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      senderId: 'you',
      senderName: 'Вы',
      text,
      time: nowHM(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        background: COLORS.ink,
        color: COLORS.cream,
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: '44px 22px 14px',
          background: 'rgba(26,22,18,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(245,239,230,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => {
            haptic('light')
            navigate(-1)
          }}
          aria-label="Назад"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(245,239,230,0.06)',
            border: '1px solid rgba(245,239,230,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.cream,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke={COLORS.cream}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <div
            style={{
              ...serifStyle,
              fontSize: 19,
              color: COLORS.cream,
              lineHeight: 1.1,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
          <div
            style={{
              ...sansStyle,
              fontSize: 11,
              color: 'rgba(245,239,230,0.5)',
              marginTop: 2,
            }}
          >
            {participantsCount} участников
          </div>
        </div>
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>

      {/* Messages list */}
      <div
        style={{
          paddingTop: 110,
          paddingLeft: 14,
          paddingRight: 14,
          paddingBottom: 90,
        }}
      >
        <div
          style={{
            ...sansStyle,
            fontSize: 11,
            color: 'rgba(245,239,230,0.35)',
            textAlign: 'center',
            margin: '16px 0',
          }}
        >
          Чат открыт за 24 часа до встречи
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {messages.map((msg, idx) => {
            const isOwn = msg.senderId === 'you'
            const prev = messages[idx - 1]
            const isFirstInSequence = !prev || prev.senderId !== msg.senderId
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                  marginTop: isFirstInSequence ? 10 : 2,
                }}
              >
                {!isOwn && isFirstInSequence && (
                  <div
                    style={{
                      ...sansStyle,
                      fontSize: 11,
                      color: 'rgba(245,239,230,0.5)',
                      marginLeft: 12,
                      marginBottom: 4,
                    }}
                  >
                    {msg.senderName}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '8px 12px',
                    background: isOwn ? COLORS.tomato : 'rgba(245,239,230,0.10)',
                    color: COLORS.cream,
                    borderRadius: isOwn
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    ...sansStyle,
                    fontSize: 14,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    ...sansStyle,
                    fontSize: 10,
                    color: 'rgba(245,239,230,0.4)',
                    marginTop: 3,
                    paddingLeft: isOwn ? 0 : 12,
                    paddingRight: isOwn ? 6 : 0,
                  }}
                >
                  {msg.time}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: '12px 16px calc(env(safe-area-inset-bottom,0px) + 12px)',
          background: 'rgba(26,22,18,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(245,239,230,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="написать..."
          style={{
            flex: 1,
            background: 'rgba(245,239,230,0.08)',
            border: '1px solid rgba(245,239,230,0.12)',
            borderRadius: 99,
            padding: '10px 16px',
            color: COLORS.cream,
            ...sansStyle,
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Отправить"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: COLORS.tomato,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            opacity: input.trim() ? 1 : 0.4,
            flexShrink: 0,
            transition: 'opacity 180ms ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12l18-9-7 18-3-7-8-2z"
              stroke={COLORS.cream}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <style>{`
        input::placeholder {
          color: rgba(245,239,230,0.3);
        }
      `}</style>
    </div>
  )
}
