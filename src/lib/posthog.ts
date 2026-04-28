import posthog from 'posthog-js'

let initialized = false

export function initPostHog(): void {
  if (initialized) return
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
  if (!key) return

  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing()
    },
  })
  initialized = true
}

export { posthog }
