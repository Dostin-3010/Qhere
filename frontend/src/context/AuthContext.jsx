import { createContext, useContext, useEffect, useState } from 'react'
import { fetchProfile } from '../api/authApi'
import { clearLocalAuthSession, isInvalidAuthSessionError, supabase } from '../lib/supabase'
import { resolveActiveSchoolId } from '../utils/schoolAccess'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const activeSchoolId = resolveActiveSchoolId(profile)

  useEffect(() => {
    let active = true

    async function syncSession(session) {
      if (!active) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const nextProfile = await fetchProfile(currentUser.id, currentUser)

        if (!active) return

        setProfile(nextProfile)
      } catch (error) {
        console.error('Error loading auth profile:', error)

        if (!active) return

        if (isInvalidAuthSessionError(error)) {
          await clearLocalAuthSession()
          setUser(null)
        }

        setProfile(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.access_token) {
          const { data, error } = await supabase.auth.getUser(session.access_token)
          if (error && isInvalidAuthSessionError(error)) {
            await clearLocalAuthSession()
            if (!active) return
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }
          await syncSession(data?.user ? { ...session, user: data.user } : session)
          return
        }

        await syncSession(session)
      } catch (error) {
        console.error('Error loading auth session:', error)

        if (!active) return

        if (isInvalidAuthSessionError(error)) {
          await clearLocalAuthSession()
        }

        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session)
    })

    function handleSessionCleared() {
      setUser(null)
      setProfile(null)
      setLoading(false)
    }

    window.addEventListener('qhere:auth-session-cleared', handleSessionCleared)

    return () => {
      active = false
      window.removeEventListener('qhere:auth-session-cleared', handleSessionCleared)
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error && !isInvalidAuthSessionError(error)) throw error
    if (error) await clearLocalAuthSession()

    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    if (!user?.id) {
      setProfile(null)
      return null
    }

    const nextProfile = await fetchProfile(user.id, user)
    setProfile(nextProfile)
    return nextProfile
  }

  return (
    <AuthContext.Provider value={{ user, profile, activeSchoolId, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
