// ============================================================
// ParentDashboard.jsx
// Ruta: /parent/dashboard
// Prefijo CSS: .pd-
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

// ─── Paleta ─────────────────────────────────────────────────
const C = {
  navy:     '#1B3F6B', navyDeep: '#102847', navyMid: '#2A5590',
  sky:      '#B8D4E8', skyLight: '#D8EAF4', skyPale: '#EEF6FB',
  skyMid:   '#8BBAD8', border:   '#C8DFF0', dark:    '#0D2238', mid: '#4A6A8A',
}

// ─── Iconos ──────────────────────────────────────────────────
const IcoDash    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoSend    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IcoHistory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
const IcoLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoClock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcoArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IcoChevL   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
const IcoChevR   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>

// ─── Estilos ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .pd-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .pd-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .pd-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .pd-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .pd-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .pd-nav { flex:1; padding:16px 0; }
  .pd-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; }
  .pd-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .pd-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .pd-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .pd-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .pd-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .pd-user-name { font-size:13px; color:#fff; font-weight:500; }
  .pd-user-role { font-size:11px; color:${C.skyMid}; }
  .pd-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .pd-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .pd-main { margin-left:240px; flex:1; padding:32px; }
  .pd-header { margin-bottom:28px; }
  .pd-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .pd-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Selector de hijo */
  .pd-hijo-tabs { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
  .pd-hijo-tab { display:flex; align-items:center; gap:10px; padding:10px 18px; border-radius:12px; border:1.5px solid ${C.border}; background:#fff; cursor:pointer; transition:all 0.18s; }
  .pd-hijo-tab:hover { border-color:${C.navy}; background:${C.skyPale}; }
  .pd-hijo-tab.active { border-color:${C.navy}; background:${C.navy}; }
  .pd-hijo-tab.active .pd-hijo-tab-name { color:#fff; }
  .pd-hijo-tab.active .pd-hijo-tab-meta { color:${C.sky}; }
  .pd-hijo-tab-avatar { width:32px; height:32px; border-radius:8px; background:${C.skyLight}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:${C.navy}; flex-shrink:0; }
  .pd-hijo-tab.active .pd-hijo-tab-avatar { background:rgba(255,255,255,0.15); color:#fff; }
  .pd-hijo-tab-name { font-size:14px; font-weight:600; color:${C.dark}; }
  .pd-hijo-tab-meta { font-size:11px; color:${C.mid}; }

  /* Grid principal */
  .pd-grid { display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }

  /* Cards */
  .pd-card { background:#fff; border-radius:14px; border:1px solid ${C.border}; overflow:hidden; margin-bottom:24px; }
  .pd-card-head { padding:18px 22px 14px; border-bottom:1px solid ${C.border}; display:flex; align-items:center; justify-content:space-between; }
  .pd-card-head h3 { font-size:15px; font-weight:600; color:${C.dark}; }
  .pd-card-head p { font-size:12px; color:${C.mid}; margin-top:2px; }
  .pd-card-body { padding:20px 22px; }

  /* Stats de asistencia */
  .pd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .pd-stat { background:#fff; border-radius:12px; padding:16px; border:1px solid ${C.border}; text-align:center; }
  .pd-stat-val { font-size:26px; font-weight:700; color:${C.dark}; line-height:1; }
  .pd-stat-label { font-size:11px; color:${C.mid}; margin-top:4px; }
  .pd-stat-sub { font-size:10px; color:${C.skyMid}; margin-top:2px; }

  /* Barra de porcentaje */
  .pd-pct-wrap { margin-bottom:24px; }
  .pd-pct-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .pd-pct-label { font-size:13px; font-weight:600; color:${C.dark}; }
  .pd-pct-val { font-size:20px; font-weight:700; }
  .pd-pct-bar { height:10px; background:${C.border}; border-radius:5px; overflow:hidden; }
  .pd-pct-fill { height:100%; border-radius:5px; transition:width 0.6s ease; }

  /* Calendario */
  .pd-cal-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .pd-cal-title { font-size:15px; font-weight:600; color:${C.dark}; }
  .pd-cal-btn { background:none; border:1px solid ${C.border}; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:${C.mid}; transition:all 0.15s; }
  .pd-cal-btn:hover { background:${C.skyLight}; color:${C.navy}; }
  .pd-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
  .pd-cal-day-label { text-align:center; font-size:11px; font-weight:600; color:${C.mid}; padding:4px 0 8px; text-transform:uppercase; }
  .pd-cal-day { aspect-ratio:1; display:flex; align-items:center; justify-content:center; border-radius:8px; font-size:13px; font-weight:500; position:relative; }
  .pd-cal-day.empty { }
  .pd-cal-day.hoy { border:2px solid ${C.navy}; color:${C.navy}; font-weight:700; }
  .pd-cal-day.presente  { background:#dcfce7; color:#166534; }
  .pd-cal-day.tarde     { background:#fef9c3; color:#854d0e; }
  .pd-cal-day.ausente   { background:#fee2e2; color:#991b1b; }
  .pd-cal-day.justificado { background:#ede9fe; color:#5b21b6; }
  .pd-cal-day.feriado   { background:${C.skyLight}; color:${C.mid}; font-size:11px; }
  .pd-cal-legend { display:flex; gap:12px; flex-wrap:wrap; margin-top:14px; }
  .pd-cal-leg-item { display:flex; align-items:center; gap:5px; font-size:11px; color:${C.mid}; }
  .pd-cal-leg-dot { width:10px; height:10px; border-radius:3px; }

  /* Lista excusas recientes */
  .pd-excusa-item { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid ${C.border}; }
  .pd-excusa-item:last-child { border-bottom:none; }
  .pd-excusa-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:5px; }
  .pd-excusa-fecha { font-size:13px; font-weight:500; color:${C.dark}; }
  .pd-excusa-tipo { font-size:12px; color:${C.mid}; margin-top:2px; }
  .pd-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; margin-left:auto; flex-shrink:0; }
  .pd-badge.pending    { background:#fef9c3; color:#854d0e; }
  .pd-badge.approved   { background:#dcfce7; color:#166534; }
  .pd-badge.rejected   { background:#fee2e2; color:#991b1b; }

  /* Botón acción */
  .pd-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .pd-btn-primary { background:${C.navy}; color:#fff; width:100%; justify-content:center; }
  .pd-btn-primary:hover { background:${C.navyMid}; }
  .pd-btn-secondary { background:${C.skyLight}; color:${C.navy}; border:1px solid ${C.border}; width:100%; justify-content:center; margin-top:8px; }
  .pd-btn-secondary:hover { background:${C.sky}; }

  .pd-alert-list { display:grid; gap:10px; }
  .pd-alert-item { border:1px solid ${C.border}; border-radius:12px; padding:13px; background:linear-gradient(180deg,#fff,#F5FAFD); }
  .pd-alert-item.urgent { border-color:#fecaca; background:linear-gradient(180deg,#fff7f7,#fff); }
  .pd-alert-top { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; margin-bottom:7px; }
  .pd-alert-title { font-size:13px; font-weight:700; color:${C.dark}; line-height:1.35; }
  .pd-alert-date { font-size:10px; color:${C.mid}; white-space:nowrap; }
  .pd-alert-copy { font-size:12px; color:${C.mid}; line-height:1.45; }
  .pd-alert-meta { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
  .pd-alert-chip { border-radius:999px; padding:3px 8px; background:${C.skyLight}; color:${C.navy}; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
  .pd-alert-chip.danger { background:#fee2e2; color:#991b1b; }
  .pd-alert-chip.warn { background:#fef3c7; color:#92400e; }

  /* Empty */
  .pd-empty { text-align:center; padding:32px 16px; color:${C.mid}; font-size:13px; }

  @media (max-width:1100px) {
    .pd-grid { grid-template-columns:1fr; }
    .pd-stats { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:900px) {
    .pd-sidebar { transform:translateX(-100%); }
    .pd-main { margin-left:0; padding:20px; }
  }
`

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'long' })
}

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const TIPOS_LABEL = {
  illness: 'Enfermedad',
  family: 'Motivo familiar',
  accident: 'Accidente',
  other: 'Otro',
  enfermedad: 'Enfermedad',
  familiar: 'Motivo familiar',
  accidente: 'Accidente',
  otro: 'Otro',
}
const STATUS_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' }
const CHANNEL_LABEL = { email: 'Correo', whatsapp: 'WhatsApp', sms: 'SMS', push: 'Push', panel: 'Panel' }

function buildAlertText(alert) {
  const payload = alert.payload || {}
  const studentName = payload.student_name || 'el estudiante'
  const date = payload.attendance_date ? formatFecha(payload.attendance_date) : 'la fecha registrada'

  if (alert.template_key === 'attendance_late_recurrence') {
    return `${studentName} acumula ${payload.late_count_last_30_days || 3} tardanzas en los ultimos 30 dias. Fecha reciente: ${date}.`
  }

  if (alert.template_key === 'attendance_late') {
    return `${studentName} fue marcado como tarde el ${date}.`
  }

  if (alert.template_key === 'attendance_absence') {
    return `${studentName} fue marcado como ausente el ${date}. Puedes enviar una excusa si aplica.`
  }

  return payload.message || payload.body || 'Tienes una notificacion relacionada con la asistencia escolar.'
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function ParentDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [hijos, setHijos]           = useState([])
  const [selectedHijo, setSelectedHijo] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [excuses, setExcuses]       = useState([])
  const [alerts, setAlerts]         = useState([])
  const [calendarEntries, setCalendarEntries] = useState({})
  const [gradeEntries, setGradeEntries] = useState([])
  const [loading, setLoading]       = useState(true)

  // Calendario
  const now = new Date()
  const [calYear, setCalYear]   = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const navItems = [
    { label: 'Mi panel',      path: '/parent/dashboard',   Icon: IcoDash    },
    { label: 'Enviar excusa', path: '/parent/send-excuse',  Icon: IcoSend    },
    { label: 'Historial',     path: '/parent/history',      Icon: IcoHistory },
  ]

  useEffect(() => {
    injectStyles()
    loadHijos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedHijo) {
      loadAttendance(selectedHijo.id)
      loadExcuses(selectedHijo.id)
      loadCalendar(selectedHijo)
      loadGradeEntries(selectedHijo.id)
      loadAlerts(selectedHijo.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHijo])

  useEffect(() => {
    if (!profile?.id || !selectedHijo?.id) return undefined

    const channel = supabase
      .channel(`parent-alerts-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_queue',
        filter: `recipient_id=eq.${profile.id}`,
      }, () => {
        loadAlerts(selectedHijo.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, selectedHijo?.id])

  function injectStyles() {
    if (document.getElementById('pd-styles')) return
    const el = document.createElement('style')
    el.id = 'pd-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  async function loadHijos() {
    setLoading(true)
    const { data: links } = await supabase
      .from('parents')
      .select('*, students(id, nombre, matricula, grade_sections:grade_section_id(school_id, grado, seccion))')
      .eq('profile_id', profile?.id)
    const lista = (links || []).map(l => l.students).filter(Boolean)
    setHijos(lista)
    if (lista.length > 0) setSelectedHijo(lista[0])
    setLoading(false)
  }

  // ── Cargar asistencia del mes actual ──────────────────────
  async function loadAttendance(studentId) {
    const inicio = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`
    const fin    = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10)
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha')
    setAttendance(data || [])
  }

  async function loadExcuses(studentId) {
    const { data } = await supabase
      .from('excuses')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5)
    setExcuses(data || [])
  }

  async function loadCalendar(student) {
    const schoolId = student?.grade_sections?.school_id || null

    if (!schoolId) {
      setCalendarEntries({})
      return
    }

    const inicio = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`
    const fin = new Date(calYear, calMonth + 1, 0).toISOString().slice(0, 10)

    try {
      const { data, error } = await supabase
        .from('school_calendar')
        .select('fecha, tipo, descripcion')
        .eq('school_id', schoolId)
        .gte('fecha', inicio)
        .lte('fecha', fin)

      if (error) throw error

      setCalendarEntries((data || []).reduce((acc, item) => {
        acc[item.fecha] = {
          tipo: item.tipo,
          descripcion: item.descripcion || '',
        }
        return acc
      }, {}))
    } catch (error) {
      console.error('Error loading school calendar:', error)
      setCalendarEntries({})
    }
  }

  async function loadGradeEntries(studentId) {
    try {
      const { data, error } = await supabase
        .from('gradebook_entries')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setGradeEntries(data || [])
    } catch (error) {
      console.error('Error loading gradebook entries:', error)
      setGradeEntries([])
    }
  }

  async function loadAlerts(studentId) {
    if (!profile?.id || !studentId) {
      setAlerts([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('recipient_id', profile.id)
        .eq('student_id', studentId)
        .in('template_key', ['attendance_absence', 'attendance_late', 'attendance_late_recurrence'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const grouped = Object.values((data || []).reduce((acc, item) => {
        const key = `${item.related_id || item.id}:${item.template_key || item.subject}`
        if (!acc[key]) {
          acc[key] = { ...item, channels: [], statuses: [] }
        }
        acc[key].channels.push(item.channel)
        acc[key].statuses.push(item.status)
        return acc
      }, {}))

      setAlerts(grouped.slice(0, 5))
    } catch (error) {
      console.error('Error loading tutor alerts:', error)
      setAlerts([])
    }
  }

  // Recargar asistencia cuando cambia el mes del calendario
  useEffect(() => {
    if (selectedHijo) {
      loadAttendance(selectedHijo.id)
      loadCalendar(selectedHijo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calYear, calMonth])

  // ── Construir mapa de fechas para el calendario ───────────
  const attMap = {}
  attendance.forEach(r => { attMap[r.fecha] = r.estado })
  const resolveCalendarEntry = (value) => {
    if (!value) return null
    if (typeof value === 'string') return { tipo: value, descripcion: '' }
    return value
  }

  // ── Estadísticas del mes ──────────────────────────────────
  const stats = {
    presentes:   attendance.filter(r => r.estado === 'presente').length,
    tardanzas:   attendance.filter(r => r.estado === 'tarde').length,
    ausentes:    attendance.filter(r => r.estado === 'ausente').length,
    justificados:attendance.filter(r => r.estado === 'justificado').length,
  }
  const totalDias = stats.presentes + stats.tardanzas + stats.ausentes + stats.justificados
  const pct = totalDias > 0 ? Math.round(((stats.presentes + stats.tardanzas + stats.justificados) / totalDias) * 100) : 0
  const pctColor = pct >= 90 ? '#16a34a' : pct >= 75 ? '#ca8a04' : '#dc2626'
  const publishedGrades = gradeEntries.filter(entry => entry.status !== 'draft')
  const gradeAverage = publishedGrades.length > 0
    ? Math.round(publishedGrades.reduce((sum, entry) => {
      const maxScore = Number(entry.max_score) || 0
      const score = Number(entry.score) || 0
      return sum + (maxScore > 0 ? (score / maxScore) * 100 : score)
    }, 0) / publishedGrades.length)
    : null
  const monthEvents = Object.entries(calendarEntries)
    .map(([fecha, value]) => ({ fecha, ...resolveCalendarEntry(value) }))
    .filter(entry => entry.tipo === 'evento')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  // ── Construir días del calendario ─────────────────────────
  function buildCalDays() {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const todayStr = now.toISOString().slice(0, 10)
    const days = []
    for (let i = 0; i < firstDay; i++) days.push({ empty: true })
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const calendarEntry = resolveCalendarEntry(calendarEntries[dateStr])
      days.push({
        d,
        dateStr,
        estado: attMap[dateStr] || null,
        calendarType: attMap[dateStr] ? null : calendarEntry?.tipo || null,
        calendarDescription: calendarEntry?.descripcion || '',
        isHoy: dateStr === todayStr,
      })
    }
    return days
  }

  const calDays = buildCalDays()

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="pd-root">
      {/* Sidebar */}
        <aside className="pd-sidebar">
          <div className="pd-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Panel familiar" />
          </div>
        <nav className="pd-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`pd-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="pd-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Padre / Tutor"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="pd-main">
        <div className="pd-header">
          <h1>Panel familiar</h1>
          <p>{new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: C.mid }}>Cargando...</div>
        ) : hijos.length === 0 ? (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '32px', textAlign: 'center', color: '#92400e', fontSize: 14 }}>
            No tienes estudiantes vinculados. Contacta al administrador del centro educativo.
          </div>
        ) : (
          <>
            {/* Selector de hijos */}
            {hijos.length > 1 && (
              <div className="pd-hijo-tabs">
                {hijos.map(h => (
                  <div
                    key={h.id}
                    className={`pd-hijo-tab${selectedHijo?.id === h.id ? ' active' : ''}`}
                    onClick={() => setSelectedHijo(h)}
                  >
                    <div className="pd-hijo-tab-avatar">{getInitials(h.nombre)}</div>
                    <div>
                      <div className="pd-hijo-tab-name">{h.nombre}</div>
                      <div className="pd-hijo-tab-meta">
                        {h.grade_sections ? `${h.grade_sections.grado} ${h.grade_sections.seccion}` : h.matricula}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedHijo && (
              <>
                {/* Stats del mes */}
                <div className="pd-stats">
                  <div className="pd-stat">
                    <div className="pd-stat-val" style={{ color: '#16a34a' }}>{stats.presentes}</div>
                    <div className="pd-stat-label">Presentes</div>
                    <div className="pd-stat-sub">este mes</div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-val" style={{ color: '#ca8a04' }}>{stats.tardanzas}</div>
                    <div className="pd-stat-label">Tardanzas</div>
                    <div className="pd-stat-sub">este mes</div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-val" style={{ color: '#dc2626' }}>{stats.ausentes}</div>
                    <div className="pd-stat-label">Ausencias</div>
                    <div className="pd-stat-sub">este mes</div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-val" style={{ color: '#7c3aed' }}>{stats.justificados}</div>
                    <div className="pd-stat-label">Justificadas</div>
                    <div className="pd-stat-sub">este mes</div>
                  </div>
                </div>

                <div className="pd-grid">
                  {/* Columna izquierda */}
                  <div>
                    {/* Porcentaje de asistencia */}
                    <div className="pd-card">
                      <div className="pd-card-head">
                        <div>
                          <h3>Asistencia del mes</h3>
                          <p>{MESES[calMonth]} {calYear} · {selectedHijo.nombre}</p>
                        </div>
                      </div>
                      <div className="pd-card-body">
                        <div className="pd-pct-wrap">
                          <div className="pd-pct-header">
                            <span className="pd-pct-label">Porcentaje de asistencia</span>
                            <span className="pd-pct-val" style={{ color: pctColor }}>{pct}%</span>
                          </div>
                          <div className="pd-pct-bar">
                            <div className="pd-pct-fill" style={{ width: `${pct}%`, background: pctColor }} />
                          </div>
                          <div style={{ fontSize: 12, color: C.mid, marginTop: 6 }}>
                            {pct >= 90 ? '✓ Excelente asistencia' : pct >= 75 ? '⚠ Asistencia regular' : '⚠ Asistencia baja — considera enviar excusas'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calendario */}
                    <div className="pd-card">
                      <div className="pd-card-head">
                        <div>
                          <h3>Calendario de asistencia</h3>
                          <p>Incluye asistencia, feriados, vacaciones y eventos escolares</p>
                        </div>
                      </div>
                      <div className="pd-card-body">
                        <div className="pd-cal-nav">
                          <button
                            className="pd-cal-btn"
                            onClick={() => {
                              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
                              else setCalMonth(m => m - 1)
                            }}
                          >
                            <IcoChevL />
                          </button>
                          <span className="pd-cal-title">{MESES[calMonth]} {calYear}</span>
                          <button
                            className="pd-cal-btn"
                            onClick={() => {
                              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
                              else setCalMonth(m => m + 1)
                            }}
                          >
                            <IcoChevR />
                          </button>
                        </div>

                        <div className="pd-cal-grid">
                          {DIAS.map(d => (
                            <div key={d} className="pd-cal-day-label">{d}</div>
                          ))}
                          {calDays.map((day, i) => (
                            <div
                              key={i}
                              className={`pd-cal-day${day.empty ? ' empty' : ''}${day.isHoy ? ' hoy' : ''}${day.estado ? ` ${day.estado}` : day.calendarType ? ` ${day.calendarType}` : ''}`}
                              title={day.calendarDescription || ''}
                              style={day.calendarType === 'evento' ? { background: '#dcfce7', color: '#166534' } : undefined}
                            >
                              {!day.empty && day.d}
                            </div>
                          ))}
                        </div>

                        <div className="pd-cal-legend">
                          {[
                            { color: '#dcfce7', label: 'Presente' },
                            { color: '#fef9c3', label: 'Tardanza' },
                            { color: '#fee2e2', label: 'Ausente' },
                            { color: '#ede9fe', label: 'Justificado' },
                            { color: '#D8EAF4', label: 'Feriado' },
                            { color: '#dcfce7', label: 'Evento' },
                          ].map(l => (
                            <div key={l.label} className="pd-cal-leg-item">
                              <div className="pd-cal-leg-dot" style={{ background: l.color }} />
                              {l.label}
                            </div>
                          ))}
                        </div>

                        {monthEvents.length > 0 && (
                          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 8 }}>
                              Eventos del mes
                            </div>
                            <div style={{ display: 'grid', gap: 8 }}>
                              {monthEvents.slice(0, 4).map(event => (
                                <div key={event.fecha} style={{ fontSize: 12, color: C.mid }}>
                                  <strong style={{ color: C.dark }}>{formatFecha(event.fecha)}</strong>
                                  {event.descripcion ? ` · ${event.descripcion}` : ' · Evento escolar'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                    <div>
                      {/* Acceso rápido */}
                      <div className="pd-card" style={{ marginBottom: 24 }}>
                        <div className="pd-card-head">
                          <div>
                            <h3>Alertas de asistencia</h3>
                            <p>Notificaciones por ausencia o tardanza</p>
                          </div>
                        </div>
                        <div className="pd-card-body">
                          {alerts.length === 0 ? (
                            <div className="pd-empty">No hay alertas recientes para este estudiante.</div>
                          ) : (
                            <div className="pd-alert-list">
                              {alerts.map(alert => {
                                const isAbsence = alert.template_key === 'attendance_absence'
                                const isRecurrentLate = alert.template_key === 'attendance_late_recurrence'
                                const channels = [...new Set(alert.channels || [alert.channel])].filter(Boolean)
                                const statuses = [...new Set(alert.statuses || [alert.status])].filter(Boolean)

                                return (
                                  <div key={`${alert.id}:${alert.template_key}`} className={`pd-alert-item${isAbsence ? ' urgent' : ''}`}>
                                    <div className="pd-alert-top">
                                      <div className="pd-alert-title">
                                        {alert.subject || (isAbsence ? 'Ausencia registrada' : (isRecurrentLate ? 'Tardanza recurrente' : 'Tardanza registrada'))}
                                      </div>
                                      <div className="pd-alert-date">{formatDateTime(alert.created_at)}</div>
                                    </div>
                                    <div className="pd-alert-copy">{buildAlertText(alert)}</div>
                                    <div className="pd-alert-meta">
                                      <span className={`pd-alert-chip${isAbsence ? ' danger' : ' warn'}`}>
                                        {isAbsence ? 'Ausencia' : (isRecurrentLate ? 'Recurrente' : 'Tarde')}
                                      </span>
                                      {channels.map(channel => (
                                        <span key={channel} className="pd-alert-chip">{CHANNEL_LABEL[channel] || channel}</span>
                                      ))}
                                      {statuses.map(status => (
                                        <span key={status} className="pd-alert-chip">{status}</span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pd-card" style={{ marginBottom: 24 }}>
                      <div className="pd-card-head"><h3>Acciones rápidas</h3></div>
                      <div className="pd-card-body">
                        <button className="pd-btn pd-btn-primary" onClick={() => navigate('/parent/send-excuse')}>
                          <IcoSend /> Enviar excusa
                        </button>
                        <button className="pd-btn pd-btn-secondary" onClick={() => navigate('/parent/history')}>
                          <IcoHistory /> Ver historial completo
                        </button>
                        </div>
                      </div>

                      <div className="pd-card" style={{ marginBottom: 24 }}>
                        <div className="pd-card-head">
                          <div>
                            <h3>Rendimiento y asistencia</h3>
                            <p>Relación entre evaluaciones cargadas y asistencia del periodo</p>
                          </div>
                        </div>
                        <div className="pd-card-body">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                            <div className="pd-stat" style={{ margin: 0 }}>
                              <div className="pd-stat-val" style={{ color: gradeAverage === null ? '#8BBAD8' : '#0f766e' }}>
                                {gradeAverage === null ? '—' : `${gradeAverage}%`}
                              </div>
                              <div className="pd-stat-label">Promedio academico</div>
                            </div>
                            <div className="pd-stat" style={{ margin: 0 }}>
                              <div className="pd-stat-val" style={{ color: '#1B3F6B' }}>{publishedGrades.length}</div>
                              <div className="pd-stat-label">Evaluaciones</div>
                            </div>
                          </div>

                          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.6 }}>
                            {gradeAverage === null
                              ? 'Aun no hay calificaciones integradas para este estudiante.'
                              : gradeAverage < 70 && pct < 75
                                ? 'Riesgo academico alto: bajo promedio y asistencia baja.'
                                : gradeAverage < 70
                                  ? 'Conviene reforzar el rendimiento academico.'
                                  : pct < 75
                                    ? 'El promedio es bueno, pero la asistencia puede afectar el boletin.'
                                    : 'El rendimiento y la asistencia muestran una evolucion estable.'}
                          </div>

                          {publishedGrades.length > 0 && (
                            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                              {publishedGrades.slice(0, 4).map(entry => {
                                const maxScore = Number(entry.max_score) || 0
                                const score = Number(entry.score) || 0
                                const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : score
                                return (
                                  <div
                                    key={entry.id}
                                    style={{
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 12,
                                      padding: 12,
                                      background: '#F5FAFD',
                                    }}
                                  >
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>
                                      {entry.subject} · {entry.assessment_name}
                                    </div>
                                    <div style={{ fontSize: 12, color: C.mid, marginTop: 4 }}>
                                      {entry.period} · {percentage}%
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Excusas recientes */}
                      <div className="pd-card">
                      <div className="pd-card-head">
                        <div>
                          <h3>Excusas recientes</h3>
                          <p>Últimas 5 enviadas</p>
                        </div>
                      </div>
                      <div className="pd-card-body" style={{ padding: '0 22px' }}>
                        {excuses.length === 0 ? (
                          <div className="pd-empty">No hay excusas enviadas todavía</div>
                        ) : (
                          excuses.map(ex => (
                            <div key={ex.id} className="pd-excusa-item">
                              <div
                                className="pd-excusa-dot"
                                style={{
                                  background: ex.status === 'approved' ? '#22c55e'
                                    : ex.status === 'rejected' ? '#ef4444' : '#f59e0b'
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div className="pd-excusa-fecha">{formatFecha(ex.absence_date)}</div>
                                <div className="pd-excusa-tipo">{TIPOS_LABEL[ex.excuse_type] || ex.excuse_type || '—'}</div>
                                {ex.status === 'rejected' && ex.teacher_comment && (
                                  <div style={{ fontSize: 11, color: '#991b1b', marginTop: 3 }}>
                                    {ex.teacher_comment}
                                  </div>
                                )}
                              </div>
                              <span className={`pd-badge ${ex.status}`}>
                                {ex.status === 'pending'  && <IcoClock />}
                                {ex.status === 'approved' && <IcoCheck />}
                                {ex.status === 'rejected' && <IcoX />}
                                {STATUS_LABEL[ex.status] || ex.status}
                              </span>
                            </div>
                          ))
                        )}
                        {excuses.length > 0 && (
                          <div style={{ padding: '12px 0' }}>
                            <button
                              onClick={() => navigate('/parent/history')}
                              style={{ background: 'none', border: 'none', color: C.navy, font: '500 13px DM Sans', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                            >
                              Ver todas <IcoArrow />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
