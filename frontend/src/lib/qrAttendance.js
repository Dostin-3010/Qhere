import { BarcodeFormat, QRCodeWriter } from 'html5-qrcode/third_party/zxing-js.umd.js'

const qrWriter = new QRCodeWriter()

export function createStudentQrToken() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, '')
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function buildStudentQrPayload(student) {
  if (!student?.id) return ''
  return `QHERE:${student.id}:${student.qr_token || student.matricula || ''}`
}

export function parseStudentQrPayload(decodedText) {
  if (typeof decodedText !== 'string' || !decodedText.startsWith('QHERE:')) {
    return null
  }

  const parts = decodedText.split(':')
  if (parts.length < 3) return null

  return {
    studentId: parts[1],
    credential: parts.slice(2).join(':'),
  }
}

export function timeToMinutes(value) {
  if (!value || typeof value !== 'string' || !value.includes(':')) return 0
  const [hours, minutes] = value.split(':').map(Number)
  return ((Number.isFinite(hours) ? hours : 0) * 60) + (Number.isFinite(minutes) ? minutes : 0)
}

export function minutesToTimeString(value) {
  const total = Math.max(0, Number.isFinite(value) ? value : 0)
  const hours = Math.floor(total / 60) % 24
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function addMinutesToTime(timeValue, deltaMinutes) {
  return minutesToTimeString(timeToMinutes(timeValue) + (Number(deltaMinutes) || 0))
}

export function getTeacherGraceMinutes(profile, schedule) {
  const configured = Number(profile?.margen_tardanza_minutos)
  if (Number.isFinite(configured) && configured >= 0) {
    return configured
  }

  if (schedule?.hora_entrada && schedule?.hora_limite_tardanza) {
    return Math.max(0, timeToMinutes(schedule.hora_limite_tardanza) - timeToMinutes(schedule.hora_entrada))
  }

  return 30
}

export function buildEffectiveSchedule(schedule, profile) {
  const baseEntry = schedule?.hora_entrada || '07:00'
  const baseExit = schedule?.hora_salida || addMinutesToTime(baseEntry, 300)
  const graceMinutes = getTeacherGraceMinutes(profile, schedule)

  return {
    ...schedule,
    hora_entrada: baseEntry,
    hora_salida: baseExit,
    hora_limite_tardanza: addMinutesToTime(baseEntry, graceMinutes),
    margen_tardanza_minutos: graceMinutes,
  }
}

export function getScanAttendanceMeta(scanTime, schedule, profile) {
  const effectiveSchedule = buildEffectiveSchedule(schedule, profile)
  const scanMinutes = timeToMinutes(scanTime)
  const lateLimitMinutes = timeToMinutes(effectiveSchedule.hora_limite_tardanza)
  const lateMinutes = Math.max(0, scanMinutes - lateLimitMinutes)

  return {
    ...effectiveSchedule,
    lateMinutes,
    status: lateMinutes > 0 ? 'tarde' : 'presente',
    statusLabel: lateMinutes > 0 ? 'Tardanza' : 'A tiempo',
  }
}

export function buildQrSvgMarkup(value, size = 240, options = {}) {
  if (!value) return ''

  try {
    const foreground = options.foreground || '#111111'
    const background = options.background || '#ffffff'
    const bitMatrix = qrWriter.encode(value, BarcodeFormat.QR_CODE, size, size, new Map())
    const width = bitMatrix.getWidth()
    const height = bitMatrix.getHeight()
    const rects = []

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (bitMatrix.get(x, y)) {
          rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${foreground}" style="fill: ${foreground} !important;" />`)
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
        <rect width="${width}" height="${height}" fill="${background}" style="fill: ${background} !important;" />
        ${rects.join('')}
      </svg>
    `.trim()
  } catch (error) {
    console.error('Error building QR SVG:', error)
    return ''
  }
}
