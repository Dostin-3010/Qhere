// ============================================================
// ExcuseHistory.jsx
// Ruta: /parent/history
// Prefijo CSS: .eh-
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
const IcoDash    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoSend    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IcoHistory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
const IcoLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoClock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IcoFile    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IcoPlus    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoEye     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

// ─── Estilos ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .eh-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .eh-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .eh-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .eh-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .eh-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .eh-nav { flex:1; padding:16px 0; }
  .eh-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; }
  .eh-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .eh-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .eh-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .eh-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .eh-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .eh-user-name { font-size:13px; color:#fff; font-weight:500; }
  .eh-user-role { font-size:11px; color:${C.skyMid}; }
  .eh-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .eh-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .eh-main { margin-left:240px; flex:1; padding:32px; }
  .eh-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
  .eh-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .eh-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Botones */
  .eh-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .eh-btn-primary { background:${C.navy}; color:#fff; }
  .eh-btn-primary:hover { background:${C.navyMid}; }
  .eh-btn-secondary { background:#fff; color:${C.navy}; border:1px solid ${C.border}; }
  .eh-btn-secondary:hover { background:${C.skyLight}; }
  .eh-btn-sm { padding:6px 14px; font-size:13px; }

  /* Filtros */
  .eh-toolbar { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; align-items:center; }
  .eh-search { flex:1; min-width:180px; max-width:260px; padding:9px 14px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:#fff; color:${C.dark}; transition:border 0.18s; }
  .eh-search:focus { border-color:${C.navy}; }
  .eh-select { padding:9px 12px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; background:#fff; color:${C.dark}; outline:none; cursor:pointer; }
  .eh-filter-tabs { display:flex; gap:4px; background:#fff; padding:4px; border-radius:10px; border:1px solid ${C.border}; }
  .eh-filter-tab { padding:7px 16px; border-radius:7px; border:none; background:transparent; font-size:13px; font-weight:500; color:${C.mid}; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:6px; }
  .eh-filter-tab.active { background:${C.navy}; color:#fff; }
  .eh-filter-tab:not(.active):hover { background:${C.skyLight}; color:${C.dark}; }
  .eh-count { background:${C.skyLight}; color:${C.navy}; border-radius:20px; padding:1px 7px; font-size:11px; font-weight:700; }
  .eh-filter-tab.active .eh-count { background:rgba(255,255,255,0.2); color:#fff; }

  /* Lista */
  .eh-list { display:flex; flex-direction:column; gap:10px; }

  /* Tarjeta excusa */
  .eh-card { background:#fff; border-radius:13px; border:1px solid ${C.border}; overflow:hidden; transition:box-shadow 0.18s; }
  .eh-card:hover { box-shadow:0 4px 18px rgba(27,63,107,0.07); }
  .eh-card.pending   { border-left:4px solid #f59e0b; }
  .eh-card.approved  { border-left:4px solid #22c55e; }
  .eh-card.rejected  { border-left:4px solid #ef4444; }

  .eh-card-main { padding:16px 20px; display:flex; align-items:flex-start; gap:14px; }
  .eh-card-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .eh-card-icon.pending   { background:#fef9c3; }
  .eh-card-icon.approved  { background:#dcfce7; }
  .eh-card-icon.rejected  { background:#fee2e2; }
  .eh-card-info { flex:1; min-width:0; }
  .eh-card-title { font-size:15px; font-weight:600; color:${C.dark}; }
  .eh-card-meta { display:flex; flex-wrap:wrap; gap:10px; margin-top:4px; }
  .eh-meta { font-size:12px; color:${C.mid}; display:flex; align-items:center; gap:4px; }
  .eh-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }

  /* Badge */
  .eh-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
  .eh-badge.pending   { background:#fef9c3; color:#854d0e; }
  .eh-badge.approved  { background:#dcfce7; color:#166534; }
  .eh-badge.rejected  { background:#fee2e2; color:#991b1b; }

  /* Motivo y rechazo */
  .eh-card-body { padding:0 20px 14px; }
  .eh-motivo { font-size:13px; color:${C.mid}; background:${C.skyPale}; border-radius:8px; padding:9px 12px; line-height:1.5; }
  .eh-rechazo { margin-top:8px; padding:8px 12px; background:#fff5f5; border-radius:8px; font-size:13px; color:#991b1b; border-left:3px solid #fca5a5; }
  .eh-rechazo strong { display:block; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px; }

  /* Acciones */
  .eh-card-foot { padding:10px 20px; border-top:1px solid ${C.border}; background:${C.skyPale}; display:flex; gap:8px; align-items:center; }
  .eh-tipo-chip { font-size:11px; font-weight:600; color:${C.navy}; background:${C.skyLight}; border-radius:6px; padding:3px 9px; text-transform:uppercase; letter-spacing:0.4px; margin-right:auto; }

  /* Empty */
  .eh-empty { text-align:center; padding:64px 20px; color:${C.mid}; }
  .eh-empty p { font-size:14px; margin-top:12px; }

  /* Modal detalle */
  .eh-overlay { position:fixed; inset:0; background:rgba(10,24,40,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .eh-modal { background:#fff; border-radius:16px; width:100%; max-width:500px; box-shadow:0 20px 60px rgba(0,0,0,0.18); animation:eh-pop 0.2s ease; }
  @keyframes eh-pop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
  .eh-modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 26px 18px; border-bottom:1px solid ${C.border}; }
  .eh-modal-head h2 { font-family:'Playfair Display',serif; font-size:20px; color:${C.dark}; }
  .eh-modal-body { padding:22px 26px; }
  .eh-modal-foot { padding:16px 26px; border-top:1px solid ${C.border}; display:flex; justify-content:flex-end; }
  .eh-close { background:none; border:none; cursor:pointer; color:${C.mid}; display:flex; align-items:center; font-size:20px; line-height:1; }
  .eh-close:hover { color:${C.dark}; }
  .eh-detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${C.border}; font-size:14px; }
  .eh-detail-row:last-child { border-bottom:none; }
  .eh-detail-label { color:${C.mid}; font-weight:500; }
  .eh-detail-val { color:${C.dark}; text-align:right; max-width:280px; }

  @media (max-width:900px) {
    .eh-sidebar { transform:translateX(-100%); }
    .eh-main { margin-left:0; padding:20px; }
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
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const STATUS_LABEL = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' }

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function ExcuseHistory() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [hijos, setHijos]         = useState([])
  const [excuses, setExcuses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterHijo, setFilterHijo]     = useState('todos')
  const [filterMes, setFilterMes]       = useState('todos')
  const [search, setSearch]             = useState('')
  const [detail, setDetail]             = useState(null)

  const navItems = [
    { label: 'Mi panel',      path: '/parent/dashboard',  Icon: IcoDash    },
    { label: 'Enviar excusa', path: '/parent/send-excuse', Icon: IcoSend    },
    { label: 'Historial',     path: '/parent/history',    Icon: IcoHistory  },
  ]

  useEffect(() => {
    injectStyles()
    loadData()
  }, [])

  function injectStyles() {
    if (document.getElementById('eh-styles')) return
    const el = document.createElement('style')
    el.id = 'eh-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  async function loadData() {
    setLoading(true)
    try {
      // Cargar hijos del padre
      const { data: links } = await supabase
        .from('parents')
        .select('*, students(id, nombre, matricula)')
        .eq('profile_id', profile?.id)

      const lista = (links || []).map(l => l.students).filter(Boolean)
      setHijos(lista)

      if (!lista.length) { setLoading(false); return }

      const studentIds = lista.map(h => h.id)

      // Cargar todas las excusas de todos los hijos
      const { data: exc } = await supabase
        .from('excuses')
        .select('*, students(id, nombre, matricula)')
        .in('student_id', studentIds)
        .order('absence_date', { ascending: false })

      setExcuses(exc || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrar ───────────────────────────────────────────────
  const mesesDisponibles = [...new Set(
    excuses.map(e => e.absence_date?.slice(0, 7)).filter(Boolean)
  )].sort().reverse()

  const filtered = excuses.filter(ex => {
    const matchEstado = filterEstado === 'todos' || ex.status === filterEstado
    const matchHijo   = filterHijo   === 'todos' || ex.student_id === filterHijo
    const matchMes    = filterMes    === 'todos' || ex.absence_date?.startsWith(filterMes)
    const q = search.toLowerCase()
    const nombre = ex.students?.nombre?.toLowerCase() || ''
    const motivo = ex.reason?.toLowerCase() || ''
    const matchSearch = !q || nombre.includes(q) || motivo.includes(q)
    return matchEstado && matchHijo && matchMes && matchSearch
  })

  const counts = {
    todos:     excuses.length,
    pending:   excuses.filter(e => e.status === 'pending').length,
    approved:  excuses.filter(e => e.status === 'approved').length,
    rejected:  excuses.filter(e => e.status === 'rejected').length,
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="eh-root">
      {/* Sidebar */}
      <aside className="eh-sidebar">
        <div className="eh-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Portal de Padres" />
        </div>
        <nav className="eh-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`eh-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="eh-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Padre / Tutor"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="eh-main">
        <div className="eh-header">
          <div>
            <h1>Historial de Excusas</h1>
            <p>{excuses.length} excusa{excuses.length !== 1 ? 's' : ''} en total</p>
          </div>
          <button className="eh-btn eh-btn-primary" onClick={() => navigate('/parent/send-excuse')}>
            <IcoPlus /> Nueva excusa
          </button>
        </div>

        {/* Filtros */}
        <div className="eh-toolbar">
          <input
            className="eh-search"
            placeholder="Buscar por nombre o motivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {hijos.length > 1 && (
            <select className="eh-select" value={filterHijo} onChange={e => setFilterHijo(e.target.value)}>
              <option value="todos">Todos los hijos</option>
              {hijos.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>
          )}

          <select className="eh-select" value={filterMes} onChange={e => setFilterMes(e.target.value)}>
            <option value="todos">Todos los meses</option>
            {mesesDisponibles.map(m => {
              const [y, mo] = m.split('-')
              return <option key={m} value={m}>{MESES[parseInt(mo) - 1]} {y}</option>
            })}
          </select>

          <div className="eh-filter-tabs">
            {[
              { key: 'todos',     label: 'Todas'      },
              { key: 'pending',   label: 'Pendientes' },
              { key: 'approved',  label: 'Aprobadas'  },
              { key: 'rejected',  label: 'Rechazadas' },
            ].map(f => (
              <button
                key={f.key}
                className={`eh-filter-tab${filterEstado === f.key ? ' active' : ''}`}
                onClick={() => setFilterEstado(f.key)}
              >
                {f.label} <span className="eh-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: C.mid }}>Cargando historial...</div>
        ) : filtered.length === 0 ? (
          <div className="eh-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            <p>
              {excuses.length === 0
                ? 'No has enviado ninguna excusa todavía.'
                : 'No hay excusas con estos filtros.'}
            </p>
            {excuses.length === 0 && (
              <button
                className="eh-btn eh-btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/parent/send-excuse')}
              >
                <IcoPlus /> Enviar primera excusa
              </button>
            )}
          </div>
        ) : (
          <div className="eh-list">
            {filtered.map(ex => (
              <div key={ex.id} className={`eh-card ${ex.status}`}>
                <div className="eh-card-main">
                  <div className={`eh-card-icon ${ex.status}`}>
                    {ex.status === 'pending'  && <IcoClock style={{ color: '#ca8a04', width: 18, height: 18 }} />}
                    {ex.status === 'approved' && <IcoCheck style={{ color: '#16a34a', width: 18, height: 18 }} />}
                    {ex.status === 'rejected' && <IcoX     style={{ color: '#dc2626', width: 18, height: 18 }} />}
                  </div>
                  <div className="eh-card-info">
                    <div className="eh-card-title">
                      Ausencia del {formatFecha(ex.absence_date)}
                    </div>
                    <div className="eh-card-meta">
                      {hijos.length > 1 && (
                        <span className="eh-meta">
                          👤 {ex.students?.nombre}
                        </span>
                      )}
                      <span className="eh-meta">
                        📅 Enviada el {new Date(ex.created_at).toLocaleDateString('es-DO')}
                      </span>
                    </div>
                  </div>
                  <div className="eh-card-right">
                    <span className={`eh-badge ${ex.status}`}>
                      {ex.status === 'pending'  && <IcoClock />}
                      {ex.status === 'approved' && <IcoCheck />}
                      {ex.status === 'rejected' && <IcoX />}
                      {STATUS_LABEL[ex.status] || ex.status}
                    </span>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="eh-card-body">
                  <div className="eh-motivo">
                    {ex.reason || <em style={{ opacity: 0.5 }}>Sin motivo especificado</em>}
                  </div>
                  {ex.status === 'rejected' && ex.teacher_comment && (
                    <div className="eh-rechazo">
                      <strong>Motivo del rechazo:</strong>
                      {ex.teacher_comment}
                    </div>
                  )}
                  {ex.status === 'approved' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <IcoCheck style={{ color: '#16a34a' }} /> La asistencia fue actualizada a justificada
                    </div>
                  )}
                </div>

                {/* Pie */}
                <div className="eh-card-foot">
                  <span className="eh-tipo-chip">
                    {TIPOS_LABEL[ex.excuse_type] || ex.excuse_type || 'Sin tipo'}
                  </span>
                  {ex.attachment_url && (
                    <a
                      href={ex.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eh-btn eh-btn-secondary eh-btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <IcoFile /> Ver evidencia
                    </a>
                  )}
                  <button className="eh-btn eh-btn-secondary eh-btn-sm" onClick={() => setDetail(ex)}>
                    <IcoEye /> Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal detalle */}
      {detail && (
        <div className="eh-overlay" onClick={() => setDetail(null)}>
          <div className="eh-modal" onClick={e => e.stopPropagation()}>
            <div className="eh-modal-head">
              <h2>Detalle de excusa</h2>
              <button className="eh-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="eh-modal-body">
              {[
                ['Estudiante',     detail.students?.nombre],
                ['Matrícula',      detail.students?.matricula],
                ['Fecha ausencia', formatFecha(detail.absence_date)],
                ['Tipo',           TIPOS_LABEL[detail.excuse_type] || detail.excuse_type || '—'],
                ['Motivo',         detail.reason || '—'],
                ['Estado',         STATUS_LABEL[detail.status] || detail.status],
                ['Enviada el',     new Date(detail.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })],
                ...(detail.teacher_comment ? [['Comentario docente', detail.teacher_comment]] : []),
              ].map(([label, val]) => (
                <div key={label} className="eh-detail-row">
                  <span className="eh-detail-label">{label}</span>
                  <span className="eh-detail-val" style={label === 'Comentario docente' ? { color: '#991b1b' } : {}}>
                    {val}
                  </span>
                </div>
              ))}
              {detail.attachment_url && (
                <div style={{ marginTop: 16 }}>
                  <a
                    href={detail.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eh-btn eh-btn-secondary"
                    style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}
                  >
                    <IcoFile /> Abrir evidencia adjunta
                  </a>
                </div>
              )}
            </div>
            <div className="eh-modal-foot">
              <button className="eh-btn eh-btn-primary" onClick={() => setDetail(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
