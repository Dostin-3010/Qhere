// ============================================================
// ExcuseInbox.jsx
// Ruta: /teacher/inbox
// Prefijo CSS: .ei-
// ============================================================

import { useState, useEffect, useCallback } from 'react'
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
const IcoQR       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>
const IcoInbox    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
const IcoAbsences = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
const IcoLogout   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoCheck    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoEye      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IcoFile     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IcoClock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcoUser     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

// ─── Estilos ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .ei-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .ei-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .ei-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .ei-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .ei-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .ei-nav { flex:1; padding:16px 0; }
  .ei-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; }
  .ei-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .ei-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .ei-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .ei-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .ei-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .ei-user-name { font-size:13px; color:#fff; font-weight:500; }
  .ei-user-role { font-size:11px; color:${C.skyMid}; }
  .ei-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .ei-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .ei-main { margin-left:240px; flex:1; padding:32px; }
  .ei-header { margin-bottom:28px; }
  .ei-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .ei-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Stats */
  .ei-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
  .ei-stat { background:#fff; border-radius:12px; padding:18px 20px; border:1px solid ${C.border}; display:flex; align-items:center; gap:14px; }
  .ei-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ei-stat-val { font-size:22px; font-weight:700; color:${C.dark}; line-height:1; }
  .ei-stat-label { font-size:12px; color:${C.mid}; margin-top:3px; }

  /* Filtros */
  .ei-toolbar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .ei-search { flex:1; min-width:200px; max-width:300px; padding:9px 14px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:#fff; color:${C.dark}; transition:border 0.18s; }
  .ei-search:focus { border-color:${C.navy}; }
  .ei-filter-tabs { display:flex; gap:4px; background:#fff; padding:4px; border-radius:10px; border:1px solid ${C.border}; }
  .ei-filter-tab { padding:7px 16px; border-radius:7px; border:none; background:transparent; font-size:13px; font-weight:500; color:${C.mid}; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:6px; }
  .ei-filter-tab.active { background:${C.navy}; color:#fff; }
  .ei-filter-tab:not(.active):hover { background:${C.skyLight}; color:${C.dark}; }
  .ei-badge-count { background:rgba(255,255,255,0.25); border-radius:20px; padding:1px 7px; font-size:11px; font-weight:700; }
  .ei-filter-tab:not(.active) .ei-badge-count { background:${C.skyLight}; color:${C.navy}; }

  /* Lista de excusas */
  .ei-list { display:flex; flex-direction:column; gap:12px; }
  .ei-excuse-card { background:#fff; border-radius:14px; border:1px solid ${C.border}; overflow:hidden; transition:box-shadow 0.18s; }
  .ei-excuse-card:hover { box-shadow:0 4px 20px rgba(27,63,107,0.08); }
  .ei-excuse-card.pending   { border-left:4px solid #f59e0b; }
  .ei-excuse-card.approved  { border-left:4px solid #22c55e; }
  .ei-excuse-card.rejected  { border-left:4px solid #ef4444; }

  .ei-card-top { padding:16px 20px; display:flex; align-items:flex-start; gap:14px; }
  .ei-card-avatar { width:40px; height:40px; border-radius:10px; background:${C.skyLight}; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:${C.navy}; flex-shrink:0; }
  .ei-card-info { flex:1; min-width:0; }
  .ei-card-name { font-size:15px; font-weight:600; color:${C.dark}; }
  .ei-card-meta { display:flex; flex-wrap:wrap; gap:12px; margin-top:5px; }
  .ei-meta-item { display:flex; align-items:center; gap:5px; font-size:12px; color:${C.mid}; }
  .ei-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }

  /* Badge estado */
  .ei-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
  .ei-badge.pending    { background:#fef9c3; color:#854d0e; }
  .ei-badge.approved   { background:#dcfce7; color:#166534; }
  .ei-badge.rejected   { background:#fee2e2; color:#991b1b; }

  /* Motivo */
  .ei-card-body { padding:0 20px 16px; }
  .ei-motivo { font-size:13px; color:${C.mid}; line-height:1.5; background:${C.skyPale}; border-radius:8px; padding:10px 12px; }
  .ei-tipo { display:inline-block; font-size:11px; font-weight:600; color:${C.navy}; background:${C.skyLight}; border-radius:6px; padding:2px 8px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px; }

  /* Evidencia */
  .ei-evidencia { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:${C.navy}; font-weight:500; text-decoration:none; padding:6px 12px; background:${C.skyLight}; border-radius:8px; border:1px solid ${C.border}; transition:all 0.18s; margin-top:8px; }
  .ei-evidencia:hover { background:${C.sky}; }

  /* Acciones */
  .ei-card-actions { padding:12px 20px; border-top:1px solid ${C.border}; display:flex; gap:8px; align-items:center; background:${C.skyPale}; }
  .ei-btn { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .ei-btn-approve { background:#dcfce7; color:#166534; border:1px solid #86efac; }
  .ei-btn-approve:hover { background:#bbf7d0; }
  .ei-btn-reject  { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }
  .ei-btn-reject:hover  { background:#fecaca; }
  .ei-btn-view    { background:#fff; color:${C.navy}; border:1px solid ${C.border}; }
  .ei-btn-view:hover    { background:${C.skyLight}; }
  .ei-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ei-comentario-docente { font-size:12px; color:${C.mid}; font-style:italic; margin-left:auto; max-width:300px; text-align:right; }

  /* Empty */
  .ei-empty { text-align:center; padding:60px 20px; color:${C.mid}; }
  .ei-empty svg { opacity:0.25; margin-bottom:12px; }
  .ei-empty p { font-size:14px; }

  /* Modal rechazo */
  .ei-overlay { position:fixed; inset:0; background:rgba(10,24,40,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .ei-modal { background:#fff; border-radius:16px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.18); animation:ei-pop 0.2s ease; }
  @keyframes ei-pop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
  .ei-modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 26px 18px; border-bottom:1px solid ${C.border}; }
  .ei-modal-head h2 { font-family:'Playfair Display',serif; font-size:20px; color:${C.dark}; }
  .ei-modal-body { padding:22px 26px; }
  .ei-modal-foot { padding:16px 26px; border-top:1px solid ${C.border}; display:flex; justify-content:flex-end; gap:10px; }
  .ei-close { background:none; border:none; cursor:pointer; color:${C.mid}; display:flex; align-items:center; }
  .ei-close:hover { color:${C.dark}; }
  .ei-field { margin-bottom:14px; }
  .ei-label { display:block; font-size:13px; font-weight:500; color:${C.dark}; margin-bottom:5px; }
  .ei-textarea { width:100%; padding:10px 12px; border-radius:8px; border:1px solid ${C.border}; font-size:14px; color:${C.dark}; font-family:'DM Sans',sans-serif; outline:none; min-height:90px; resize:vertical; transition:border 0.18s; box-sizing:border-box; }
  .ei-textarea:focus { border-color:${C.navy}; }

  /* Modal detalle */
  .ei-detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${C.border}; font-size:14px; }
  .ei-detail-row:last-child { border-bottom:none; }
  .ei-detail-label { color:${C.mid}; font-weight:500; }
  .ei-detail-val { color:${C.dark}; text-align:right; max-width:260px; }

  /* Toast */
  .ei-toast-wrap { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
  .ei-toast { display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:10px; font-size:14px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,0.12); animation:ei-slide 0.25s ease; }
  .ei-toast.success { background:#166534; color:#fff; }
  .ei-toast.error   { background:#991b1b; color:#fff; }
  .ei-toast.info    { background:${C.navy}; color:#fff; }
  @keyframes ei-slide { from { transform:translateX(60px); opacity:0; } to { transform:translateX(0); opacity:1; } }

  @media (max-width:900px) {
    .ei-stats { grid-template-columns:repeat(2,1fr); }
    .ei-sidebar { transform:translateX(-100%); }
    .ei-main { margin-left:0; padding:20px; }
  }
`

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T12:00:00').toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getStudentName(student) {
  return student?.full_name || student?.nombre || '--'
}
function getStudentCode(student) {
  return student?.enrollment_code || student?.matricula || '--'
}
function getStatusMeta(status = 'pending') {
  const meta = {
    pending:   { label: 'Pendiente', className: 'pending' },
    approved:  { label: 'Aprobada', className: 'approved' },
    rejected:  { label: 'Rechazada', className: 'rejected' },
    pendiente: { label: 'Pendiente', className: 'pending' },
    aprobada:  { label: 'Aprobada', className: 'approved' },
    rechazada: { label: 'Rechazada', className: 'rejected' },
  }
  return meta[status] || { label: status, className: status }
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800)
  }, [])
  return { toasts, toast: add }
}

const TIPOS = {
  illness:     'Enfermedad',
  family:      'Motivo familiar',
  accident:    'Accidente',
  other:       'Otro',
  enfermedad:  'Enfermedad',
  familiar:    'Motivo familiar',
  accidente:   'Accidente',
  otro:        'Otro',
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function ExcuseInbox() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, toast } = useToast()

  const [excuses, setExcuses]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [filterEstado, setFilterEstado] = useState('pending')
  const [search, setSearch]         = useState('')
  const [saving, setSaving]         = useState(false)

  // Modal rechazo
  const [rejectTarget, setRejectTarget] = useState(null)
  const [comentario, setComentario]     = useState('')

  // Modal detalle
  const [detailTarget, setDetailTarget] = useState(null)

  const navItems = [
    { label: 'Escanear QR', path: '/teacher/dashboard', Icon: IcoQR      },
    { label: 'Excusas',     path: '/teacher/inbox',     Icon: IcoInbox   },
    { label: 'Ausencias',   path: '/teacher/absences',  Icon: IcoAbsences },
  ]

  useEffect(() => {
    injectStyles()
    loadExcuses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function injectStyles() {
    if (document.getElementById('ei-styles')) return
    const el = document.createElement('style')
    el.id = 'ei-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  // ── Cargar excusas de las secciones del docente ───────────
  async function loadExcuses() {
    setLoading(true)
    try {
      let query = supabase
        .from('excuses')
        .select(`
          *,
          students(*),
          parent:parent_id(full_name, email, phone)
        `)
        .order('created_at', { ascending: false })

      // Si el docente tiene secciones asignadas, filtrar por ellas
      if (profile?.secciones_ids?.length) {
        // Obtener students de esas secciones
        const { data: sts } = await supabase
          .from('students')
          .select('id')
          .in('grade_section_id', profile.secciones_ids)
        const ids = (sts || []).map(s => s.id)
        if (ids.length) query = query.in('student_id', ids)
      }

      const { data, error } = await query
      if (error) throw error
      setExcuses(data || [])
    } catch (err) {
      console.error(err)
      toast('Error al cargar las excusas.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Aprobar excusa ────────────────────────────────────────
  async function handleApprove(excuse) {
    setSaving(true)
    try {
      // 1) Actualizar estado de la excusa
      const { error } = await supabase
        .from('excuses')
        .update({ status: 'approved', teacher_id: profile?.id })
        .eq('id', excuse.id)
      if (error) throw error

      // 2) Si tiene attendance_id, actualizar estado a 'justificado'
      if (excuse.attendance_id) {
        await supabase
          .from('attendance')
          .update({ estado: 'justificado' })
          .eq('id', excuse.attendance_id)
      } else {
        // Buscar el registro de attendance de esa fecha y estudiante
        const { data: att } = await supabase
          .from('attendance')
          .select('id')
          .eq('student_id', excuse.student_id)
          .eq('fecha', excuse.absence_date)
          .limit(1)
        if (att?.length) {
          await supabase
            .from('attendance')
            .update({ estado: 'justificado' })
            .eq('id', att[0].id)
        }
      }

      // 3) Audit log
      await registrarAudit('aprobar_excusa', 'excuses', excuse.id)

      toast(`Excusa de ${getStudentName(excuse.students)} aprobada.`, 'success')
      await loadExcuses()
    } catch (err) {
      toast(err.message || 'Error al aprobar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Rechazar excusa ───────────────────────────────────────
  function openReject(excuse) {
    setRejectTarget(excuse)
    setComentario('')
  }

  async function handleReject(e) {
    e.preventDefault()
    if (!comentario.trim()) { toast('El comentario es obligatorio al rechazar.', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('excuses')
        .update({
          status:          'rejected',
          teacher_comment: comentario.trim(),
          teacher_id:      profile?.id,
        })
        .eq('id', rejectTarget.id)
      if (error) throw error

      await registrarAudit('rechazar_excusa', 'excuses', rejectTarget.id, { comentario: comentario.trim() })

      toast(`Excusa rechazada.`, 'info')
      setRejectTarget(null)
      await loadExcuses()
    } catch (err) {
      toast(err.message || 'Error al rechazar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Audit ─────────────────────────────────────────────────
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

  // ── Filtrar ───────────────────────────────────────────────
  const filtered = excuses.filter(ex => {
    const matchEstado = filterEstado === 'todos' || getStatusMeta(ex.status).className === filterEstado
    const q = search.toLowerCase()
    const nombre = getStudentName(ex.students).toLowerCase()
    const matricula = getStudentCode(ex.students).toLowerCase()
    return matchEstado && (!q || nombre.includes(q) || matricula.includes(q))
  })

  const counts = {
    pending:   excuses.filter(e => getStatusMeta(e.status).className === 'pending').length,
    approved:  excuses.filter(e => getStatusMeta(e.status).className === 'approved').length,
    rejected:  excuses.filter(e => getStatusMeta(e.status).className === 'rejected').length,
    todos:     excuses.length,
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="ei-root">
      {/* Sidebar */}
      <aside className="ei-sidebar">
        <div className="ei-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Panel Docente" />
        </div>
        <nav className="ei-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`ei-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="ei-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Docente"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="ei-main">
        <div className="ei-header">
          <h1>Bandeja de Excusas</h1>
          <p>Revisa y gestiona las justificaciones enviadas por los tutores</p>
        </div>

        {/* Stats */}
        <div className="ei-stats">
          <div className="ei-stat">
            <div className="ei-stat-icon" style={{ background: '#fef9c3' }}>
              <IcoClock style={{ color: '#ca8a04' }} />
            </div>
            <div>
              <div className="ei-stat-val">{counts.pending}</div>
              <div className="ei-stat-label">Pendientes de revisión</div>
            </div>
          </div>
          <div className="ei-stat">
            <div className="ei-stat-icon" style={{ background: '#dcfce7' }}>
              <IcoCheck style={{ color: '#16a34a' }} />
            </div>
            <div>
              <div className="ei-stat-val">{counts.approved}</div>
              <div className="ei-stat-label">Aprobadas</div>
            </div>
          </div>
          <div className="ei-stat">
            <div className="ei-stat-icon" style={{ background: '#fee2e2' }}>
              <IcoX style={{ color: '#dc2626' }} />
            </div>
            <div>
              <div className="ei-stat-val">{counts.rejected}</div>
              <div className="ei-stat-label">Rechazadas</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ei-toolbar">
          <input
            className="ei-search"
            placeholder="Buscar estudiante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ei-filter-tabs">
            {[
              { key: 'pending',   label: 'Pendientes' },
              { key: 'approved',  label: 'Aprobadas'  },
              { key: 'rejected',  label: 'Rechazadas' },
              { key: 'todos',     label: 'Todas'      },
            ].map(f => (
              <button
                key={f.key}
                className={`ei-filter-tab${filterEstado === f.key ? ' active' : ''}`}
                onClick={() => setFilterEstado(f.key)}
              >
                {f.label}
                <span className="ei-badge-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.mid }}>Cargando excusas...</div>
        ) : filtered.length === 0 ? (
          <div className="ei-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.mid} strokeWidth="1.5">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
            </svg>
            <p>
              {filterEstado === 'pending'
                ? 'No hay excusas pendientes de revisión.'
                : `No hay excusas ${filterEstado === 'todos' ? '' : filterEstado + 's'}.`}
            </p>
          </div>
        ) : (
          <div className="ei-list">
            {filtered.map(ex => (
              <div key={ex.id} className={`ei-excuse-card ${getStatusMeta(ex.status).className}`}>
                {/* Encabezado de la tarjeta */}
                <div className="ei-card-top">
                  <div className="ei-card-avatar">{getInitials(getStudentName(ex.students))}</div>
                  <div className="ei-card-info">
                    <div className="ei-card-name">{getStudentName(ex.students)}</div>
                    <div className="ei-card-meta">
                      <span className="ei-meta-item"><IcoUser /> {getStudentCode(ex.students)}</span>
                      <span className="ei-meta-item">
                        {ex.students?.grade_sections
                          ? `${ex.students.grade_sections.grado} ${ex.students.grade_sections.seccion}`
                          : '—'}
                      </span>
                      <span className="ei-meta-item"><IcoCalendar /> {formatFecha(ex.absence_date)}</span>
                      {ex.parent?.full_name && (
                        <span className="ei-meta-item"><IcoUser /> Tutor: {ex.parent.full_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="ei-card-right">
                    <span className={`ei-badge ${getStatusMeta(ex.status).className}`}>
                      {getStatusMeta(ex.status).className === 'pending' && <IcoClock />}
                      {getStatusMeta(ex.status).className === 'approved' && <IcoCheck />}
                      {getStatusMeta(ex.status).className === 'rejected' && <IcoX />}
                      {getStatusMeta(ex.status).label}
                    </span>
                    <span style={{ fontSize: 12, color: C.mid }}>
                      {new Date(ex.created_at).toLocaleDateString('es-DO')}
                    </span>
                  </div>
                </div>

                {/* Cuerpo: motivo + evidencia */}
                <div className="ei-card-body">
                  {ex.excuse_type && (
                    <div className="ei-tipo">{TIPOS[ex.excuse_type] || ex.excuse_type}</div>
                  )}
                  <div className="ei-motivo">
                    {ex.reason || <em style={{ opacity: 0.6 }}>Sin motivo especificado</em>}
                  </div>
                  {ex.attachment_url && (
                    <a
                      className="ei-evidencia"
                      href={ex.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IcoFile /> Ver evidencia adjunta
                    </a>
                  )}
                  {getStatusMeta(ex.status).className === 'rejected' && ex.teacher_comment && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff5f5', borderRadius: 8, fontSize: 13, color: '#991b1b', borderLeft: '3px solid #fca5a5' }}>
                      <strong>Motivo de rechazo:</strong> {ex.teacher_comment}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="ei-card-actions">
                  <button
                    className="ei-btn ei-btn-view"
                    onClick={() => setDetailTarget(ex)}
                  >
                    <IcoEye /> Ver detalle
                  </button>

                  {getStatusMeta(ex.status).className === 'pending' && (
                    <>
                      <button
                        className="ei-btn ei-btn-approve"
                        onClick={() => handleApprove(ex)}
                        disabled={saving}
                      >
                        <IcoCheck /> Aprobar
                      </button>
                      <button
                        className="ei-btn ei-btn-reject"
                        onClick={() => openReject(ex)}
                        disabled={saving}
                      >
                        <IcoX /> Rechazar
                      </button>
                    </>
                  )}

                  {getStatusMeta(ex.status).className !== 'pending' && (
                    <span className="ei-comentario-docente">
                  {getStatusMeta(ex.status).className === 'approved' ? '✓ Asistencia actualizada a justificado' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal: Rechazar excusa ── */}
      {rejectTarget && (
        <div className="ei-overlay" onClick={() => setRejectTarget(null)}>
          <div className="ei-modal" onClick={e => e.stopPropagation()}>
            <div className="ei-modal-head">
              <h2>Rechazar excusa</h2>
              <button className="ei-close" onClick={() => setRejectTarget(null)}><IcoX /></button>
            </div>
            <form onSubmit={handleReject}>
              <div className="ei-modal-body">
                <p style={{ fontSize: 14, color: C.mid, marginBottom: 16 }}>
                  Estudiante: <strong style={{ color: C.dark }}>{getStudentName(rejectTarget.students)}</strong>
                  &nbsp;·&nbsp;{formatFecha(rejectTarget.absence_date)}
                </p>
                <div className="ei-field">
                  <label className="ei-label">Motivo del rechazo * <span style={{ color: '#991b1b', fontSize: 12 }}>(obligatorio)</span></label>
                  <textarea
                    className="ei-textarea"
                    placeholder="Explica al tutor por qué se rechaza esta excusa..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="ei-modal-foot">
                <button type="button" className="ei-btn ei-btn-view" onClick={() => setRejectTarget(null)}>Cancelar</button>
                <button type="submit" className="ei-btn ei-btn-reject" disabled={saving}>
                  {saving ? 'Rechazando...' : <><IcoX /> Confirmar rechazo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Detalle completo ── */}
      {detailTarget && (
        <div className="ei-overlay" onClick={() => setDetailTarget(null)}>
          <div className="ei-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="ei-modal-head">
              <h2>Detalle de excusa</h2>
              <button className="ei-close" onClick={() => setDetailTarget(null)}><IcoX /></button>
            </div>
            <div className="ei-modal-body">
              {[
                ['Estudiante',    getStudentName(detailTarget.students)],
                ['Matrícula',     getStudentCode(detailTarget.students)],
                ['Sección',       detailTarget.students?.grade_sections ? `${detailTarget.students.grade_sections.grado} ${detailTarget.students.grade_sections.seccion}` : '—'],
                ['Fecha ausencia',formatFecha(detailTarget.absence_date)],
                ['Tipo',          TIPOS[detailTarget.excuse_type] || detailTarget.excuse_type || '—'],
                ['Motivo',        detailTarget.reason || '—'],
                ['Tutor',         detailTarget.parent?.full_name || '—'],
                ['Contacto tutor',detailTarget.parent?.phone || detailTarget.parent?.email || '—'],
                ['Estado',        getStatusMeta(detailTarget.status).label],
                ['Enviada el',    new Date(detailTarget.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })],
              ].map(([label, val]) => (
                <div className="ei-detail-row" key={label}>
                  <span className="ei-detail-label">{label}</span>
                  <span className="ei-detail-val">{val || '—'}</span>
                </div>
              ))}
              {detailTarget.teacher_comment && (
                <div className="ei-detail-row">
                  <span className="ei-detail-label">Comentario docente</span>
                  <span className="ei-detail-val" style={{ color: '#991b1b' }}>{detailTarget.teacher_comment}</span>
                </div>
              )}
              {detailTarget.attachment_url && (
                <div style={{ marginTop: 14 }}>
                  <a className="ei-evidencia" href={detailTarget.attachment_url} target="_blank" rel="noopener noreferrer">
                    <IcoFile /> Abrir evidencia adjunta
                  </a>
                </div>
              )}
            </div>
            <div className="ei-modal-foot">
              <button className="ei-btn ei-btn-view" onClick={() => setDetailTarget(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="ei-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`ei-toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}
