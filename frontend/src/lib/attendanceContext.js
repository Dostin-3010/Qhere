const DEVICE_STORAGE_KEY = 'qhere.device_fingerprint.v1'

function createFallbackFingerprint() {
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function getOrCreateDeviceFingerprint() {
  const stored = window.localStorage.getItem(DEVICE_STORAGE_KEY)
  if (stored) return stored

  const next = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : createFallbackFingerprint()

  window.localStorage.setItem(DEVICE_STORAGE_KEY, next)
  return next
}

function resolveDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/android/.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop'
  return 'web'
}

function resolveBrowserName() {
  const userAgent = navigator.userAgent

  if (userAgent.includes('Edg/')) return 'Edge'
  if (userAgent.includes('Chrome/')) return 'Chrome'
  if (userAgent.includes('Firefox/')) return 'Firefox'
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari'
  return 'Navegador'
}

export function getDeviceContext() {
  const browser = resolveBrowserName()
  const platform = navigator.platform || 'web'

  return {
    deviceFingerprint: getOrCreateDeviceFingerprint(),
    deviceName: `${browser} en ${platform}`,
    deviceType: resolveDeviceType(),
    platform,
    appVersion: import.meta.env.VITE_APP_VERSION || 'frontend-web',
  }
}

export function getGeoContext({ enabled = true, timeoutMs = 5000 } = {}) {
  if (!enabled || !('geolocation' in navigator)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'web',
        })
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60_000,
      },
    )
  })
}

export async function buildAttendanceContext(options = {}) {
  const device = getDeviceContext()
  const geo = await getGeoContext(options)

  return {
    ...device,
    geo,
  }
}
