import { supabase } from '../lib/supabase'
import { isSuperAdminProfile } from '../utils/access'
import { normalizeOptionalUuid } from '../utils/schoolAccess'

export const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  student: '/student/dashboard',
}

const INVALID_CREDENTIALS_MESSAGE = 'Correo o contrasena incorrectos.'
const MISSING_PROFILE_MESSAGE = 'Tu cuenta no tiene un perfil activo. Contacta a administracion.'
const PENDING_APPROVAL_MESSAGE = 'Tu acceso todavia esta pendiente de aprobacion.'
const REJECTED_APPROVAL_MESSAGE = 'Tu acceso fue rechazado. Contacta a administracion.'
const GENERIC_LOGIN_MESSAGE = 'No se pudo iniciar sesion. Intenta de nuevo.'

export async function fetchProfile(userId, authUser = null) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  if (!data) return null

  const metadata = authUser?.user_metadata ?? {}

  return {
    ...data,
    approval_status: data.approval_status || metadata.approval_status || 'approved',
    school_id: normalizeOptionalUuid(data.school_id || metadata.school_id),
  }
}

export async function fetchAvailableSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select('id, nombre, configurado')
    .order('nombre', { ascending: true })

  if (error) throw error

  return data ?? []
}

export async function resolveDashboardPath(profile) {
  if (!profile?.role) return '/login'

  if (isSuperAdminProfile(profile)) {
    return '/super-admin/dashboard'
  }

  if (profile.role === 'admin') {
    const schoolId = normalizeOptionalUuid(profile.school_id)
    if (!schoolId) return '/director/register'

    const { data, error } = await supabase
      .from('schools')
      .select('id, configurado')
      .eq('id', schoolId)
      .maybeSingle()

    if (error) throw error

  return data?.configurado ? '/admin/dashboard' : '/admin/center'
  }

  return ROLE_DASHBOARDS[profile.role] ?? '/login'
}

export async function signInWithProfile({ email, password, schoolId }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw normalizeAuthError(error)
  }

  try {
    const profile = await fetchProfile(data.user.id, data.user)
    validateProfileAccess(profile, schoolId)

    return {
      session: data.session,
      user: data.user,
      profile: {
        ...profile,
        school_id: normalizeOptionalUuid(profile?.school_id),
      },
    }
  } catch (validationError) {
    await supabase.auth.signOut()
    throw validationError
  }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    throw normalizeAuthError(error)
  }

  return data
}

export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) throw error
}

function validateProfileAccess(profile, schoolId) {
  if (!profile) {
    throw new Error(MISSING_PROFILE_MESSAGE)
  }

  const normalizedSchoolId = normalizeOptionalUuid(schoolId)
  const profileSchoolId = normalizeOptionalUuid(profile.school_id)

  const role = String(profile.role || '').trim().toLowerCase()
  const approvalStatus = String(profile.approval_status || 'approved').trim().toLowerCase()

  if (approvalStatus === 'pending') {
    throw new Error(PENDING_APPROVAL_MESSAGE)
  }

  if (approvalStatus === 'rejected') {
    throw new Error(REJECTED_APPROVAL_MESSAGE)
  }

  if (isSuperAdminProfile(profile)) {
    return
  }

  if (role === 'admin') {
    if (!normalizedSchoolId) {
      throw new Error('Selecciona el centro educativo para validar tu acceso directivo.')
    }

    if (!profileSchoolId) {
      throw new Error('Tu cuenta directiva no tiene un centro asignado. El super admin debe asignarte un centro.')
    }

    if (profileSchoolId !== normalizedSchoolId) {
      throw new Error('Ese director no pertenece al centro seleccionado.')
    }

    return
  }

  if (normalizedSchoolId && profileSchoolId && profileSchoolId !== normalizedSchoolId) {
    throw new Error('Ese usuario pertenece a otro centro. Revisa el centro seleccionado.')
  }
}

function normalizeAuthError(error) {
  const message = error?.message ?? ''

  if (message === 'Invalid login credentials') {
    return new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  if (message === 'Email not confirmed') {
    return new Error('Tu correo aun no fue confirmado.')
  }

  if (!message) {
    return new Error(GENERIC_LOGIN_MESSAGE)
  }

  return new Error(message)
}
