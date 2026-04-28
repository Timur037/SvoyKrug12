import type { TelegramUser } from '../types'

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    start_param?: string
    auth_date?: number
    hash?: string
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  MainButton: {
    text: string
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
    setText: (text: string) => void
  }
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

export function getWebApp(): TelegramWebApp | undefined {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
}

export function getUser(): TelegramUser | undefined {
  return getWebApp()?.initDataUnsafe?.user
}

export function expandApp(): void {
  const wa = getWebApp()
  if (!wa) return
  try {
    wa.ready()
    wa.expand()
  } catch {
    // ignore — running outside Telegram
  }
}

export function setHeaderColor(color: string): void {
  const wa = getWebApp()
  if (!wa) return
  try {
    wa.setHeaderColor(color)
  } catch {
    // ignore
  }
}

export function setBackgroundColor(color: string): void {
  const wa = getWebApp()
  if (!wa) return
  try {
    wa.setBackgroundColor(color)
  } catch {
    // ignore
  }
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  const wa = getWebApp()
  if (!wa) return
  try {
    wa.HapticFeedback.impactOccurred(style)
  } catch {
    // ignore
  }
}
