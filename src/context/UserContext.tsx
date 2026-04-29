import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { upsertUser, type AppUser } from '../lib/user'

interface UserCtx {
  user: AppUser | null
  loading: boolean
}

const UserContext = createContext<UserCtx>({ user: null, loading: true })

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    upsertUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserCtx {
  return useContext(UserContext)
}
