const ACTIVE_SCHOOL_KEY = 'qhere:active-school'
const LAST_SCHOOL_KEY = 'qhere:last-school'

export function normalizeOptionalUuid(value) {
  if (value === undefined || value === null) return null

  const normalized = String(value).trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return null
  }

  return normalized
}

export function getStoredSchoolId() {
  if (typeof window === 'undefined') return null

  try {
    return (
      normalizeOptionalUuid(window.sessionStorage.getItem(ACTIVE_SCHOOL_KEY)) ||
      normalizeOptionalUuid(window.localStorage.getItem(LAST_SCHOOL_KEY))
    )
  } catch {
    return null
  }
}

export function resolveActiveSchoolId(profile) {
  const profileSchoolId = normalizeOptionalUuid(profile?.school_id)

  if (profileSchoolId) return profileSchoolId

  if (profile?.role === 'admin') return null

  return getStoredSchoolId()
}

export { ACTIVE_SCHOOL_KEY, LAST_SCHOOL_KEY }
