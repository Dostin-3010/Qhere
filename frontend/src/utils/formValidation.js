export const MAX_EMAIL_LENGTH = 254
export const RD_PHONE_LENGTH = 10

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RD_PHONE_PATTERN = /^(809|829|849)\d{7}$/

export function normalizeEmail(value = '') {
  return value.trim().toLowerCase()
}

export function validateEmail(value, label = 'correo') {
  const email = normalizeEmail(value)

  if (!email) return `El ${label} es obligatorio.`
  if (email.length > MAX_EMAIL_LENGTH) return `El ${label} no puede pasar de ${MAX_EMAIL_LENGTH} caracteres.`
  if (!EMAIL_PATTERN.test(email)) return `Escribe un ${label} valido, por ejemplo nombre@gmail.com.`

  return ''
}

export function getPhoneDigits(value = '') {
  return String(value).replace(/\D/g, '').slice(0, RD_PHONE_LENGTH)
}

export function formatDominicanPhone(value = '') {
  const digits = getPhoneDigits(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function validateDominicanPhone(value, { required = false, label = 'telefono' } = {}) {
  const digits = getPhoneDigits(value)

  if (!digits && !required) return ''
  if (!digits && required) return `El ${label} es obligatorio.`
  if (digits.length !== RD_PHONE_LENGTH) return `El ${label} debe tener 10 digitos. Ejemplo: 809-000-0000.`
  if (!RD_PHONE_PATTERN.test(digits)) return `El ${label} debe iniciar con 809, 829 o 849.`

  return ''
}
