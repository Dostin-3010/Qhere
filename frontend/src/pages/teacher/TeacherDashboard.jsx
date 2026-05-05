// ============================================================
// TeacherDashboard.jsx
// Ruta: /teacher/dashboard
// Prefijo CSS: .td-
// ANTES DE USAR: npm install html5-qrcode
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import jsQR from 'jsqr'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { buildEffectiveSchedule, parseStudentQrPayload, getScanAttendanceMeta } from '../../lib/qrAttendance'
import { buildAttendanceContext } from '../../lib/attendanceContext'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

// ─── Paleta de colores QHERE ────────────────────────────────
const C = {
  navy:      '#1B3F6B',
  navyDeep:  '#102847',
  navyMid:   '#2A5590',
  sky:       '#B8D4E8',
  skyLight:  '#D8EAF4',
  skyPale:   '#EEF6FB',
  skyMid:    '#8BBAD8',
  border:    '#C8DFF0',
  dark:      '#0D2238',
  mid:       '#4A6A8A',
}

// ─── Iconos SVG inline ──────────────────────────────────────
const IcoQR = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
    <rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/>
    <rect x="18" y="18" width="3" height="3"/>
  </svg>
)
const IcoList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/>
    <circle cx="3" cy="18" r="1" fill="currentColor"/>
  </svg>
)
const IcoInbox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
  </svg>
)
const IcoAbsences = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/>
  </svg>
)
const IcoLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IcoClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IcoEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// ─── Estilos globales ────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .td-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* ── Sidebar ── */
  .td-sidebar {
    width:240px; min-height:100vh; background:${C.navyDeep};
    display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100;
  }
  .td-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .td-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; letter-spacing:0.5px; }
  .td-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .td-nav { flex:1; padding:16px 0; }
  .td-nav-item {
    display:flex; align-items:center; gap:10px; padding:11px 24px;
    color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer;
    border-left:3px solid transparent; transition:all 0.18s; text-decoration:none;
  }
  .td-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .td-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .td-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .td-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .td-avatar {
    width:36px; height:36px; border-radius:50%; background:${C.navyMid};
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:600; color:#fff; flex-shrink:0;
  }
  .td-user-name { font-size:13px; color:#fff; font-weight:500; line-height:1.3; }
  .td-user-role { font-size:11px; color:${C.skyMid}; }
  .td-logout {
    display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px;
    background:rgba(255,80,80,0.12); border:none; border-radius:8px;
    color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s;
  }
  .td-logout:hover { background:rgba(255,80,80,0.22); }

  /* ── Main ── */
  .td-main { margin-left:240px; flex:1; padding:32px; }
  .td-header { margin-bottom:28px; }
  .td-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .td-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* ── Stats row ── */
  .td-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .td-stat {
    background:#fff; border-radius:12px; padding:18px 20px;
    border:1px solid ${C.border}; display:flex; align-items:center; gap:14px;
  }
  .td-stat-icon {
    width:42px; height:42px; border-radius:10px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .td-stat-val { font-size:22px; font-weight:700; color:${C.dark}; line-height:1; }
  .td-stat-label { font-size:12px; color:${C.mid}; margin-top:3px; }

  /* ── Tabs ── */
  .td-tabs { display:flex; gap:4px; margin-bottom:24px; background:#fff; padding:4px; border-radius:12px; border:1px solid ${C.border}; width:fit-content; }
  .td-tab {
    padding:9px 20px; border-radius:9px; border:none; background:transparent;
    font-size:14px; font-weight:500; color:${C.mid}; cursor:pointer; transition:all 0.18s;
    display:flex; align-items:center; gap:7px;
  }
  .td-tab.active { background:${C.navy}; color:#fff; }
  .td-tab:not(.active):hover { background:${C.skyLight}; color:${C.dark}; }

  /* ── Scanner panel ── */
  .td-scanner-wrap { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
  .td-card { background:#fff; border-radius:14px; border:1px solid ${C.border}; overflow:hidden; }
  .td-card-head { padding:18px 22px 14px; border-bottom:1px solid ${C.border}; }
  .td-card-head h3 { font-size:15px; font-weight:600; color:${C.dark}; }
  .td-card-head p { font-size:12px; color:${C.mid}; margin-top:2px; }
  .td-card-body { padding:20px 22px; }

  /* Visor QR */
  .td-qr-viewport {
    width:100%; aspect-ratio:1;
    background:
      radial-gradient(circle at 50% 45%, rgba(232,33,39,.12), transparent 25%),
      radial-gradient(circle at 78% 18%, rgba(255,255,255,.055), transparent 24%),
      linear-gradient(145deg, #070707 0%, #141414 52%, #0a0a0a 100%) !important;
    border:1px solid rgba(255,255,255,.12);
    border-radius:18px;
    display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.055), 0 22px 48px rgba(17,17,17,.22);
  }
  .td-qr-viewport::before {
    content:''; position:absolute; inset:18px; border-radius:14px;
    border:1px solid rgba(255,255,255,.13); pointer-events:none; z-index:1;
    background:linear-gradient(145deg, rgba(255,255,255,.025), rgba(255,255,255,0));
  }
  .td-qr-viewport::after {
    content:''; position:absolute; width:58%; height:2px; left:21%; top:50%;
    background:linear-gradient(90deg, transparent, #E82127, transparent);
    box-shadow:0 0 18px rgba(232,33,39,.75); pointer-events:none; z-index:2;
  }
  #td-qr-reader {
    width:100% !important; height:100% !important; min-height:320px;
    position:relative; display:flex; align-items:center; justify-content:center;
    background:transparent !important;
  }
  #td-qr-reader > div,
  #td-qr-reader > section {
    width:100% !important; height:100% !important;
    background:transparent !important;
  }
  #td-qr-reader video {
    width:100% !important; height:100% !important; display:block !important;
    object-fit:cover !important; background:transparent !important; border-radius:18px !important;
  }
  #td-qr-reader canvas { max-width:100%; max-height:100%; }
  #td-qr-reader img { display:none !important; }
  .td-qr-placeholder { text-align:center; color:#e7e5e4; position:relative; z-index:3; }
  .td-qr-placeholder svg { opacity:0.82; margin-bottom:10px; color:#E82127; }
  .td-qr-placeholder p { font-size:13px; }

  /* Scanner btn */
  .td-btn {
    display:inline-flex; align-items:center; gap:8px; padding:10px 20px;
    border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s;
  }
  .td-btn-primary { background:#111111; color:#fff; box-shadow:0 10px 24px rgba(17,17,17,.18); }
  .td-btn-primary:hover { background:#242424; transform:translateY(-1px); }
  .td-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .td-btn-danger { background:#fff0f0; color:#c0392b; border:1px solid #f5c6c6; }
  .td-btn-danger:hover { background:#ffe0e0; }
  .td-btn-secondary { background:#fff; color:#111111; border:1px solid rgba(17,17,17,.16); }
  .td-btn-secondary:hover { background:#f5f5f4; border-color:#111111; }
  .td-btn-sm { padding:7px 14px; font-size:13px; }
  .td-btn-row { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
  /* Resultado del escaneo */
  .td-scan-result {
    margin-top:14px; padding:14px 16px; border-radius:10px; font-size:14px; font-weight:500;
  }
  .td-scan-result.success { background:#f0fdf4; border:1px solid #86efac; color:#166534; }
  .td-scan-result.error   { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; }
  .td-scan-result.warning { background:#fffbeb; border:1px solid #fcd34d; color:#92400e; }
  .td-scan-result.info    { background:${C.skyLight}; border:1px solid ${C.border}; color:${C.navy}; }
  .td-scan-student { font-size:15px; font-weight:700; margin-bottom:10px; }
  .td-scan-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:8px; margin-top:10px; }
  .td-scan-meta {
    background:rgba(255,255,255,0.75); border-radius:8px; padding:8px 10px;
    border:1px solid rgba(255,255,255,0.6);
  }
  .td-scan-meta-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; opacity:0.72; }
  .td-scan-meta-value { font-size:13px; font-weight:600; margin-top:4px; }

  /* Asistencia manual */
  .td-field { margin-bottom:14px; }
  .td-label { display:block; font-size:13px; font-weight:500; color:${C.dark}; margin-bottom:5px; }
  .td-input, .td-select, .td-textarea {
    width:100%; padding:9px 12px; border-radius:8px; border:1px solid ${C.border};
    font-size:14px; color:${C.dark}; font-family:'DM Sans',sans-serif; outline:none;
    transition:border 0.18s; background:#fff; box-sizing:border-box;
  }
  .td-input:focus, .td-select:focus, .td-textarea:focus { border-color:${C.navy}; }
  .td-textarea { min-height:70px; resize:vertical; }
  .td-radio-group { display:flex; gap:10px; flex-wrap:wrap; }
  .td-radio {
    display:flex; align-items:center; gap:6px; padding:7px 14px;
    border-radius:8px; border:1px solid ${C.border}; cursor:pointer; font-size:13px; font-weight:500;
    transition:all 0.18s; user-select:none; color:${C.mid};
  }
  .td-radio input { display:none; }
  .td-radio.selected-presente { background:#f0fdf4; border-color:#86efac; color:#166534; }
  .td-radio.selected-tarde    { background:#fffbeb; border-color:#fcd34d; color:#92400e; }
  .td-radio.selected-ausente  { background:#fef2f2; border-color:#fca5a5; color:#991b1b; }

  /* Lista del día */
  .td-attendance-list { }
  .td-filter-row { display:flex; gap:10px; margin-bottom:16px; align-items:center; flex-wrap:wrap; }
  .td-filter-row .td-input { max-width:220px; }
  .td-filter-row .td-select { max-width:160px; }
  .td-table-wrap { overflow-x:auto; }
  .td-table { width:100%; border-collapse:collapse; font-size:14px; }
  .td-table th {
    text-align:left; padding:10px 14px; font-size:12px; font-weight:600;
    color:${C.mid}; text-transform:uppercase; letter-spacing:0.5px;
    border-bottom:2px solid ${C.border}; background:${C.skyPale};
  }
  .td-table td { padding:12px 14px; border-bottom:1px solid ${C.border}; color:${C.dark}; vertical-align:middle; }
  .td-table tr:last-child td { border-bottom:none; }
  .td-table tr:hover td { background:${C.skyPale}; }
  .td-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600;
  }
  .td-badge.presente  { background:#dcfce7; color:#166534; }
  .td-badge.tarde     { background:#fef9c3; color:#854d0e; }
  .td-badge.ausente   { background:#fee2e2; color:#991b1b; }
  .td-badge.justificado { background:#ede9fe; color:#5b21b6; }
  .td-status-select {
    min-width: 138px; min-height: 36px;
    padding: 0 34px 0 12px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 800;
    outline: none; cursor: pointer;
    appearance: none;
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 10px;
    background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  }
  .td-status-select:disabled { opacity: .65; cursor: not-allowed; }
  .td-status-select.presente { background-color:#dcfce7; color:#166534; border-color:#bbf7d0; }
  .td-status-select.tarde { background-color:#fef9c3; color:#854d0e; border-color:#fde68a; }
  .td-status-select.ausente { background-color:#fee2e2; color:#991b1b; border-color:#fecaca; }
  .td-status-select.justificado { background-color:#ede9fe; color:#5b21b6; border-color:#ddd6fe; }
  .td-empty { text-align:center; padding:40px 20px; color:${C.mid}; font-size:14px; }

  /* Toast interno */
  .td-toast-wrap { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
  .td-toast {
    display:flex; align-items:center; gap:10px; padding:12px 18px;
    border-radius:10px; font-size:14px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,0.12);
    animation:td-slide-in 0.25s ease;
  }
  .td-toast.success { background:#166534; color:#fff; }
  .td-toast.error   { background:#991b1b; color:#fff; }
  .td-toast.info    { background:${C.navy}; color:#fff; }
  @keyframes td-slide-in { from { transform:translateX(60px); opacity:0; } to { transform:translateX(0); opacity:1; } }

  @media (max-width:900px) {
    .td-stats { grid-template-columns:repeat(2,1fr); }
    .td-scanner-wrap { grid-template-columns:1fr; }
    .td-sidebar { transform:translateX(-100%); }
    .td-main { margin-left:0; padding:20px; }
  }
`

// ─── Utilidades ─────────────────────────────────────────────
function getHoraActual() {
  return new Date().toTimeString().slice(0, 5) // "07:45"
}

function getFechaHoy() {
  return new Date().toISOString().slice(0, 10) // "2024-01-15"
}

function getTurnoActual() {
  const h = parseInt(getHoraActual().split(':')[0])
  if (h >= 7 && h < 12)  return 'manana'
  if (h >= 12 && h < 17) return 'tarde'
  return 'noche'
}

// Valores fallback si no hay horario en DB
const SCHEDULE_FALLBACK = {
  manana: { hora_entrada: '07:00', hora_salida: '12:00', hora_limite_tardanza: '07:30' },
  tarde:  { hora_entrada: '12:00', hora_salida: '17:00', hora_limite_tardanza: '12:30' },
  noche:  { hora_entrada: '17:00', hora_salida: '21:00', hora_limite_tardanza: '17:30' },
}

const API_BASE_URL = (() => {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '')

  return `${base}/api`
})()

async function postWithSupabaseSession(path, payload) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('No hay una sesion activa para autorizar la operacion.')
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    const error = new Error('No se pudo conectar con el backend de Flask. Verifica que esté corriendo en http://localhost:5000.')
    error.code = 'BACKEND_UNREACHABLE'
    throw error
  }

  let body = null

  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const message = body?.error || `Error ${response.status} al conectar con el backend.`
    const error = new Error(message)
    if (
      response.status >= 500 ||
      message.includes('does not exist') ||
      message.includes('schema cache') ||
      message.includes('42703')
    ) {
      error.code = 'BACKEND_SCHEMA_UNAVAILABLE'
    }
    throw error
  }

  return body
}

function formatTimeLabel(value) {
  if (!value) return '-'
  return String(value).slice(0, 5)
}

function getAttendanceStatusLabel(status) {
  switch (status) {
    case 'presente': return 'A tiempo'
    case 'tarde': return 'Tardanza'
    case 'ausente': return 'Ausente'
    case 'justificado': return 'Justificado'
    default: return 'Registrado'
  }
}

function getScanResultType(action, status) {
  if (action === 'duplicate') return 'info'
  if (status === 'tarde') return 'warning'
  return 'success'
}

function buildScanResultDetails(result) {
  const scan = result?.scan || {}
  const details = [
    { label: 'Evento', value: scan.event_label || (result?.action === 'checked_out' ? 'Salida' : 'Entrada') },
    { label: 'Matricula', value: result?.student?.matricula || '-' },
    { label: 'Hora escaneada', value: formatTimeLabel(scan.scanned_at) },
    { label: 'Estado', value: scan.status_label || getAttendanceStatusLabel(scan.status) },
    { label: 'Limite aplicado', value: formatTimeLabel(scan.late_limit) },
    {
      label: 'Margen docente',
      value: Number.isFinite(Number(scan.grace_minutes)) ? `${scan.grace_minutes} min` : '-',
    },
    {
      label: 'Modo QR',
      value: scan.qr_mode ? (scan.qr_mode === 'secure' ? 'Seguro' : 'Legacy') : 'Manual',
    },
    {
      label: 'Horario aplicado',
      value: scan.special_schedule_active ? 'Especial por seccion' : 'General por turno',
    },
  ]

  if (Number(scan.late_minutes) > 0) {
    details.push({ label: 'Retraso', value: `${scan.late_minutes} min` })
  }

  if (result?.attendance?.hora_entrada) {
    details.push({ label: 'Hora de entrada', value: formatTimeLabel(result.attendance.hora_entrada) })
  }

  if (result?.attendance?.hora_salida) {
    details.push({ label: 'Hora de salida', value: formatTimeLabel(result.attendance.hora_salida) })
  }

  if (scan.geo_captured) {
    details.push({
      label: 'Ubicacion',
      value: scan.geo_outside_perimeter
        ? `Fuera del radio${scan.geo_distance_m ? ` (${Math.round(scan.geo_distance_m)} m)` : ''}`
        : 'Dentro del perimetro',
    })
  }

  if (Number(scan.alerts_queued) > 0) {
    details.push({ label: 'Alertas', value: `${scan.alerts_queued} en cola` })
  }

  if (scan.device_status) {
    details.push({ label: 'Dispositivo', value: scan.device_status })
  }

  return details
}

// ─── Lectura robusta de QR desde imagen ─────────────────────
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo abrir la imagen seleccionada.'))
    }
    image.src = url
  })
}

async function canvasToPngFile(canvas, name) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1))
  if (!blob) return null
  return new File([blob], name, { type: 'image/png' })
}

async function scanCanvasWithBarcodeDetector(canvas) {
  if (!('BarcodeDetector' in window)) return ''

  try {
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    const codes = await detector.detect(canvas)
    return codes?.[0]?.rawValue || ''
  } catch {
    return ''
  }
}

const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'presente', label: 'Presente' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'justificado', label: 'Justificado' },
]

function calculateAttendanceStats(list) {
  return {
    presentes: list.filter(r => r.estado === 'presente').length,
    tardanzas: list.filter(r => r.estado === 'tarde').length,
    ausentes: list.filter(r => r.estado === 'ausente').length,
    total: list.length,
  }
}

function scanCanvasWithJsQr(canvas) {
  try {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    })

    return result?.data || ''
  } catch {
    return ''
  }
}

function drawImageVariant(image, { crop = null, maxSize = 1800, threshold = false, paddingRatio = 0.04 }) {
  const source = crop || { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight }
  const scale = Math.min(maxSize / Math.max(source.width, source.height), 4)
  const contentWidth = Math.max(320, Math.round(source.width * scale))
  const contentHeight = Math.max(320, Math.round(source.height * scale))
  const padding = Math.round(Math.max(contentWidth, contentHeight) * paddingRatio)
  const width = contentWidth + (padding * 2)
  const height = contentHeight + (padding * 2)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = width
  canvas.height = height
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.imageSmoothingEnabled = false
  context.drawImage(image, source.x, source.y, source.width, source.height, padding, padding, contentWidth, contentHeight)

  if (threshold) {
    const imageData = context.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114)
      const value = gray > 150 ? 255 : 0
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
    context.putImageData(imageData, 0, 0)
  }

  return canvas
}

function centerCrop(image, ratio) {
  const size = Math.min(image.naturalWidth, image.naturalHeight) * ratio
  return {
    x: Math.max(0, (image.naturalWidth - size) / 2),
    y: Math.max(0, (image.naturalHeight - size) / 2),
    width: size,
    height: size,
  }
}

function squareCropAt(image, centerXRatio, centerYRatio, sizeRatio) {
  const size = Math.min(image.naturalWidth, image.naturalHeight) * sizeRatio
  const x = Math.min(Math.max(0, (image.naturalWidth * centerXRatio) - (size / 2)), image.naturalWidth - size)
  const y = Math.min(Math.max(0, (image.naturalHeight * centerYRatio) - (size / 2)), image.naturalHeight - size)

  return { x, y, width: size, height: size }
}

async function buildQrReadableFileVariants(file) {
  const image = await loadImageFromFile(file)
  const variants = [{ file, label: 'original', canvas: drawImageVariant(image, { maxSize: 2200 }) }]
  const configs = [
    { name: 'ampliada', maxSize: 2200 },
    { name: 'alto-contraste', maxSize: 2200, threshold: true },
    { name: 'centro-amplio', crop: centerCrop(image, 0.92), maxSize: 2200 },
    { name: 'centro', crop: centerCrop(image, 0.72), maxSize: 2000 },
    { name: 'centro-contraste', crop: centerCrop(image, 0.72), maxSize: 2000, threshold: true },
    { name: 'zona-superior-izquierda', crop: squareCropAt(image, 0.28, 0.28, 0.55), maxSize: 1800 },
    { name: 'zona-superior-centro', crop: squareCropAt(image, 0.5, 0.28, 0.55), maxSize: 1800 },
    { name: 'zona-superior-derecha', crop: squareCropAt(image, 0.72, 0.28, 0.55), maxSize: 1800 },
    { name: 'zona-media-izquierda', crop: squareCropAt(image, 0.28, 0.5, 0.55), maxSize: 1800 },
    { name: 'zona-media-derecha', crop: squareCropAt(image, 0.72, 0.5, 0.55), maxSize: 1800 },
    { name: 'zona-inferior-centro', crop: squareCropAt(image, 0.5, 0.72, 0.55), maxSize: 1800 },
  ]

  for (const config of configs) {
    const canvas = drawImageVariant(image, config)
    const variantFile = await canvasToPngFile(canvas, `${file.name}-${config.name}.png`)
    if (variantFile) variants.push({ file: variantFile, label: config.name, canvas })
  }

  return variants
}

async function scanQrVariant(reader, variant) {
  const jsQrResult = scanCanvasWithJsQr(variant.canvas)
  if (jsQrResult) return jsQrResult

  const nativeResult = await scanCanvasWithBarcodeDetector(variant.canvas)
  if (nativeResult) return nativeResult

  if (typeof reader.scanFileV2 === 'function') {
    const result = await reader.scanFileV2(variant.file, false)
    return result?.decodedText || result?.text || result?.result?.text || ''
  }

  return reader.scanFile(variant.file, false)
}

function normalizeQrReadError(error, fileName) {
  const raw = String(error?.message || error || '')
  if (raw.includes('No MultiFormat Readers') || raw.includes('NotFoundException')) {
    return {
      msg: 'No pude detectar un QR en esa imagen. Prueba con una captura donde el codigo salga completo, grande y con fondo blanco alrededor.',
      sub: `Archivo probado: ${fileName}`,
    }
  }

  return {
    msg: raw || 'No se pudo leer el QR de la imagen. Intenta con una captura mas nitida.',
    sub: `Archivo probado: ${fileName}`,
  }
}

// ─── Toast hook ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, toast: add }
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function TeacherDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, toast } = useToast()

  // ── State ────────────────────────────────────────────────
  const [tab, setTab]           = useState('scanner') // 'scanner' | 'lista' | 'manual'
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)  // { type, msg, student }
  const [schedule, setSchedule] = useState(null)
  const [, setSecciones] = useState([])
  const [attendanceList, setAttendanceList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [savingAttendanceStatus, setSavingAttendanceStatus] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterSearch, setFilterSearch] = useState('')
  const [stats, setStats] = useState({ presentes: 0, tardanzas: 0, ausentes: 0, total: 0 })

  // Manual form
  const [manualMatricula, setManualMatricula] = useState('')
  const [manualAction, setManualAction] = useState('check_in')
  const [manualEstado, setManualEstado] = useState('presente')
  const [manualMotivo, setManualMotivo] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [startingScanner, setStartingScanner] = useState(false)
  const [activeCameraLabel, setActiveCameraLabel] = useState('')
  const [fileScanLoading, setFileScanLoading] = useState(false)
  const [uploadedQrName, setUploadedQrName] = useState('')

  const html5QrRef = useRef(null)
  const fileInputRef = useRef(null)
  const scannerMountVisible = scanning || startingScanner

  const navItems = [
    { label: 'Escanear QR',   path: '/teacher/dashboard', Icon: IcoQR      },
    { label: 'Excusas',       path: '/teacher/inbox',     Icon: IcoInbox   },
    { label: 'Ausencias',     path: '/teacher/absences',  Icon: IcoAbsences},
  ]

  // ── Cargar horario y secciones al montar ─────────────────
  useEffect(() => {
    loadSchedule()
    loadSecciones()
    loadAttendanceList()
    injectStyles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  function injectStyles() {
    let el = document.getElementById('td-styles')
    if (!el) {
      el = document.createElement('style')
      el.id = 'td-styles'
      document.head.appendChild(el)
    }
    el.textContent = STYLES
  }

  function waitForNextPaint() {
    return new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })
  }

  async function waitForScannerVideo(timeoutMs = 2500) {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const video = document.querySelector('#td-qr-reader video')

      if (video) {
        video.muted = true
        video.setAttribute('muted', 'true')
        video.setAttribute('playsinline', 'true')
        try { await video.play() } catch (error) { console.debug('Video play retry failed:', error) }

        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          return true
        }
      }

      await new Promise(resolve => setTimeout(resolve, 120))
    }

    return false
  }

  function getQrBoxSize(viewfinderWidth, viewfinderHeight) {
    const edge = Math.max(180, Math.min(280, Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)))
    return { width: edge, height: edge }
  }

  async function loadSchedule() {
    const turno = getTurnoActual()
    try {
      const { data } = await supabase.from('schedules').select('*').eq('turno', turno).maybeSingle()
      setSchedule(data || SCHEDULE_FALLBACK[turno])
    } catch {
      setSchedule(SCHEDULE_FALLBACK[turno])
    }
  }

  async function loadSecciones() {
    if (!profile?.secciones_ids?.length) return
    const { data } = await supabase
      .from('grade_sections').select('*').in('id', profile.secciones_ids)
    setSecciones(data || [])
  }

  async function loadAttendanceList() {
    setLoadingList(true)
    const hoy = getFechaHoy()
    let query = supabase
      .from('attendance')
      .select(`*, students(id, nombre, matricula, grade_section_id, grade_sections:grade_section_id(grado, seccion))`)
      .eq('fecha', hoy)
      .eq('teacher_id', profile?.id)
      .order('created_at', { ascending: false })

    const { data } = await query
    const list = data || []
    setAttendanceList(list)
    setStats(calculateAttendanceStats(list))
    setLoadingList(false)
  }

  // ── Iniciar cámara ───────────────────────────────────────
  async function startScanner() {
    if (scanning || startingScanner || fileScanLoading) return

    setStartingScanner(true)
    setScanResult(null)
    setActiveCameraLabel('')

    try {
      await waitForNextPaint()

      const { Html5Qrcode } = await import('html5-qrcode')
      const cameras = await Html5Qrcode.getCameras()

      if (!cameras?.length) {
        throw new Error('No se encontro ninguna webcam o camara disponible.')
      }

      const preferredCamera =
        cameras.find(camera => /back|rear|environment|trase|extern/i.test(camera.label || '')) ||
        cameras[0]

      const readerElement = document.getElementById('td-qr-reader')
      if (!readerElement) {
        throw new Error('No se encontro el visor de la webcam en pantalla.')
      }
      readerElement.innerHTML = ''

      html5QrRef.current = new Html5Qrcode('td-qr-reader')
      await html5QrRef.current.start(
        { deviceId: { exact: preferredCamera.id } },
        {
          fps: 10,
          qrbox: getQrBoxSize,
          disableFlip: false,
        },
        onScanSuccess,
        () => {}
      )

      const videoReady = await waitForScannerVideo()
      if (!videoReady) {
        throw new Error('La webcam se abrió, pero el video no se pudo mostrar en el visor.')
      }

      setScanning(true)
      setActiveCameraLabel(preferredCamera.label || 'Webcam')
    } catch (err) {
      await stopScanner()
      toast(err.message || 'No se pudo acceder a la camara. Verifica los permisos.', 'error')
      console.error(err)
    } finally {
      setStartingScanner(false)
    }
  }

  async function stopScanner() {
    const currentScanner = html5QrRef.current
    html5QrRef.current = null

    if (currentScanner) {
      try { await currentScanner.stop() } catch (error) { console.debug('Scanner stop ignored:', error) }
      try { await currentScanner.clear() } catch (error) { console.debug('Scanner clear ignored:', error) }
    }

    setScanning(false)
    setStartingScanner(false)
    setActiveCameraLabel('')
  }

  function buildLocalScanMeta(scanTime, qrMode, overrides = {}) {
    const turno = getTurnoActual()
    const scanMeta = getScanAttendanceMeta(scanTime, schedule || SCHEDULE_FALLBACK[turno], profile)
    const status = overrides.status || scanMeta.status
    const eventType = overrides.event_type || 'check_in'

    return {
      scanned_at: scanTime,
      status,
      status_label: getAttendanceStatusLabel(status),
      late_minutes: overrides.late_minutes ?? scanMeta.lateMinutes ?? 0,
      late_limit: overrides.late_limit || scanMeta.hora_limite_tardanza,
      grace_minutes: scanMeta.margen_tardanza_minutos ?? 30,
      qr_mode: qrMode,
      event_type: eventType,
      event_label: eventType === 'check_out' ? 'Salida' : eventType === 'manual' ? 'Contingencia manual' : 'Entrada',
      special_schedule_active: false,
      device_status: overrides.device_status || null,
    }
  }

  async function registerQrWithSupabaseFallback(decodedText, scanContext = {}) {
    const qrData = parseStudentQrPayload(decodedText)
    if (!qrData) {
      throw new Error('QR no valido para esta plataforma.')
    }

    const role = (profile?.role || '').trim().toLowerCase()
    if (!['teacher', 'admin'].includes(role)) {
      throw new Error('No tienes permisos para registrar asistencia por QR.')
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, nombre, matricula, grade_section_id, qr_token')
      .eq('id', qrData.studentId)
      .single()

    if (studentError || !student) {
      throw new Error('Estudiante no encontrado para este QR.')
    }

    const secureMatch = Boolean(student.qr_token) && qrData.credential === student.qr_token
    const legacyMatch = qrData.credential === (student.matricula || '')

    if (!secureMatch && !legacyMatch) {
      throw new Error(`El QR no coincide con ${student.nombre || 'el estudiante'}.`)
    }

    const fecha = getFechaHoy()
    const horaActual = getHoraActual()
    const qrMode = secureMatch ? 'secure' : 'legacy'
    const scanMeta = buildLocalScanMeta(horaActual, qrMode, {
      device_status: scanContext?.deviceFingerprint ? 'local_fallback' : null,
    })

    const { data: existingRows, error: existingError } = await supabase
      .from('attendance')
      .select('id, estado, hora_entrada, hora_salida, minutos_tarde, limite_tardanza_aplicado')
      .eq('student_id', student.id)
      .eq('fecha', fecha)
      .limit(1)

    if (existingError) throw existingError

    const existing = existingRows?.[0]

    if (existing) {
      const canUpgradeExisting = ['ausente', 'justificado'].includes(existing.estado) || !existing.hora_entrada

      if (canUpgradeExisting) {
        const updates = {
          teacher_id: profile?.id,
          hora_entrada: horaActual,
          estado: scanMeta.status,
          minutos_tarde: scanMeta.late_minutes,
          limite_tardanza_aplicado: scanMeta.late_limit,
          dispositivo: `qr-fallback:${qrMode}`,
        }

        const { data: attendance, error: updateError } = await supabase
          .from('attendance')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError

        registrarAudit('entrada_qr', 'attendance', attendance.id, {
          qr_mode: qrMode,
          replaced_status: existing.estado,
          late_minutes: scanMeta.late_minutes,
          late_limit: scanMeta.late_limit,
          source: 'supabase_fallback',
        })

        return {
          action: 'updated',
          message: scanMeta.status === 'tarde'
            ? `Tardanza registrada - ${student.nombre}`
            : `Asistencia actualizada - ${student.nombre}`,
          student,
          attendance,
          scan: scanMeta,
          fallback: true,
        }
      }

      if (existing.hora_entrada && !existing.hora_salida) {
        const { data: attendance, error: updateError } = await supabase
          .from('attendance')
          .update({
            teacher_id: profile?.id,
            hora_salida: horaActual,
            dispositivo: `qr-fallback:${qrMode}`,
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError

        registrarAudit('salida_qr', 'attendance', attendance.id, {
          qr_mode: qrMode,
          source: 'supabase_fallback',
        })

        return {
          action: 'checked_out',
          message: `Salida registrada - ${student.nombre}`,
          student,
          attendance,
          scan: buildLocalScanMeta(horaActual, qrMode, {
            status: existing.estado || 'presente',
            late_minutes: existing.minutos_tarde ?? 0,
            late_limit: existing.limite_tardanza_aplicado || scanMeta.late_limit,
            event_type: 'check_out',
            device_status: scanContext?.deviceFingerprint ? 'local_fallback' : null,
          }),
          fallback: true,
        }
      }

      return {
        action: 'duplicate',
        message: `${student.nombre} ya tiene entrada y salida registradas hoy.`,
        student,
        attendance: existing,
        scan: buildLocalScanMeta(horaActual, qrMode, {
          status: existing.estado || scanMeta.status,
          late_minutes: existing.minutos_tarde ?? 0,
          late_limit: existing.limite_tardanza_aplicado || scanMeta.late_limit,
          device_status: scanContext?.deviceFingerprint ? 'local_fallback' : null,
        }),
        fallback: true,
      }
    }

    const { data: attendance, error: insertError } = await supabase
      .from('attendance')
      .insert({
        student_id: student.id,
        teacher_id: profile?.id,
        fecha,
        hora_entrada: horaActual,
        estado: scanMeta.status,
        minutos_tarde: scanMeta.late_minutes,
        limite_tardanza_aplicado: scanMeta.late_limit,
        dispositivo: `qr-fallback:${qrMode}`,
      })
      .select()
      .single()

    if (insertError) throw insertError

    registrarAudit('entrada_qr', 'attendance', attendance.id, {
      qr_mode: qrMode,
      late_minutes: scanMeta.late_minutes,
      late_limit: scanMeta.late_limit,
      source: 'supabase_fallback',
    })

    return {
      action: 'created',
      message: scanMeta.status === 'tarde'
        ? `Tardanza registrada - ${student.nombre}`
        : `Asistencia registrada - ${student.nombre}`,
      student,
      attendance,
      scan: scanMeta,
      fallback: true,
    }
  }

  function openQrFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleQrFileUpload(event) {
    const imageFile = event.target?.files?.[0]
    event.target.value = ''

    if (!imageFile) return

    setFileScanLoading(true)
    setUploadedQrName(imageFile.name)
    setScanResult(null)

    try {
      await stopScanner()

      const { Html5Qrcode } = await import('html5-qrcode')
      const fileReaderElement = document.getElementById('td-qr-file-reader')

      if (!fileReaderElement) {
        throw new Error('No se encontro el lector de archivos QR.')
      }

      fileReaderElement.innerHTML = ''

      html5QrRef.current = new Html5Qrcode('td-qr-file-reader')
      const variants = await buildQrReadableFileVariants(imageFile)
      let decodedText = ''
      let lastError = null

      for (const variant of variants) {
        try {
          decodedText = await scanQrVariant(html5QrRef.current, variant)
          if (decodedText) break
        } catch (scanError) {
          lastError = scanError
        }
      }

      if (!decodedText) {
        throw lastError || new Error('No se pudo leer el QR de la imagen.')
      }

      await handleQrScan(decodedText)
    } catch (err) {
      await stopScanner()
      console.error(err)
      const friendlyError = normalizeQrReadError(err, imageFile.name)
      setScanResult({
        type: 'error',
        msg: friendlyError.msg,
        sub: friendlyError.sub,
      })
    } finally {
      setFileScanLoading(false)
    }
  }

  // QR scan pipeline
  async function onScanSuccess(decodedText) {
    return handleQrScan(decodedText)
  }

  async function handleQrScan(decodedText) {
    if (!decodedText?.trim()) {
      setScanResult({ type: 'error', msg: 'No se pudo leer un QR valido.' })
      return
    }

    await stopScanner()

    try {
      let result
      const scanContext = await buildAttendanceContext()

      try {
        result = await postWithSupabaseSession('/attendance/scan', { qrText: decodedText, ...scanContext })
      } catch (err) {
        const canUseLocalFallback =
          ['BACKEND_UNREACHABLE', 'BACKEND_SCHEMA_UNAVAILABLE'].includes(err?.code) ||
          err?.message === 'No puedes registrar asistencia para este estudiante.'

        if (!canUseLocalFallback) throw err
        result = await registerQrWithSupabaseFallback(decodedText, scanContext)
      }

      const scan = result?.scan || {}

      setScanResult({
        type: getScanResultType(result?.action, scan.status),
        msg: result?.message || 'Asistencia registrada correctamente.',
        student: result?.student,
        details: buildScanResultDetails(result),
        sub: result?.fallback ? 'Registrado en modo local porque Flask no estaba disponible.' : null,
      })

      await loadAttendanceList()
    } catch (err) {
      console.error(err)
      setScanResult({ type: 'error', msg: err.message || 'Error al registrar. Intenta de nuevo.' })
    }
  }

  async function handleManual(e) {
    e.preventDefault()
    if (!manualMatricula.trim()) { toast('Escribe la matrícula del estudiante.', 'error'); return }
    setManualLoading(true)

    try {
      const matricula = manualMatricula.trim()
      const hoy = getFechaHoy()
      const horaActual = getHoraActual()
      const attendanceContext = await buildAttendanceContext()

      const payload = {
        matricula,
        action: manualAction,
        estado: manualEstado,
        motivo: manualMotivo,
        fecha: hoy,
        hora_entrada: horaActual,
        hora_salida: horaActual,
        ...attendanceContext,
      }

      let result

      try {
        result = await postWithSupabaseSession('/attendance/manual', payload)
      } catch (err) {
        if (err?.code !== 'BACKEND_UNREACHABLE') throw err

        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, nombre, matricula')
          .eq('matricula', matricula)
          .single()

        if (studentError || !student) {
          throw new Error('Matrícula no encontrada.')
        }

        const { data: existing, error: existingError } = await supabase
          .from('attendance')
          .select('id, estado, hora_entrada, hora_salida')
          .eq('student_id', student.id)
          .eq('fecha', hoy)
          .limit(1)

        if (existingError) throw existingError
        const existingAttendance = existing?.[0]

        if (manualAction === 'check_out') {
          if (!existingAttendance?.hora_entrada) {
            throw new Error('No existe una entrada previa para registrar la salida.')
          }
          if (existingAttendance?.hora_salida) {
            throw new Error('La salida de este estudiante ya fue registrada hoy.')
          }

          const { data: attendance, error: updateError } = await supabase
            .from('attendance')
            .update({
              teacher_id: profile?.id,
              hora_salida: horaActual,
              dispositivo: `manual: ${manualMotivo || 'salida manual'}`,
            })
            .eq('id', existingAttendance.id)
            .select()
            .single()

          if (updateError) throw updateError

          registrarAudit('salida_manual', 'attendance', attendance.id, {
            motivo: manualMotivo,
            source: 'supabase_fallback',
          })

          result = {
            action: 'checked_out',
            attendance,
            student,
            message: `Salida manual registrada - ${student.nombre}`,
            scan: buildLocalScanMeta(horaActual, null, {
              status: existingAttendance.estado || 'presente',
              event_type: 'check_out',
              device_status: attendanceContext?.deviceFingerprint ? 'local_fallback' : null,
            }),
          }
        } else {
          if (existingAttendance) {
            throw new Error('Este estudiante ya tiene asistencia registrada hoy.')
          }

          const { data: attendance, error: insertError } = await supabase
            .from('attendance')
            .insert({
              student_id: student.id,
              teacher_id: profile?.id,
              fecha: hoy,
              hora_entrada: manualEstado === 'ausente' ? null : horaActual,
              estado: manualEstado,
              dispositivo: `manual: ${manualMotivo || 'sin motivo'}`,
            })
            .select()
            .single()

          if (insertError) throw insertError

          registrarAudit('entrada_manual', 'attendance', attendance.id, {
            motivo: manualMotivo,
            source: 'supabase_fallback',
          })

          result = {
            action: 'created',
            attendance,
            student,
            message: `Asistencia manual registrada - ${student.nombre}`,
            scan: buildLocalScanMeta(horaActual, null, {
              status: manualEstado,
              event_type: 'manual',
              device_status: attendanceContext?.deviceFingerprint ? 'local_fallback' : null,
            }),
          }
        }
      }

      const successMessage = manualAction === 'check_out'
        ? (result?.message || `Salida de ${result?.student?.nombre || matricula} registrada correctamente.`)
        : (result?.message || `Asistencia de ${result?.student?.nombre || matricula} registrada como "${manualEstado}".`)

      toast(successMessage, 'success')
      setManualMatricula('')
      setManualAction('check_in')
      setManualMotivo('')
      setManualEstado('presente')
      await loadAttendanceList()
      setTab('lista')

    } catch (err) {
      console.error(err)
      toast(err.message || 'Error al registrar asistencia manual.', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  // ── Audit log ────────────────────────────────────────────
  async function registrarAudit(accion, tabla, registroId, meta = {}) {
    try {
      await supabase.from('audit_log').insert({
        user_id:     profile?.id,
        accion,
        tabla,
        registro_id: registroId,
        dispositivo: navigator.userAgent.slice(0, 80),
        metadata:    meta,
      })
    } catch (error) {
      console.debug('Audit log skipped:', error)
    }
  }

  // ── Filtrar lista ────────────────────────────────────────
  async function handleAttendanceStatusChange(record, nextEstado) {
    if (!record?.id || record.estado === nextEstado) return

    const previousEstado = record.estado
    setSavingAttendanceStatus(record.id)

    try {
      const { data, error } = await supabase
        .from('attendance')
        .update({ estado: nextEstado })
        .eq('id', record.id)
        .select(`*, students(id, nombre, matricula, grade_section_id, grade_sections:grade_section_id(grado, seccion))`)
        .single()

      if (error) throw error

      const updatedRecord = data || { ...record, estado: nextEstado }
      const nextList = attendanceList.map(item => item.id === record.id ? updatedRecord : item)
      setAttendanceList(nextList)
      setStats(calculateAttendanceStats(nextList))

      registrarAudit('editar_estado_asistencia', 'attendance', record.id, {
        from: previousEstado,
        to: nextEstado,
        student_id: record.student_id,
      })

      toast(`Estado actualizado a ${nextEstado}.`, 'success')
    } catch (err) {
      console.error(err)
      toast(err.message || 'No se pudo actualizar el estado.', 'error')
    } finally {
      setSavingAttendanceStatus('')
    }
  }

  const listaFiltrada = attendanceList.filter(r => {
    const matchEstado = filterEstado === 'todos' || r.estado === filterEstado
    const nombre = r.students?.nombre?.toLowerCase() || ''
    const matricula = r.students?.matricula?.toLowerCase() || ''
    const q = filterSearch.toLowerCase()
    const matchSearch = !q || nombre.includes(q) || matricula.includes(q)
    return matchEstado && matchSearch
  })

  // ── Render ───────────────────────────────────────────────
  const turnoActual = getTurnoActual()
  const sch = buildEffectiveSchedule(schedule || SCHEDULE_FALLBACK[turnoActual], profile)

  return (
    <div className="td-root">
      {/* ── Sidebar ── */}
      <aside className="td-sidebar">
        <div className="td-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Panel docente" />
        </div>

        <nav className="td-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div
              key={path}
              className={`td-nav-item${location.pathname === path ? ' active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon />{label}
            </div>
          ))}
        </nav>

        <div className="td-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Docente"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="td-main">
        <div className="td-header">
          <h1>Panel docente</h1>
          <p>
            {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            &nbsp;·&nbsp;Turno: <strong style={{ color: C.navy, textTransform: 'capitalize' }}>{turnoActual}</strong>
            &nbsp;·&nbsp;Entrada: {sch.hora_entrada} — Límite tardanza: {sch.hora_limite_tardanza}
            &nbsp;-&nbsp;Margen docente: {sch.margen_tardanza_minutos} min
          </p>
        </div>

        {/* Stats */}
        <div className="td-stats">
          <div className="td-stat">
            <div className="td-stat-icon" style={{ background: '#dcfce7' }}>
              <IcoCheck style={{ color: '#16a34a' }} />
            </div>
            <div>
              <div className="td-stat-val">{stats.presentes}</div>
              <div className="td-stat-label">Presentes</div>
            </div>
          </div>
          <div className="td-stat">
            <div className="td-stat-icon" style={{ background: '#fef9c3' }}>
              <IcoClock style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <div className="td-stat-val">{stats.tardanzas}</div>
              <div className="td-stat-label">Tardanzas</div>
            </div>
          </div>
          <div className="td-stat">
            <div className="td-stat-icon" style={{ background: '#fee2e2' }}>
              <IcoX style={{ color: '#dc2626' }} />
            </div>
            <div>
              <div className="td-stat-val">{stats.ausentes}</div>
              <div className="td-stat-label">Ausentes</div>
            </div>
          </div>
          <div className="td-stat">
            <div className="td-stat-icon" style={{ background: C.skyLight }}>
              <IcoUser style={{ color: C.navy }} />
            </div>
            <div>
              <div className="td-stat-val">{stats.total}</div>
              <div className="td-stat-label">Total registros</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="td-tabs">
          <button className={`td-tab${tab === 'scanner' ? ' active' : ''}`} onClick={() => { setTab('scanner'); stopScanner() }}>
            <IcoCamera /> Escanear QR
          </button>
          <button className={`td-tab${tab === 'lista' ? ' active' : ''}`} onClick={() => { setTab('lista'); stopScanner() }}>
            <IcoList /> Lista del día
          </button>
          <button className={`td-tab${tab === 'manual' ? ' active' : ''}`} onClick={() => { setTab('manual'); stopScanner() }}>
            <IcoEdit /> Asistencia manual
          </button>
        </div>

        {/* ── TAB: Scanner ── */}
        {tab === 'scanner' && (
          <div className="td-scanner-wrap">
            <div className="td-card">
              <div className="td-card-head">
                <h3>Cámara QR</h3>
                <p>
                  {activeCameraLabel
                    ? `Camara activa: ${activeCameraLabel}`
                    : uploadedQrName
                      ? `Ultimo archivo probado: ${uploadedQrName}`
                      : 'Apunta el QR del carnet del estudiante'}
                </p>
              </div>
              <div className="td-card-body">
                <div className="td-qr-viewport">
                  {!scannerMountVisible ? (
                    <div className="td-qr-placeholder">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="17" width="7" height="4"/>
                        <rect x="17" y="14" width="4" height="3"/>
                      </svg>
                      <p>La webcam aparecera aqui</p>
                    </div>
                  ) : null}
                  <div id="td-qr-reader" style={{ width: '100%', height: '100%', display: scannerMountVisible ? 'block' : 'none' }} />
                </div>
                <div
                  id="td-qr-file-reader"
                  style={{
                    position: 'fixed',
                    left: '-10000px',
                    top: '0',
                    width: '320px',
                    height: '320px',
                    opacity: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                  }}
                />

                <div className="td-btn-row">
                  {!scanning ? (
                    <button className="td-btn td-btn-primary" onClick={startScanner} disabled={startingScanner || fileScanLoading}>
                      <IcoCamera /> {startingScanner ? 'Abriendo webcam...' : 'Activar webcam'}
                    </button>
                  ) : (
                    <button className="td-btn td-btn-danger" onClick={stopScanner}>
                      <IcoX /> Detener webcam
                    </button>
                  )}
                  <button className="td-btn td-btn-secondary" onClick={openQrFilePicker} disabled={startingScanner || fileScanLoading}>
                    {fileScanLoading ? 'Leyendo captura...' : 'Subir captura QR'}
                  </button>
                  {scanResult && (
                    <button className="td-btn td-btn-secondary" onClick={() => { setScanResult(null); startScanner() }}>
                      Escanear otro
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQrFileUpload}
                  style={{ display: 'none' }}
                />

                <div style={{ marginTop: 10, fontSize: 12, color: C.mid }}>
                  En celular este boton abre la camara trasera para tomar una foto del QR.
                </div>

                {scanning && activeCameraLabel && (
                  <div style={{ marginTop: 10, fontSize: 12, color: C.mid }}>
                    Webcam activa: {activeCameraLabel}
                  </div>
                )}

                {scanResult && (
                  <div className={`td-scan-result ${scanResult.type}`}>
                    <div style={{ fontWeight: 600 }}>{scanResult.msg}</div>
                    {scanResult.student?.nombre && (
                      <div className="td-scan-student">{scanResult.student.nombre}</div>
                    )}
                    {scanResult.sub && <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{scanResult.sub}</div>}
                    {scanResult.details?.length > 0 && (
                      <div className="td-scan-grid">
                        {scanResult.details.map(detail => (
                          <div className="td-scan-meta" key={`${detail.label}-${detail.value}`}>
                            <div className="td-scan-meta-label">{detail.label}</div>
                            <div className="td-scan-meta-value">{detail.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Últimos registros del día */}
            <div className="td-card">
              <div className="td-card-head">
                <h3>Últimos registros hoy</h3>
                <p>{attendanceList.length} en total · {stats.presentes} presentes · {stats.tardanzas} tardanzas</p>
              </div>
              <div className="td-card-body" style={{ padding: '0' }}>
                {attendanceList.slice(0, 8).length === 0 ? (
                  <div className="td-empty">Sin registros todavía hoy</div>
                ) : (
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Hora</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.slice(0, 8).map(r => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{r.students?.nombre || '—'}</div>
                            <div style={{ fontSize: 11, color: C.mid }}>{r.students?.matricula}</div>
                          </td>
                          <td style={{ fontSize: 13, color: C.mid }}>{r.hora_entrada || '—'}</td>
                          <td>
                            <select
                              className={`td-status-select ${r.estado || 'presente'}`}
                              value={r.estado || 'presente'}
                              disabled={savingAttendanceStatus === r.id}
                              onChange={event => handleAttendanceStatusChange(r, event.target.value)}
                            >
                              {ATTENDANCE_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Lista completa del día ── */}
        {tab === 'lista' && (
          <div className="td-card">
            <div className="td-card-head">
              <h3>Asistencia del día</h3>
              <p>Todos los registros de hoy en tus secciones</p>
            </div>
            <div className="td-card-body">
              <div className="td-filter-row">
                <input
                  className="td-input"
                  placeholder="Buscar por nombre o matrícula..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                />
                <select className="td-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="presente">Presentes</option>
                  <option value="tarde">Tardanzas</option>
                  <option value="ausente">Ausentes</option>
                  <option value="justificado">Justificados</option>
                </select>
                <button className="td-btn td-btn-secondary td-btn-sm" onClick={loadAttendanceList}>
                  Actualizar
                </button>
              </div>

              {loadingList ? (
                <div className="td-empty">Cargando...</div>
              ) : listaFiltrada.length === 0 ? (
                <div className="td-empty">No hay registros con estos filtros</div>
              ) : (
                <div className="td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Sección</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaFiltrada.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{r.students?.nombre || '—'}</div>
                            <div style={{ fontSize: 11, color: C.mid }}>{r.students?.matricula}</div>
                          </td>
                          <td style={{ fontSize: 13, color: C.mid }}>
                            {r.students?.grade_sections
                              ? `${r.students.grade_sections.grado} ${r.students.grade_sections.seccion}`
                              : '—'}
                          </td>
                          <td style={{ fontSize: 13 }}>{r.hora_entrada || '—'}</td>
                          <td style={{ fontSize: 13, color: C.mid }}>{r.hora_salida || '—'}</td>
                          <td>
                            <select
                              className={`td-status-select ${r.estado || 'presente'}`}
                              value={r.estado || 'presente'}
                              disabled={savingAttendanceStatus === r.id}
                              onChange={event => handleAttendanceStatusChange(r, event.target.value)}
                            >
                              {ATTENDANCE_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Asistencia manual ── */}
        {tab === 'manual' && (
          <div className="td-card" style={{ maxWidth: 560 }}>
            <div className="td-card-head">
              <h3>Registro manual de asistencia</h3>
              <p>Para usar cuando el QR no está disponible o hay falla de cámara.</p>
            </div>
            <div className="td-card-body">
              <form onSubmit={handleManual}>
                <div className="td-field">
                  <label className="td-label">Matrícula del estudiante *</label>
                  <input
                    className="td-input"
                    placeholder="Ej: 2024-0001"
                    value={manualMatricula}
                    onChange={e => setManualMatricula(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="td-field">
                  <label className="td-label">Tipo de registro</label>
                  <div className="td-radio-group">
                    <label className={`td-radio${manualAction === 'check_in' ? ' selected-presente' : ''}`}>
                      <input type="radio" name="manualAction" value="check_in" checked={manualAction === 'check_in'} onChange={() => setManualAction('check_in')} />
                      <IcoCheck />
                      Entrada / contingencia
                    </label>
                    <label className={`td-radio${manualAction === 'check_out' ? ' selected-tarde' : ''}`}>
                      <input type="radio" name="manualAction" value="check_out" checked={manualAction === 'check_out'} onChange={() => setManualAction('check_out')} />
                      <IcoClock />
                      Registrar salida
                    </label>
                  </div>
                </div>

                {manualAction === 'check_in' && (
                  <div className="td-field">
                  <label className="td-label">Estado</label>
                  <div className="td-radio-group">
                    {['presente', 'tarde', 'ausente'].map(op => (
                      <label
                        key={op}
                        className={`td-radio${manualEstado === op ? ` selected-${op}` : ''}`}
                      >
                        <input type="radio" name="estado" value={op} checked={manualEstado === op} onChange={() => setManualEstado(op)} />
                        {op === 'presente' && <IcoCheck />}
                        {op === 'tarde'    && <IcoClock />}
                        {op === 'ausente'  && <IcoX />}
                        {op.charAt(0).toUpperCase() + op.slice(1)}
                      </label>
                    ))}
                  </div>
                  </div>
                )}

                <div className="td-field">
                  <label className="td-label">Motivo del registro manual</label>
                  <textarea
                    className="td-textarea"
                    placeholder={manualAction === 'check_out' ? 'Ej: Salida por contingencia o falla de escaner...' : 'Ej: Falla de cámara, QR deteriorado...'}
                    value={manualMotivo}
                    onChange={e => setManualMotivo(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="td-btn td-btn-primary"
                  disabled={manualLoading}
                  style={{ marginTop: 4 }}
                >
                  {manualLoading ? 'Registrando...' : manualAction === 'check_out' ? 'Registrar salida' : 'Registrar asistencia'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── Toasts ── */}
      <div className="td-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`td-toast ${t.type}`}>
            {t.type === 'success' && <IcoCheck />}
            {t.type === 'error'   && <IcoX />}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}



