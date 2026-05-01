// ============================================================
// SendExcuse.jsx
// Ruta: /parent/send-excuse
// Prefijo CSS: .se-
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

const API_BASE_URL = (() => {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '')

  return `${base}/api`
})()

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
const IcoUpload  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
const IcoCheck   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoFile    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>

// ─── Estilos ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .se-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .se-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .se-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .se-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .se-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .se-nav { flex:1; padding:16px 0; }
  .se-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; }
  .se-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .se-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .se-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .se-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .se-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .se-user-name { font-size:13px; color:#fff; font-weight:500; }
  .se-user-role { font-size:11px; color:${C.skyMid}; }
  .se-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .se-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .se-main { margin-left:240px; flex:1; padding:32px; display:flex; flex-direction:column; align-items:center; }
  .se-header { width:100%; max-width:640px; margin-bottom:28px; }
  .se-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .se-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Formulario */
  .se-form-card { background:#fff; border-radius:16px; border:1px solid ${C.border}; width:100%; max-width:640px; overflow:hidden; }
  .se-form-head { padding:22px 28px 18px; border-bottom:1px solid ${C.border}; background:${C.skyPale}; }
  .se-form-head h2 { font-size:16px; font-weight:600; color:${C.dark}; }
  .se-form-head p { font-size:13px; color:${C.mid}; margin-top:3px; }
  .se-form-body { padding:26px 28px; }
  .se-form-foot { padding:18px 28px; border-top:1px solid ${C.border}; display:flex; justify-content:flex-end; gap:10px; }

  /* Campos */
  .se-field { margin-bottom:20px; }
  .se-label { display:block; font-size:13px; font-weight:600; color:${C.dark}; margin-bottom:6px; }
  .se-label span { color:${C.mid}; font-weight:400; }
  .se-input, .se-select, .se-textarea {
    width:100%; padding:10px 14px; border-radius:9px; border:1.5px solid ${C.border};
    font-size:14px; color:${C.dark}; font-family:'DM Sans',sans-serif; outline:none;
    transition:border 0.18s; background:#fff; box-sizing:border-box;
  }
  .se-input:focus, .se-select:focus, .se-textarea:focus { border-color:${C.navy}; }
  .se-textarea { min-height:100px; resize:vertical; }
  .se-row2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

  /* Selector de hijo */
  .se-hijo-grid { display:flex; flex-direction:column; gap:8px; }
  .se-hijo-option {
    display:flex; align-items:center; gap:12px; padding:12px 16px;
    border-radius:10px; border:1.5px solid ${C.border}; cursor:pointer; transition:all 0.18s;
    background:#fff;
  }
  .se-hijo-option:hover { border-color:${C.navy}; background:${C.skyPale}; }
  .se-hijo-option.selected { border-color:${C.navy}; background:${C.skyLight}; }
  .se-hijo-avatar { width:38px; height:38px; border-radius:9px; background:${C.skyLight}; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:${C.navy}; flex-shrink:0; }
  .se-hijo-name { font-size:14px; font-weight:600; color:${C.dark}; }
  .se-hijo-meta { font-size:12px; color:${C.mid}; margin-top:2px; }
  .se-hijo-check { margin-left:auto; width:22px; height:22px; border-radius:50%; background:${C.navy}; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* Upload */
  .se-upload-area {
    border:2px dashed ${C.border}; border-radius:12px; padding:28px 20px;
    text-align:center; cursor:pointer; transition:all 0.18s; background:${C.skyPale};
    position:relative;
  }
  .se-upload-area:hover, .se-upload-area.dragover { border-color:${C.navy}; background:${C.skyLight}; }
  .se-upload-area input { position:absolute; inset:0; opacity:0; cursor:pointer; }
  .se-upload-icon { color:${C.skyMid}; margin-bottom:8px; }
  .se-upload-text { font-size:14px; color:${C.mid}; }
  .se-upload-text strong { color:${C.navy}; }
  .se-upload-hint { font-size:12px; color:${C.skyMid}; margin-top:4px; }
  .se-file-preview { display:flex; align-items:center; gap:10px; padding:12px 14px; background:${C.skyLight}; border-radius:10px; border:1px solid ${C.border}; }
  .se-file-name { font-size:13px; font-weight:500; color:${C.dark}; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .se-file-size { font-size:12px; color:${C.mid}; flex-shrink:0; }
  .se-file-remove { background:none; border:none; cursor:pointer; color:${C.mid}; display:flex; align-items:center; padding:2px; transition:color 0.15s; }
  .se-file-remove:hover { color:#c0392b; }

  /* Progress bar */
  .se-progress { height:4px; background:${C.border}; border-radius:2px; margin-top:8px; overflow:hidden; }
  .se-progress-bar { height:100%; background:${C.navy}; border-radius:2px; transition:width 0.3s; }

  /* Botones */
  .se-btn { display:inline-flex; align-items:center; gap:8px; padding:11px 24px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .se-btn-primary { background:${C.navy}; color:#fff; }
  .se-btn-primary:hover { background:${C.navyMid}; }
  .se-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .se-btn-secondary { background:#fff; color:${C.navy}; border:1.5px solid ${C.border}; }
  .se-btn-secondary:hover { background:${C.skyLight}; }

  /* Éxito */
  .se-success-card { background:#fff; border-radius:16px; border:1px solid #86efac; width:100%; max-width:640px; padding:48px 32px; text-align:center; }
  .se-success-icon { width:64px; height:64px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
  .se-success-title { font-family:'Playfair Display',serif; font-size:22px; color:${C.dark}; margin-bottom:8px; }
  .se-success-sub { font-size:14px; color:${C.mid}; line-height:1.6; }
  .se-success-actions { display:flex; gap:10px; justify-content:center; margin-top:24px; }

  /* Toast */
  .se-toast-wrap { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
  .se-toast { display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:10px; font-size:14px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,0.12); animation:se-slide 0.25s ease; }
  .se-toast.success { background:#166534; color:#fff; }
  .se-toast.error   { background:#991b1b; color:#fff; }
  .se-toast.info    { background:${C.navy}; color:#fff; }
  @keyframes se-slide { from { transform:translateX(60px); opacity:0; } to { transform:translateX(0); opacity:1; } }

  @media (max-width:900px) {
    .se-sidebar { transform:translateX(-100%); }
    .se-main { margin-left:0; padding:20px; }
    .se-row2 { grid-template-columns:1fr; }
  }
`

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function formatBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
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

const TIPOS = [
  { value: 'illness',  label: 'Enfermedad' },
  { value: 'family',   label: 'Motivo familiar' },
  { value: 'accident', label: 'Accidente' },
  { value: 'other',    label: 'Otro' },
]

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function SendExcuse() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, toast } = useToast()
  const fileRef = useRef()

  const [hijos, setHijos]           = useState([])  // estudiantes vinculados al padre
  const [loadingHijos, setLoadingHijos] = useState(true)
  const [submitted, setSubmitted]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragover, setDragover]     = useState(false)

  // Formulario
  const [selectedHijo, setSelectedHijo] = useState('')
  const [fechaAusencia, setFechaAusencia] = useState('')
  const [tipoAusencia, setTipoAusencia]   = useState('')
  const [motivo, setMotivo]               = useState('')
  const [archivo, setArchivo]             = useState(null)

  const navItems = [
    { label: 'Mi panel',      path: '/parent/dashboard', Icon: IcoDash    },
    { label: 'Enviar excusa', path: '/parent/send-excuse', Icon: IcoSend  },
    { label: 'Historial',     path: '/parent/history',   Icon: IcoHistory },
  ]

  useEffect(() => {
    injectStyles()
    loadHijos()
    // Preseleccionar fecha de hoy
    setFechaAusencia(new Date().toISOString().slice(0, 10))
  }, [])

  function injectStyles() {
    if (document.getElementById('se-styles')) return
    const el = document.createElement('style')
    el.id = 'se-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  // ── Cargar hijos del padre logueado ───────────────────────
  async function loadHijos() {
    setLoadingHijos(true)
    try {
      const { data: links } = await supabase
        .from('parents')
        .select('*, students(id, nombre, matricula, grade_sections:grade_section_id(grado, seccion))')
        .eq('profile_id', profile?.id)

      const lista = (links || []).map(l => l.students).filter(Boolean)
      setHijos(lista)
      if (lista.length === 1) setSelectedHijo(lista[0].id)
    } catch (err) {
      console.error(err)
      toast('Error al cargar los estudiantes vinculados.', 'error')
    } finally {
      setLoadingHijos(false)
    }
  }

  // ── Manejar archivo ───────────────────────────────────────
  function handleFile(file) {
    if (!file) return
    const MAX = 5 * 1024 * 1024 // 5 MB
    const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast('Solo se permiten imágenes (JPG, PNG, WebP) o PDF.', 'error'); return
    }
    if (file.size > MAX) {
      toast('El archivo no puede superar los 5 MB.', 'error'); return
    }
    setArchivo(file)
  }

  function onDrop(e) {
    e.preventDefault(); setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // ── Subir evidencia a Supabase Storage ───────────────────
  async function uploadEvidencia(studentId) {
    if (!archivo) return null
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    if (!accessToken) {
      throw new Error('Tu sesion expiro. Vuelve a iniciar sesion antes de subir la evidencia.')
    }

    const formData = new FormData()
    formData.append('student_id', studentId)
    formData.append('file', archivo)

    setUploadProgress(25)

    const response = await fetch(`${API_BASE_URL}/excuses/upload-evidence`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload.error || 'Error al subir la evidencia.')
    }

    setUploadProgress(100)
    return payload.public_url
  }

  // ── Enviar excusa ─────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedHijo)   { toast('Selecciona el estudiante.', 'error'); return }
    if (!fechaAusencia)  { toast('Indica la fecha de ausencia.', 'error'); return }
    if (!tipoAusencia)   { toast('Selecciona el tipo de ausencia.', 'error'); return }
    if (!motivo.trim())  { toast('Escribe el motivo de la ausencia.', 'error'); return }

    setSaving(true)
    setUploadProgress(0)

    try {
      // 1) Subir evidencia si hay archivo
      let evidenciaUrl = null
      if (archivo) {
        evidenciaUrl = await uploadEvidencia(selectedHijo)
      }

      // 2) Buscar registro de attendance de esa fecha (si existe)
      const { data: att } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', selectedHijo)
        .eq('fecha', fechaAusencia)
        .limit(1)

      // 3) Insertar excusa
      const { error } = await supabase.from('excuses').insert({
        student_id:     selectedHijo,
        parent_id:      profile?.id,
        attendance_id:  att?.[0]?.id || null,
        absence_date:   fechaAusencia,
        excuse_type:    tipoAusencia,
        reason:         motivo.trim(),
        attachment_url: evidenciaUrl,
        status:         'pending',
      })

      if (error) throw error

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast(err.message || 'Error al enviar la excusa.', 'error')
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  function resetForm() {
    setSelectedHijo(hijos.length === 1 ? hijos[0].id : '')
    setFechaAusencia(new Date().toISOString().slice(0, 10))
    setTipoAusencia('')
    setMotivo('')
    setArchivo(null)
    setSubmitted(false)
  }

  const hijoSeleccionado = hijos.find(h => h.id === selectedHijo)

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="se-root">
      {/* Sidebar */}
      <aside className="se-sidebar">
        <div className="se-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Portal de Padres" />
        </div>
        <nav className="se-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`se-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="se-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Padre / Tutor"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="se-main">
        <div className="se-header">
          <h1>Enviar Excusa</h1>
          <p>Justifica la ausencia de tu hijo/a para que el docente la revise</p>
        </div>

        {/* ── Vista de éxito ── */}
        {submitted ? (
          <div className="se-success-card">
            <div className="se-success-icon">
              <IcoCheck style={{ color: '#16a34a', width: 32, height: 32 }} />
            </div>
            <div className="se-success-title">¡Excusa enviada exitosamente!</div>
            <div className="se-success-sub">
              La excusa de <strong>{hijoSeleccionado?.nombre}</strong> fue enviada al docente.<br />
              Será revisada en las próximas horas. Puedes ver el estado en tu historial.
            </div>
            <div className="se-success-actions">
              <button className="se-btn se-btn-secondary" onClick={() => navigate('/parent/history')}>
                <IcoHistory /> Ver historial
              </button>
              <button className="se-btn se-btn-primary" onClick={resetForm}>
                <IcoSend /> Enviar otra excusa
              </button>
            </div>
          </div>
        ) : (

        /* ── Formulario ── */
        <div className="se-form-card">
          <div className="se-form-head">
            <h2>Nueva justificación de ausencia</h2>
            <p>Todos los campos marcados con * son obligatorios</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="se-form-body">

              {/* Selector de hijo */}
              <div className="se-field">
                <label className="se-label">¿Para cuál hijo/a? *</label>
                {loadingHijos ? (
                  <p style={{ color: C.mid, fontSize: 14 }}>Cargando...</p>
                ) : hijos.length === 0 ? (
                  <div style={{ padding: '14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: 14, color: '#92400e' }}>
                    No tienes estudiantes vinculados. Contacta al administrador del centro.
                  </div>
                ) : (
                  <div className="se-hijo-grid">
                    {hijos.map(h => (
                      <div
                        key={h.id}
                        className={`se-hijo-option${selectedHijo === h.id ? ' selected' : ''}`}
                        onClick={() => setSelectedHijo(h.id)}
                      >
                        <div className="se-hijo-avatar">{getInitials(h.nombre)}</div>
                        <div>
                          <div className="se-hijo-name">{h.nombre}</div>
                          <div className="se-hijo-meta">
                            {h.matricula}
                            {h.grade_sections ? ` · ${h.grade_sections.grado} ${h.grade_sections.seccion}` : ''}
                          </div>
                        </div>
                        {selectedHijo === h.id && (
                          <div className="se-hijo-check"><IcoCheck style={{ width: 13, height: 13, color: '#fff' }} /></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fecha y tipo */}
              <div className="se-row2">
                <div className="se-field">
                  <label className="se-label">Fecha de ausencia *</label>
                  <input
                    type="date"
                    className="se-input"
                    value={fechaAusencia}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={e => setFechaAusencia(e.target.value)}
                  />
                </div>
                <div className="se-field">
                  <label className="se-label">Tipo de ausencia *</label>
                  <select className="se-select" value={tipoAusencia} onChange={e => setTipoAusencia(e.target.value)}>
                    <option value="">— Selecciona —</option>
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Motivo */}
              <div className="se-field">
                <label className="se-label">Motivo detallado *</label>
                <textarea
                  className="se-textarea"
                  placeholder="Describe brevemente la razón de la ausencia de tu hijo/a..."
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                />
              </div>

              {/* Evidencia */}
              <div className="se-field">
                <label className="se-label">
                  Evidencia <span>(opcional — foto de récipe, cita médica, etc.)</span>
                </label>

                {!archivo ? (
                  <div
                    className={`se-upload-area${dragover ? ' dragover' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragover(true) }}
                    onDragLeave={() => setDragover(false)}
                    onDrop={onDrop}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => handleFile(e.target.files[0])}
                    />
                    <div className="se-upload-icon"><IcoUpload /></div>
                    <div className="se-upload-text">
                      <strong>Haz clic para subir</strong> o arrastra el archivo aquí
                    </div>
                    <div className="se-upload-hint">JPG, PNG, WebP o PDF · Máximo 5 MB</div>
                  </div>
                ) : (
                  <div className="se-file-preview">
                    <IcoFile style={{ color: C.navy, flexShrink: 0 }} />
                    <span className="se-file-name">{archivo.name}</span>
                    <span className="se-file-size">{formatBytes(archivo.size)}</span>
                    <button type="button" className="se-file-remove" onClick={() => setArchivo(null)}>
                      <IcoX />
                    </button>
                  </div>
                )}

                {saving && archivo && (
                  <div className="se-progress">
                    <div className="se-progress-bar" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>

            </div>

            <div className="se-form-foot">
              <button type="button" className="se-btn se-btn-secondary" onClick={() => navigate('/parent/dashboard')}>
                Cancelar
              </button>
              <button
                type="submit"
                className="se-btn se-btn-primary"
                disabled={saving || hijos.length === 0}
              >
                {saving ? 'Enviando...' : <><IcoSend /> Enviar excusa</>}
              </button>
            </div>
          </form>
        </div>

        )}
      </main>

      {/* Toasts */}
      <div className="se-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`se-toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}
