import { clearLocalAuthSession, isInvalidAuthSessionError, supabase } from '../lib/supabase'

const API_URL = (import.meta.env.VITE_API_URL || '')
  .replace(/\/$/, '')
  .replace(/\/api$/, '')

function normalizeOptionalUuid(value) {
  if (value === undefined || value === null) return null

  const normalized = String(value).trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return null
  }

  return normalized
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token || ''
}

async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('No se encontro una sesion valida para esta accion.')
    }
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload.error || payload.message || 'No se pudo completar la solicitud.'
    if (response.status === 401 && isInvalidAuthSessionError(message)) {
      await clearLocalAuthSession()
      window.dispatchEvent(new CustomEvent('qhere:auth-session-cleared'))
      throw new Error('Tu sesion anterior ya no existe. Vuelve a iniciar sesion.')
    }
    throw new Error(message)
  }

  return payload
}

export function requestDirectorAccess(payload) {
  return apiRequest('/api/management/director-requests', {
    method: 'POST',
    body: {
      ...payload,
      school_id: normalizeOptionalUuid(payload?.school_id),
    },
    auth: false,
  })
}

export function createManagedUser(payload) {
  return apiRequest('/api/management/users', {
    method: 'POST',
    body: {
      ...payload,
      school_id: normalizeOptionalUuid(payload?.school_id),
    },
  })
}

export function fetchManagedUsers({ role } = {}) {
  const params = new URLSearchParams()
  if (role) params.set('role', role)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiRequest(`/api/management/users${suffix}`)
}

export function fetchSuperAdminOverview() {
  return apiRequest('/api/management/super-admin/overview')
}

export function updateDirectorApproval(profileId, action, note = '') {
  return apiRequest(`/api/management/super-admin/directors/${profileId}/${action}`, {
    method: 'POST',
    body: { note },
  })
}

export function createSchool(payload) {
  return apiRequest('/api/management/super-admin/schools', {
    method: 'POST',
    body: payload,
  })
}

export function updateSchool(schoolId, payload) {
  return apiRequest(`/api/management/super-admin/schools/${schoolId}`, {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteSchool(schoolId, { force = true } = {}) {
  const suffix = force ? '?force=true' : ''
  return apiRequest(`/api/management/super-admin/schools/${schoolId}${suffix}`, {
    method: 'DELETE',
  })
}

export function assignDirectorToSchool(schoolId, directorProfileId) {
  return apiRequest(`/api/management/super-admin/schools/${schoolId}/assign-director`, {
    method: 'POST',
    body: { director_profile_id: normalizeOptionalUuid(directorProfileId) },
  })
}

export function updateSuperAdminUser(profileId, payload) {
  return apiRequest(`/api/management/super-admin/users/${profileId}`, {
    method: 'PATCH',
    body: {
      ...payload,
      school_id: normalizeOptionalUuid(payload?.school_id),
    },
  })
}

export function deleteSuperAdminUser(profileId) {
  return apiRequest(`/api/management/super-admin/users/${profileId}`, {
    method: 'DELETE',
  })
}
