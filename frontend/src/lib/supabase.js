import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const INVALID_SESSION_PATTERNS = [
  'session from session_id claim in jwt does not exist',
  'invalid jwt',
  'jwt expired',
  'session not found',
  'auth session missing',
  'refresh token not found',
  'invalid refresh token',
]

function getSupabaseProjectRef() {
  try {
    return new URL(supabaseUrl).host.split('.')[0]
  } catch {
    return ''
  }
}

export function isInvalidAuthSessionError(errorOrMessage) {
  const message = String(errorOrMessage?.message || errorOrMessage?.error || errorOrMessage || '').toLowerCase()
  return INVALID_SESSION_PATTERNS.some((pattern) => message.includes(pattern))
}

export async function clearLocalAuthSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // If Supabase refuses the stale JWT, local storage cleanup below still fixes the browser state.
  }

  const projectRef = getSupabaseProjectRef()
  const storageKeys = []

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key) continue
      const isSupabaseAuthKey = key.startsWith('sb-') && key.includes('auth-token')
      const isCurrentProjectKey = projectRef && key.includes(projectRef)
      if (isSupabaseAuthKey || isCurrentProjectKey) storageKeys.push(key)
    }

    storageKeys.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Some browser contexts can block storage access; failing silently is safer here.
  }

  try {
    sessionStorage.clear()
  } catch {
    // Ignore unavailable sessionStorage.
  }
}
