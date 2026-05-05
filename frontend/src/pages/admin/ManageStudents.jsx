import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import IdentityBubble from '../../components/ui/IdentityBubble'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'
import {
  buildQrSvgMarkup,
  buildStudentQrPayload,
  createStudentQrToken,
} from '../../lib/qrAttendance'

/* ══════════════════════════════════
   ESTILOS
   ══════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ms-root {
    display: flex;
    min-height: 100vh;
    background: #EEF6FB;
    font-family: 'DM Sans', sans-serif;
    color: #102847;
  }

  /* SIDEBAR */
  .ms-sidebar {
    width: 240px; flex-shrink: 0;
    background: #102847;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100; overflow-y: auto;
  }
  .ms-sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(184,212,232,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .ms-sidebar-logo-icon {
    width: 36px; height: 36px; background: #1B3F6B;
    border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ms-sidebar-logo-text {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.3px;
  }
  .ms-sidebar-logo-text span { color: #B8D4E8; }
  .ms-sidebar-section { padding: 20px 12px 8px; }
  .ms-sidebar-section-label {
    font-size: 10px; font-weight: 700; color: rgba(184,212,232,0.4);
    text-transform: uppercase; letter-spacing: 0.1em; padding: 0 8px; margin-bottom: 6px;
  }
  .ms-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    transition: all 0.2s; border: none; background: none;
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; color: rgba(184,212,232,0.6); margin-bottom: 2px;
  }
  .ms-nav-item:hover { background: rgba(184,212,232,0.08); color: #fff; }
  .ms-nav-item.active { background: #1B3F6B; color: #fff; }
  .ms-nav-item svg { opacity: 0.6; flex-shrink: 0; }
  .ms-nav-item.active svg, .ms-nav-item:hover svg { opacity: 1; }
  .ms-sidebar-bottom {
    margin-top: auto; padding: 16px 12px;
    border-top: 1px solid rgba(184,212,232,0.1);
  }
  .ms-user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(184,212,232,0.06);
  }
  .ms-user-avatar {
    width: 32px; height: 32px; background: #1B3F6B;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #B8D4E8; flex-shrink: 0;
  }
  .ms-user-name { font-size: 13px; font-weight: 600; color: #fff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ms-user-role { font-size: 11px; color: rgba(184,212,232,0.5); }
  .ms-signout-btn {
    background: none; border: none; color: rgba(184,212,232,0.4);
    cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.2s; display: flex;
  }
  .ms-signout-btn:hover { color: #ef4444; }

  /* MAIN */
  .ms-main { margin-left: 240px; flex: 1; padding: 32px; }

  .ms-topbar {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
  }
  .ms-page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #102847; letter-spacing: -0.3px; }
  .ms-page-sub { font-size: 13px; color: #4A6A8A; margin-top: 2px; font-weight: 300; }

  .ms-btn-primary {
    background: #1B3F6B; color: #fff; border: none; border-radius: 10px;
    padding: 11px 20px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ms-btn-primary:hover { background: #2A5590; transform: translateY(-1px); }

  /* TOOLBAR */
  .ms-toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
  }

  .ms-search-wrap {
    position: relative; flex: 1; min-width: 200px;
  }
  .ms-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #8BBAD8; display: flex;
  }
  .ms-search {
    width: 100%; padding: 10px 12px 10px 38px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: #102847; background: #fff;
    border: 1.5px solid #C8DFF0; border-radius: 10px;
    outline: none; transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .ms-search:focus { border-color: #1B3F6B; }
  .ms-search::placeholder { color: #B8D4E8; }

  .ms-filter-select {
    padding: 10px 14px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; color: #102847;
    background: #fff; border: 1.5px solid #C8DFF0;
    border-radius: 10px; outline: none; cursor: pointer;
    transition: border-color 0.2s; appearance: none;
    padding-right: 32px;
  }
  .ms-filter-select:focus { border-color: #1B3F6B; }

  .ms-filter-wrap { position: relative; }
  .ms-filter-wrap::after {
    content: '▾'; position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%); color: #8BBAD8; pointer-events: none; font-size: 12px;
  }

  /* TABLE */
  .ms-table-wrap {
    background: #fff; border-radius: 16px;
    border: 1px solid #D8EAF4; overflow: hidden;
  }

  .ms-table { width: 100%; border-collapse: collapse; }

  .ms-table th {
    padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 700;
    color: #4A6A8A; text-transform: uppercase; letter-spacing: 0.06em;
    background: #F5FAFD; border-bottom: 1px solid #D8EAF4;
  }

  .ms-table td {
    padding: 14px 16px; font-size: 13px; color: #102847;
    border-bottom: 1px solid #EEF6FB;
    vertical-align: middle;
  }

  .ms-table tr:last-child td { border-bottom: none; }
  .ms-table tr:hover td { background: #F5FAFD; }

  .ms-student-name { font-weight: 600; }
  .ms-student-email { font-size: 12px; color: #4A6A8A; margin-top: 1px; }

  .ms-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: #EEF6FB; display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #1B3F6B; flex-shrink: 0;
  }

  .ms-badge {
    display: inline-block; padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 600;
    background: #EEF6FB; color: #1B3F6B;
    border: 1px solid #C8DFF0;
  }

  .ms-action-btn {
    background: none; border: none; cursor: pointer;
    padding: 6px; border-radius: 8px; transition: all 0.2s;
    display: inline-flex; align-items: center; justify-content: center;
    color: #4A6A8A;
  }
  .ms-action-btn:hover.edit { background: #EEF6FB; color: #1B3F6B; }
  .ms-action-btn:hover.qr   { background: #F0FDF4; color: #1B7A3D; }
  .ms-action-btn:hover.del  { background: #FEF2F2; color: #ef4444; }

  .ms-empty {
    text-align: center; padding: 48px 20px;
    color: #8BBAD8; font-size: 14px;
  }

  .ms-count {
    padding: 12px 16px; font-size: 12px; color: #4A6A8A;
    background: #F5FAFD; border-top: 1px solid #D8EAF4;
  }

  /* MODAL */
  .ms-modal-overlay {
    position: fixed; inset: 0; background: rgba(16,40,71,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 20px;
  }

  .ms-modal {
    background: #fff; border-radius: 20px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 80px rgba(16,40,71,0.2);
    animation: msFadeUp 0.3s ease-out both;
  }

  @keyframes msFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  .ms-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #EEF6FB;
    display: flex; align-items: center; justify-content: space-between;
  }

  .ms-modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #102847; }

  .ms-modal-close {
    background: none; border: none; cursor: pointer; color: #8BBAD8;
    padding: 4px; border-radius: 8px; transition: all 0.2s; display: flex;
    font-size: 20px; line-height: 1;
  }
  .ms-modal-close:hover { background: #EEF6FB; color: #102847; }

  .ms-modal-body { padding: 20px 24px; }
  .ms-modal-footer {
    padding: 16px 24px; border-top: 1px solid #EEF6FB;
    display: flex; justify-content: flex-end; gap: 10px;
  }

  .ms-field { margin-bottom: 16px; }
  .ms-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #4A6A8A; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
  }
  .ms-input {
    width: 100%; padding: 11px 14px; font-size: 14px;
    font-family: 'DM Sans', sans-serif; color: #102847;
    background: #F0F7FC; border: 1.5px solid #C8DFF0;
    border-radius: 10px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .ms-input::placeholder { color: #B8D4E8; }
  .ms-input:focus { border-color: #1B3F6B; box-shadow: 0 0 0 3px rgba(27,63,107,0.08); background: #fff; }
  .ms-select {
    width: 100%; padding: 11px 14px; font-size: 14px;
    font-family: 'DM Sans', sans-serif; color: #102847;
    background: #F0F7FC; border: 1.5px solid #C8DFF0;
    border-radius: 10px; outline: none; appearance: none; cursor: pointer;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .ms-select:focus { border-color: #1B3F6B; }

  .ms-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .ms-btn-cancel {
    background: transparent; color: #4A6A8A;
    border: 1.5px solid #C8DFF0; border-radius: 10px;
    padding: 10px 20px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .ms-btn-cancel:hover { border-color: #1B3F6B; color: #1B3F6B; }

  .ms-btn-danger {
    background: #ef4444; color: #fff; border: none; border-radius: 10px;
    padding: 10px 20px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s;
  }
  .ms-btn-danger:hover { background: #dc2626; }

  /* QR MODAL */
  .ms-qr-wrap {
    display: flex; flex-direction: column; align-items: center;
    padding: 24px; gap: 16px;
  }

  .ms-qr-box {
    background: #fff; border: 2px solid #D8EAF4;
    border-radius: 16px; padding: 20px;
    display: flex; align-items: center; justify-content: center;
  }

  .ms-qr-info { text-align: center; }
  .ms-qr-name { font-size: 18px; font-weight: 700; color: #102847; margin-bottom: 4px; font-family: 'Playfair Display', serif; }
  .ms-qr-mat  { font-size: 13px; color: #4A6A8A; }

  @keyframes msSpin { to { transform: rotate(360deg); } }
  .ms-spin { animation: msSpin 0.8s linear infinite; display: inline-block; }

  .ms-loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: #8BBAD8; font-size: 14px; gap: 8px; }
`

/* ══════════════════════════════════
   ICONOS
   ══════════════════════════════════ */
const IcoDash     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IcoStudents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoTeacher  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IcoParents  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoExcuse   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
const IcoSetup    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
const IcoLogout   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoSearch   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IcoPlus     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
const IcoEdit     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IcoQR       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M17 14h3M14 17h6M17 20h3"/></svg>

function RealQRCode({ value, size = 200 }) {
  let markup = ''

  try {
    markup = buildQrSvgMarkup(value, size)
  } catch (error) {
    console.error('Error generating QR markup:', error)
  }

  if (!markup) {
    return (
      <div style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        textAlign: 'center',
        color: '#b45309',
        fontSize: 12,
        background: '#fff7ed',
        borderRadius: 12,
        border: '1px solid #fdba74',
        boxSizing: 'border-box',
      }}>
        No se pudo generar el QR.
      </div>
    )
  }

  return (
    <div
      style={{ width: size, height: size, display: 'inline-block' }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

function maskQrPreview(value = '') {
  if (!value) return 'QR protegido'
  if (value.length <= 18) return `${value.slice(0, 8)}••••`
  return `${value.slice(0, 10)}••••${value.slice(-6)}`
}

/* ══════════════════════════════════
   SIDEBAR
   ══════════════════════════════════ */
function Sidebar({ profile, onSignOut }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard',     path: '/admin/dashboard', Icon: IcoDash    },
    { label: 'Estudiantes',   path: '/admin/students',  Icon: IcoStudents},
    { label: 'Docentes',      path: '/admin/teachers',  Icon: IcoTeacher },
    { label: 'Padres',        path: '/admin/parents',   Icon: IcoParents },
    { label: 'Excusas',       path: '/admin/excuses',   Icon: IcoExcuse  },
    { label: 'Centro', path: '/admin/center',     Icon: IcoSetup   },
  ]

  return (
    <div className="ms-sidebar">
      <div className="ms-sidebar-logo">
        <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" />
      </div>
      <div className="ms-sidebar-section">
        <div className="ms-sidebar-section-label">Menú principal</div>
        {navItems.map(item => (
          <button key={item.path}
            className={`ms-nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}>
            <item.Icon />{item.label}
          </button>
        ))}
      </div>
      <div className="ms-sidebar-bottom">
        <AdminSidebarProfileCard
          profile={profile}
          roleLabel="Director"
          onSignOut={onSignOut}
          LogoutIcon={IcoLogout}
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   FORMULARIO DE ESTUDIANTE
   ══════════════════════════════════ */
function StudentForm({ student, secciones, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    nombre:           student?.nombre    ?? '',
    matricula:        student?.matricula ?? '',
    grade_section_id: student?.grade_section_id ?? '',
  })

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="ms-modal-overlay" onClick={onClose}>
      <div className="ms-modal" onClick={e => e.stopPropagation()}>
        <div className="ms-modal-header">
          <div className="ms-modal-title">{student ? 'Editar estudiante' : 'Nuevo estudiante'}</div>
          <button className="ms-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ms-modal-body">
          <div className="ms-field">
            <label className="ms-label">Nombre completo *</label>
            <input className="ms-input" placeholder="Nombre del estudiante"
              value={form.nombre} onChange={e => upd('nombre', e.target.value)}/>
          </div>
          <div className="ms-field">
            <label className="ms-label">Matrícula *</label>
            <input className="ms-input" placeholder="Ej: 2024-0001"
              value={form.matricula} onChange={e => upd('matricula', e.target.value)}/>
          </div>
          <div className="ms-field">
            <label className="ms-label">Grado y sección *</label>
            <select className="ms-select" value={form.grade_section_id}
              onChange={e => upd('grade_section_id', e.target.value)}>
              <option value="">Seleccionar sección</option>
              {secciones.map(s => (
                <option key={s.id} value={s.id}>
                  {s.grado} {s.seccion} — {s.turno === 'manana' ? 'Mañana' : s.turno === 'tarde' ? 'Tarde' : 'Noche'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="ms-modal-footer">
          <button className="ms-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="ms-btn-primary"
            onClick={() => onSave(form)}
            disabled={loading || !form.nombre || !form.matricula || !form.grade_section_id}>
            {loading ? <><span className="ms-spin">⟳</span> Guardando...</> : 'Guardar estudiante'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   MODAL QR
   ══════════════════════════════════ */
function QRModal({ student, onClose, onStudentUpdated }) {
  const [currentStudent, setCurrentStudent] = useState(student)
  const [preparing, setPreparing] = useState(false)
  const [warning, setWarning] = useState('')
  const displayStudent = currentStudent || student

  async function ensureQrToken(targetStudent = displayStudent, force = false) {
    if (!targetStudent?.id) return null
    if (!force && targetStudent?.qr_token) return targetStudent.qr_token

    setPreparing(true)
    setWarning('')

    const nextToken = createStudentQrToken()
    const { data, error } = await supabase
      .from('students')
      .update({
        qr_token: nextToken,
        qr_token_updated_at: new Date().toISOString(),
      })
      .eq('id', targetStudent.id)
      .select('*, grade_sections(grado, seccion, turno)')
      .single()

    setPreparing(false)

    if (error) {
      console.error(error)
      setWarning('No se pudo guardar el token QR seguro. Ejecuta la migración nueva para habilitar reemisión segura.')
      return targetStudent?.matricula || null
    }

    setCurrentStudent(data || targetStudent)
    onStudentUpdated?.(data || targetStudent)
    return data?.qr_token || nextToken
  }

  useEffect(() => {
    if (student && !student.qr_token) {
      ensureQrToken(student)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id])

  if (!displayStudent) return null

  const qrValue = buildStudentQrPayload(displayStudent)

  const handlePrint = () => {
    const qrSvg = buildQrSvgMarkup(qrValue, 320)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
      <head>
        <title>QR - ${displayStudent.nombre}</title>
      </head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#102847;">
        <h2 style="margin-bottom:8px;">${displayStudent.nombre}</h2>
        <p style="margin:0 0 8px;">Matrícula: ${displayStudent.matricula}</p>
        <p style="margin:0 0 16px;font-size:12px;color:#4A6A8A;">El estado y la hora se muestran al momento del escaneo.</p>
        <div>${qrSvg}</div>
        <script>window.print()</script>
      </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="ms-modal-overlay" onClick={onClose}>
      <div className="ms-modal" style={{maxWidth:460}} onClick={e => e.stopPropagation()}>
        <div className="ms-modal-header">
          <div className="ms-modal-title">Código QR</div>
          <button className="ms-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="ms-qr-wrap">
          <div className="ms-qr-box">
            {qrValue ? <RealQRCode value={qrValue} size={260} /> : <div style={{ color: '#8BBAD8', fontSize: 12 }}>Preparando QR...</div>}
          </div>
          <div className="ms-qr-info">
            <div className="ms-qr-name">{displayStudent.nombre}</div>
            <div className="ms-qr-mat">Matrícula: {displayStudent.matricula}</div>
            <div style={{ fontSize: 12, color: '#4A6A8A', marginTop: 8 }}>
              {displayStudent.qr_token ? 'QR seguro activo' : 'QR en modo legacy hasta aplicar la migración'}
            </div>
            <div style={{fontSize:10, color:'#8BBAD8', marginTop:4, fontFamily:'monospace'}}>
              {maskQrPreview(qrValue)}
            </div>
            {warning && (
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 10, lineHeight: 1.5 }}>
                {warning}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gap: 10, width: '100%' }}>
            <button
              className="ms-btn-primary"
              style={{width:'100%', justifyContent:'center'}}
              onClick={() => ensureQrToken(displayStudent, true)}
              disabled={preparing}
            >
              {preparing ? 'Reemitiendo...' : 'Reemitir QR'}
            </button>
            <button className="ms-btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={handlePrint} disabled={!qrValue}>
            Imprimir QR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   PÁGINA PRINCIPAL
   ══════════════════════════════════ */
export default function ManageStudents() {
  const navigate = useNavigate()
  const { profile, activeSchoolId, signOut } = useAuth()

  const [students, setStudents]   = useState([])
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  const [search, setSearch]         = useState('')
  const [filterGrado, setFilterGrado] = useState('')
  const [filterTurno, setFilterTurno] = useState('')

  const [showForm, setShowForm]     = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [qrStudent, setQrStudent]   = useState(null)
  const [deleteStudent, setDeleteStudent] = useState(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchoolId])

  const loadData = async () => {
    if (!activeSchoolId) {
      setStudents([])
      setSecciones([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [{ data: allStudents }, { data: secs }] = await Promise.all([
        supabase.from('students').select('*, grade_sections(grado, seccion, turno)').order('nombre'),
        supabase.from('grade_sections').select('*').eq('school_id', activeSchoolId).order('grado').order('seccion'),
      ])

      const scopedSectionIds = new Set((secs ?? []).map(section => section.id))
      const scopedStudents = (allStudents ?? []).filter(student =>
        student.grade_section_id && scopedSectionIds.has(student.grade_section_id)
      )

      setStudents(scopedStudents)
      setSecciones(secs ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const normalizedName = String(form.nombre || '').trim()
      const normalizedMatricula = String(form.matricula || '').trim()
      const normalizedSectionId = String(form.grade_section_id || '').trim()

      if (!normalizedName || !normalizedMatricula || !normalizedSectionId) {
        throw new Error('Nombre, matricula y seccion son obligatorios.')
      }

      const duplicateStudent = students.find(student =>
        student.id !== editStudent?.id &&
        String(student.matricula || '').trim().toLowerCase() === normalizedMatricula.toLowerCase()
      )

      if (duplicateStudent) {
        throw new Error('Ya existe un estudiante con esa matricula.')
      }

      if (editStudent) {
        const { error } = await supabase.from('students').update({
          nombre: normalizedName,
          matricula: normalizedMatricula,
          grade_section_id: normalizedSectionId,
        }).eq('id', editStudent.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('students').insert({
          nombre: normalizedName,
          matricula: normalizedMatricula,
          grade_section_id: normalizedSectionId,
        })
        if (error) throw error
      }
      setShowForm(false)
      setEditStudent(null)
      await loadData()
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteStudent) return
    try {
      const { error } = await supabase.from('students').delete().eq('id', deleteStudent.id)
      if (error) throw error
      setDeleteStudent(null)
      await loadData()
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const handleStudentQrUpdated = updatedStudent => {
    if (!updatedStudent?.id) return
    setStudents(prev => prev.map(student => student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student))
    setQrStudent(updatedStudent)
  }

  const openQrModal = (event, student) => {
    event.preventDefault()
    event.stopPropagation()
    setQrStudent(student)
  }

  const openEditModal = (event, student) => {
    event.preventDefault()
    event.stopPropagation()
    setEditStudent(student)
    setShowForm(true)
  }

  const openDeleteModal = (event, student) => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteStudent(student)
  }

  // Filtrado
  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      s.matricula?.toLowerCase().includes(search.toLowerCase())
    const matchGrado = !filterGrado || s.grade_sections?.grado === filterGrado
    const matchTurno = !filterTurno || s.grade_sections?.turno === filterTurno
    return matchSearch && matchGrado && matchTurno
  })

  const gradosUnicos = [...new Set(secciones.map(s => s.grado))]

  return (
    <>
      <style>{styles}</style>
      <div className="ms-root">
        <Sidebar profile={profile} onSignOut={handleSignOut} />

        <main className="ms-main">
          <div className="ms-topbar">
            <div>
              <div className="ms-page-title">Estudiantes</div>
              <div className="ms-page-sub">{students.length} estudiante{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}</div>
            </div>
            <button className="ms-btn-primary" onClick={() => { setEditStudent(null); setShowForm(true) }}>
              <IcoPlus /> Nuevo estudiante
            </button>
          </div>

          {/* Toolbar */}
          <div className="ms-toolbar">
            <div className="ms-search-wrap">
              <span className="ms-search-icon"><IcoSearch /></span>
              <input className="ms-search" placeholder="Buscar por nombre o matrícula..."
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="ms-filter-wrap">
              <select className="ms-filter-select" value={filterGrado} onChange={e => setFilterGrado(e.target.value)}>
                <option value="">Todos los grados</option>
                {gradosUnicos.map(g => <option key={g} value={g}>{g} Grado</option>)}
              </select>
            </div>
            <div className="ms-filter-wrap">
              <select className="ms-filter-select" value={filterTurno} onChange={e => setFilterTurno(e.target.value)}>
                <option value="">Todos los turnos</option>
                <option value="manana">Mañana</option>
                <option value="tarde">Tarde</option>
                <option value="noche">Noche</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="ms-table-wrap">
            {loading ? (
              <div className="ms-loading"><span className="ms-spin">⟳</span> Cargando estudiantes...</div>
            ) : (
              <>
                <table className="ms-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Matrícula</th>
                      <th>Grado / Sección</th>
                      <th>Turno</th>
                      <th style={{textAlign:'right'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="ms-empty">
                            {search || filterGrado || filterTurno
                              ? 'No se encontraron estudiantes con esos filtros'
                              : 'No hay estudiantes registrados. ¡Agrega el primero!'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map(s => (
                        <tr key={s.id}>
                          <td>
                            <IdentityBubble
                              compact
                              tone="blue"
                              name={s.nombre}
                              subtitle={s.grade_sections ? `${s.grade_sections.grado} ${s.grade_sections.seccion}` : 'Sin seccion asignada'}
                              meta={s.activo === false ? 'Inactivo' : 'Estudiante activo'}
                            />
                          </td>
                          <td style={{fontFamily:'monospace', fontSize:13}}>{s.matricula}</td>
                          <td>
                            {s.grade_sections
                              ? <span className="ms-badge">{s.grade_sections.grado} {s.grade_sections.seccion}</span>
                              : <span style={{color:'#8BBAD8', fontSize:12}}>Sin asignar</span>
                            }
                          </td>
                          <td style={{color:'#4A6A8A', fontSize:13}}>
                            {s.grade_sections?.turno === 'manana' ? '🌅 Mañana'
                              : s.grade_sections?.turno === 'tarde' ? '🌇 Tarde'
                              : s.grade_sections?.turno === 'noche' ? '🌙 Noche'
                              : '—'}
                          </td>
                          <td className="ms-action-cell">
                            <div className="ms-action-group">
                              <button
                                type="button"
                                className="ms-action-btn qr"
                                title="Ver QR"
                                aria-label={`Ver QR de ${s.nombre}`}
                                onClick={event => openQrModal(event, s)}
                              >
                                <IcoQR />
                                <span>QR</span>
                              </button>
                              <button
                                type="button"
                                className="ms-action-btn edit"
                                title="Editar"
                                aria-label={`Editar ${s.nombre}`}
                                onClick={event => openEditModal(event, s)}
                              >
                                <IcoEdit />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                className="ms-action-btn del"
                                title="Eliminar"
                                aria-label={`Eliminar ${s.nombre}`}
                                onClick={event => openDeleteModal(event, s)}
                              >
                                <IcoTrash />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {filtered.length > 0 && (
                  <div className="ms-count">
                    Mostrando {filtered.length} de {students.length} estudiantes
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Modal formulario */}
        {showForm && (
          <StudentForm
            student={editStudent}
            secciones={secciones}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditStudent(null) }}
            loading={saving}
          />
        )}

        {/* Modal QR */}
        {qrStudent && (
          <QRModal
            student={qrStudent}
            onClose={() => setQrStudent(null)}
            onStudentUpdated={handleStudentQrUpdated}
          />
        )}

        {/* Modal confirmar eliminar */}
        {deleteStudent && (
          <div className="ms-modal-overlay" onClick={() => setDeleteStudent(null)}>
            <div className="ms-modal" style={{maxWidth:400}} onClick={e => e.stopPropagation()}>
              <div className="ms-modal-header">
                <div className="ms-modal-title">Eliminar estudiante</div>
                <button className="ms-modal-close" onClick={() => setDeleteStudent(null)}>×</button>
              </div>
              <div className="ms-modal-body">
                <p style={{fontSize:14, color:'#4A6A8A', lineHeight:1.6}}>
                  ¿Estás seguro que deseas eliminar a <strong style={{color:'#102847'}}>{deleteStudent.nombre}</strong>?
                  Esta acción no se puede deshacer y también eliminará sus registros de asistencia.
                </p>
              </div>
              <div className="ms-modal-footer">
                <button className="ms-btn-cancel" onClick={() => setDeleteStudent(null)}>Cancelar</button>
                <button className="ms-btn-danger" onClick={handleDelete}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
