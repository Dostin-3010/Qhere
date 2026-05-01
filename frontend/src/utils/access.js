const SUPER_ADMIN_EMAILS = ['duspolsyttt@gmail.com']

export function normalizeEmail(value = '') {
  return value.trim().toLowerCase()
}

export function isSuperAdminEmail(email) {
  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email))
}

export function isSuperAdminProfile(profile) {
  return profile?.role === 'admin' && isSuperAdminEmail(profile?.email)
}

export function getRoleLabel(role) {
  return {
    admin: 'Direccion',
    teacher: 'Docente',
    parent: 'Familia',
    student: 'Estudiante',
  }[role] ?? 'Perfil'
}

export function getStaffRoleLabel(role) {
  return role === 'admin' ? 'Administrador / director' : 'Docente'
}

export function getSchoolScopedRole(profile) {
  if (isSuperAdminProfile(profile)) return 'Super admin'
  return getRoleLabel(profile?.role)
}
