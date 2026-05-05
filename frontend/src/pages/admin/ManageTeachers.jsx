import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import IdentityBubble from '../../components/ui/IdentityBubble'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'
import { createManagedUser, fetchManagedUsers } from '../../api/backendApi'
import {
  MAX_EMAIL_LENGTH,
  formatDominicanPhone,
  normalizeEmail,
  validateDominicanPhone,
  validateEmail,
} from '../../utils/formValidation'

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ESTILOS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .mt-root {
    display: flex; min-height: 100vh;
    background: #EEF6FB; font-family: 'DM Sans', sans-serif; color: #102847;
  }

  /* SIDEBAR */
  .mt-sidebar {
    width: 240px; flex-shrink: 0; background: #102847;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow-y: auto;
  }
  .mt-sidebar-logo {
    padding: 24px 20px 20px; border-bottom: 1px solid rgba(184,212,232,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .mt-sidebar-logo-icon {
    width: 36px; height: 36px; background: #1B3F6B;
    border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .mt-sidebar-logo-text { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #fff; }
  .mt-sidebar-logo-text span { color: #B8D4E8; }
  .mt-sidebar-section { padding: 20px 12px 8px; }
  .mt-sidebar-section-label {
    font-size: 10px; font-weight: 700; color: rgba(184,212,232,0.4);
    text-transform: uppercase; letter-spacing: 0.1em; padding: 0 8px; margin-bottom: 6px;
  }
  .mt-nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 10px; cursor: pointer; transition: all 0.2s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: rgba(184,212,232,0.6); margin-bottom: 2px;
  }
  .mt-nav-item:hover { background: rgba(184,212,232,0.08); color: #fff; }
  .mt-nav-item.active { background: #1B3F6B; color: #fff; }
  .mt-nav-item svg { opacity: 0.6; flex-shrink: 0; }
  .mt-nav-item.active svg, .mt-nav-item:hover svg { opacity: 1; }
  .mt-sidebar-bottom { margin-top: auto; padding: 16px 12px; border-top: 1px solid rgba(184,212,232,0.1); }
  .mt-user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(184,212,232,0.06); }
  .mt-user-avatar { width: 32px; height: 32px; background: #1B3F6B; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #B8D4E8; flex-shrink: 0; }
  .mt-user-name { font-size: 13px; font-weight: 600; color: #fff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mt-user-role { font-size: 11px; color: rgba(184,212,232,0.5); }
  .mt-signout-btn { background: none; border: none; color: rgba(184,212,232,0.4); cursor: pointer; padding: 4px; border-radius: 6px; transition: color 0.2s; display: flex; }
  .mt-signout-btn:hover { color: #ef4444; }

  /* MAIN */
  .mt-main { margin-left: 240px; flex: 1; padding: 32px; }
  .mt-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .mt-page-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #102847; letter-spacing: -0.3px; }
  .mt-page-sub { font-size: 13px; color: #4A6A8A; margin-top: 2px; font-weight: 300; }

  .mt-btn-primary {
    background: #1B3F6B; color: #fff; border: none; border-radius: 10px;
    padding: 11px 20px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .mt-btn-primary:hover { background: #2A5590; transform: translateY(-1px); }
  .mt-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* TOOLBAR */
  .mt-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .mt-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .mt-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #8BBAD8; display: flex; }
  .mt-search {
    width: 100%; padding: 10px 12px 10px 38px; font-size: 14px;
    font-family: 'DM Sans', sans-serif; color: #102847; background: #fff;
    border: 1.5px solid #C8DFF0; border-radius: 10px; outline: none;
    transition: border-color 0.2s; box-sizing: border-box;
  }
  .mt-search:focus { border-color: #1B3F6B; }
  .mt-search::placeholder { color: #B8D4E8; }
  .mt-filter-wrap { position: relative; }
  .mt-filter-wrap::after { content: 'v'; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #8BBAD8; pointer-events: none; font-size: 12px; font-weight: 700; }
  .mt-filter-select {
    padding: 10px 32px 10px 14px; font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; color: #102847; background: #fff;
    border: 1.5px solid #C8DFF0; border-radius: 10px; outline: none;
    cursor: pointer; transition: border-color 0.2s; appearance: none;
  }
  .mt-filter-select:focus { border-color: #1B3F6B; }

  /* TABLE */
  .mt-table-wrap { background: #fff; border-radius: 16px; border: 1px solid #D8EAF4; overflow: hidden; }
  .mt-table { width: 100%; border-collapse: collapse; }
  .mt-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #4A6A8A; text-transform: uppercase; letter-spacing: 0.06em; background: #F5FAFD; border-bottom: 1px solid #D8EAF4; }
  .mt-table td { padding: 14px 16px; font-size: 13px; color: #102847; border-bottom: 1px solid #EEF6FB; vertical-align: middle; }
  .mt-table tr:last-child td { border-bottom: none; }
  .mt-table tr:hover td { background: #F5FAFD; }

  .mt-avatar { width: 36px; height: 36px; border-radius: 50%; background: #EEF6FB; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #1B3F6B; flex-shrink: 0; }
  .mt-name { font-weight: 600; }
  .mt-email { font-size: 12px; color: #4A6A8A; margin-top: 1px; }

  .mt-badge {
    display: inline-block; padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 600;
  }
  .mt-badge.pasar   { background: #EEF6FB; color: #1B3F6B; border: 1px solid #C8DFF0; }
  .mt-badge.reportes { background: #F0FDF4; color: #1B7A3D; border: 1px solid #bbf7d0; }
  .mt-badge.editar  { background: #FEF3C7; color: #92400E; border: 1px solid #fcd34d; }
  .mt-badge.admin   { background: #102847; color: #B8D4E8; border: 1px solid #1B3F6B; }

  .mt-action-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; color: #4A6A8A; }
  .mt-action-btn:hover.edit { background: #EEF6FB; color: #1B3F6B; }
  .mt-action-btn:hover.del  { background: #FEF2F2; color: #ef4444; }

  .mt-empty { text-align: center; padding: 48px 20px; color: #8BBAD8; font-size: 14px; }
  .mt-count { padding: 12px 16px; font-size: 12px; color: #4A6A8A; background: #F5FAFD; border-top: 1px solid #D8EAF4; }

  /* MODAL */
  .mt-modal-overlay { position: fixed; inset: 0; background: rgba(16,40,71,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .mt-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(16,40,71,0.2); animation: mtFadeUp 0.3s ease-out both; }
  @keyframes mtFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .mt-modal-header { padding: 20px 24px 16px; border-bottom: 1px solid #EEF6FB; display: flex; align-items: center; justify-content: space-between; }
  .mt-modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #102847; }
  .mt-modal-close { background: none; border: none; cursor: pointer; color: #8BBAD8; padding: 4px; border-radius: 8px; transition: all 0.2s; display: flex; font-size: 20px; line-height: 1; }
  .mt-modal-close:hover { background: #EEF6FB; color: #102847; }
  .mt-modal-body { padding: 20px 24px; }
  .mt-modal-footer { padding: 16px 24px; border-top: 1px solid #EEF6FB; display: flex; justify-content: flex-end; gap: 10px; }

  .mt-field { margin-bottom: 16px; }
  .mt-label { display: block; font-size: 11px; font-weight: 700; color: #4A6A8A; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .mt-input { width: 100%; padding: 11px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #102847; background: #F0F7FC; border: 1.5px solid #C8DFF0; border-radius: 10px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
  .mt-input::placeholder { color: #B8D4E8; }
  .mt-input:focus { border-color: #1B3F6B; box-shadow: 0 0 0 3px rgba(27,63,107,0.08); background: #fff; }
  .mt-input.invalid { border-color: #ef4444; background: #fff7f7; }
  .mt-field-error { color: #dc2626; font-size: 11px; line-height: 1.4; margin-top: 6px; }
  .mt-field-help { color: #4A6A8A; font-size: 11px; line-height: 1.45; margin-top: 6px; }
  .mt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* PERMISOS */
  .mt-perms { display: flex; flex-direction: column; gap: 10px; }
  .mt-perm-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 10px;
    border: 1.5px solid #C8DFF0; background: #F5FAFD;
    cursor: pointer; transition: all 0.2s;
  }
  .mt-perm-item.checked { border-color: #1B3F6B; background: #EEF6FB; }
  .mt-perm-check { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #C8DFF0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
  .mt-perm-item.checked .mt-perm-check { background: #1B3F6B; border-color: #1B3F6B; }
  .mt-perm-label { font-size: 13px; font-weight: 600; color: #102847; }
  .mt-perm-desc  { font-size: 11px; color: #4A6A8A; margin-top: 1px; }

  .mt-btn-cancel { background: transparent; color: #4A6A8A; border: 1.5px solid #C8DFF0; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .mt-btn-cancel:hover { border-color: #1B3F6B; color: #1B3F6B; }
  .mt-btn-danger { background: #ef4444; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
  .mt-btn-danger:hover { background: #dc2626; }
  .mt-btn-ghost { background: #fff; color: #1B3F6B; border: 1.5px solid #C8DFF0; border-radius: 10px; padding: 10px 18px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .mt-btn-ghost:hover { background: #EEF6FB; border-color: #1B3F6B; }
  .mt-credential-card { border: 1px solid #C8DFF0; border-radius: 16px; background: linear-gradient(180deg, #F5FAFD, #FFFFFF); padding: 16px; display: grid; gap: 12px; }
  .mt-credential-row { display: grid; gap: 5px; }
  .mt-credential-label { font-size: 10px; font-weight: 800; color: #4A6A8A; text-transform: uppercase; letter-spacing: .09em; }
  .mt-credential-value { padding: 12px 14px; border-radius: 12px; background: #102847; color: #fff; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 15px; font-weight: 800; letter-spacing: .04em; word-break: break-all; }
  .mt-credential-value.email { background: #EEF6FB; color: #102847; font-family: 'DM Sans', sans-serif; font-weight: 700; letter-spacing: 0; }
  .mt-credential-note { color: #4A6A8A; font-size: 12px; line-height: 1.5; margin: 0; }

  .mt-loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: #8BBAD8; font-size: 14px; gap: 8px; }
  @keyframes mtSpin { to { transform: rotate(360deg); } }
  .mt-spin { animation: mtSpin 0.8s linear infinite; display: inline-block; }

  .mt-section-label { font-size: 12px; font-weight: 700; color: #1B3F6B; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px; margin-top: 4px; }
`

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ICONOS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
const IcoCheck    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>

const PERMISOS = [
  { id: 'pasar_asistencia', label: 'Pasar asistencia', desc: 'Escanear QR y registrar entrada/salida de estudiantes' },
  { id: 'ver_reportes',     label: 'Ver reportes',     desc: 'Acceder a reportes de asistencia de sus secciones' },
  { id: 'editar_matricula', label: 'Editar matricula', desc: 'Modificar datos de matricula de estudiantes' },
  { id: 'aprobar_excusas',  label: 'Aprobar excusas',  desc: 'Revisar y aprobar o rechazar justificaciones' },
]

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SIDEBAR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
    <div className="mt-sidebar">
      <div className="mt-sidebar-logo">
        <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" />
      </div>
      <div className="mt-sidebar-section">
        <div className="mt-sidebar-section-label">Menu principal</div>
        {navItems.map(item => (
          <button key={item.path}
            className={`mt-nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}>
            <item.Icon />{item.label}
          </button>
        ))}
      </div>
      <div className="mt-sidebar-bottom">
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FORMULARIO DOCENTE
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TeacherForm({ teacher, secciones, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    full_name: teacher?.full_name ?? '',
    email:     teacher?.email     ?? '',
    phone:     formatDominicanPhone(teacher?.phone ?? ''),
    margen_tardanza_minutos: teacher?.margen_tardanza_minutos ?? 30,
    permisos:  teacher?.permisos  ?? ['pasar_asistencia', 'ver_reportes', 'aprobar_excusas'],
    secciones_ids: teacher?.secciones_ids ?? [],
  })
  const [errors, setErrors] = useState({})

  const upd = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const submitForm = () => {
    const nextForm = {
      ...form,
      full_name: form.full_name.trim(),
      email: normalizeEmail(form.email),
      phone: formatDominicanPhone(form.phone),
      margen_tardanza_minutos: Number(form.margen_tardanza_minutos) || 0,
    }
    const nextErrors = {
      full_name: nextForm.full_name ? '' : 'El nombre completo es obligatorio.',
      email: validateEmail(nextForm.email, 'correo electronico'),
      phone: validateDominicanPhone(nextForm.phone),
      margen_tardanza_minutos:
        nextForm.margen_tardanza_minutos < 0 || nextForm.margen_tardanza_minutos > 180
          ? 'El margen debe estar entre 0 y 180 minutos.'
          : '',
    }

    setForm(nextForm)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) return
    onSave(nextForm)
  }

  const togglePerm = (id) => {
    setForm(p => ({
      ...p,
      permisos: p.permisos.includes(id)
        ? p.permisos.filter(x => x !== id)
        : [...p.permisos, id]
    }))
  }

  const toggleSeccion = (id) => {
    setForm(p => ({
      ...p,
      secciones_ids: p.secciones_ids.includes(id)
        ? p.secciones_ids.filter(x => x !== id)
        : [...p.secciones_ids, id]
    }))
  }

  return (
    <div className="mt-modal-overlay" onClick={onClose}>
      <div className="mt-modal" onClick={e => e.stopPropagation()}>
        <div className="mt-modal-header">
          <div className="mt-modal-title">{teacher ? 'Editar docente' : 'Nuevo docente'}</div>
          <button type="button" aria-label="Cerrar modal" className="mt-modal-close" onClick={onClose}>x</button>
        </div>
        <div className="mt-modal-body">
          <div className="mt-field">
            <label className="mt-label">Nombre completo *</label>
            <input className={`mt-input${errors.full_name ? ' invalid' : ''}`} placeholder="Nombre del docente"
              maxLength={90}
              value={form.full_name} onChange={e => upd('full_name', e.target.value)}/>
            {errors.full_name && <div className="mt-field-error">{errors.full_name}</div>}
          </div>
          <div className="mt-grid-2">
            <div className="mt-field">
              <label className="mt-label">Correo electronico *</label>
              <input className={`mt-input${errors.email ? ' invalid' : ''}`} type="email" placeholder="correo@escuela.edu"
                autoComplete="email"
                maxLength={MAX_EMAIL_LENGTH}
                value={form.email} onChange={e => upd('email', e.target.value)}/>
              {errors.email && <div className="mt-field-error">{errors.email}</div>}
            </div>
            <div className="mt-field">
              <label className="mt-label">Telefono</label>
              <input className={`mt-input${errors.phone ? ' invalid' : ''}`} placeholder="809-000-0000"
                autoComplete="tel"
                inputMode="tel"
                maxLength={12}
                value={form.phone} onChange={e => upd('phone', formatDominicanPhone(e.target.value))}/>
              {errors.phone && <div className="mt-field-error">{errors.phone}</div>}
            </div>
          </div>

          <div className="mt-field">
            <label className="mt-label">Margen de tardanza (minutos)</label>
            <input
              className="mt-input"
              type="number"
              min="0"
              max="180"
              value={form.margen_tardanza_minutos}
              onChange={e => upd('margen_tardanza_minutos', Math.max(0, Number(e.target.value || 0)))}
            />
            {errors.margen_tardanza_minutos && <div className="mt-field-error">{errors.margen_tardanza_minutos}</div>}
            <div className="mt-field-help">
              El sistema sumara este margen a la hora oficial de entrada para decidir si el estudiante llego a tiempo o con tardanza.
            </div>
          </div>

          <div className="mt-field">
            <div className="mt-section-label">Permisos del sistema</div>
            <div className="mt-perms">
              {PERMISOS.map(p => (
                <div key={p.id}
                  className={`mt-perm-item${form.permisos.includes(p.id) ? ' checked' : ''}`}
                  onClick={() => togglePerm(p.id)}>
                  <div className="mt-perm-check">
                    {form.permisos.includes(p.id) && <IcoCheck />}
                  </div>
                  <div>
                    <div className="mt-perm-label">{p.label}</div>
                    <div className="mt-perm-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-field">
            <div className="mt-section-label">Secciones asignadas</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {secciones.map(s => (
                <div key={s.id}
                  onClick={() => toggleSeccion(s.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                    background: form.secciones_ids.includes(s.id) ? '#1B3F6B' : '#EEF6FB',
                    color: form.secciones_ids.includes(s.id) ? '#fff' : '#1B3F6B',
                    border: `1.5px solid ${form.secciones_ids.includes(s.id) ? '#1B3F6B' : '#C8DFF0'}`,
                  }}>
                  {s.grado} {s.seccion}
                </div>
              ))}
              {secciones.length === 0 && (
                <span style={{fontSize:12, color:'#8BBAD8', fontStyle:'italic'}}>
                No hay secciones creadas todavia. Ve al modulo Centro primero.
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-modal-footer">
          <button className="mt-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="mt-btn-primary"
            onClick={submitForm}
            disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar docente'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PÃGINA PRINCIPAL
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function ManageTeachers() {
  const navigate = useNavigate()
  const { profile, activeSchoolId, signOut } = useAuth()

  const [teachers, setTeachers]   = useState([])
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  const [search, setSearch]       = useState('')
  const [filterPerm, setFilterPerm] = useState('')

  const [showForm, setShowForm]       = useState(false)
  const [editTeacher, setEditTeacher] = useState(null)
  const [deleteTeacher, setDeleteTeacher] = useState(null)
  const [createdTeacherAccess, setCreatedTeacherAccess] = useState(null)
  const [copiedAccess, setCopiedAccess] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchoolId])

  const loadData = async () => {
    if (!activeSchoolId) {
      setTeachers([])
      setSecciones([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [managedUsers, { data: secs }] = await Promise.all([
        fetchManagedUsers({ role: 'teacher' }),
        supabase.from('grade_sections').select('*').eq('school_id', activeSchoolId).order('grado').order('seccion'),
      ])

      const scopedSectionIds = new Set((secs ?? []).map(section => section.id))
      const scopedTeachers = (managedUsers.users ?? []).filter(teacher =>
        teacher.approval_status !== 'rejected' &&
        (
          teacher.school_id === activeSchoolId ||
          (teacher.secciones_ids ?? []).some(sectionId => scopedSectionIds.has(sectionId))
        )
      )

      setTeachers(scopedTeachers)
      setSecciones(secs ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editTeacher) {
        // Actualizar perfil existente
        const payload = {
          full_name: form.full_name,
          phone:     form.phone,
          margen_tardanza_minutos: Number(form.margen_tardanza_minutos) || 0,
          permisos:  form.permisos,
          secciones_ids: form.secciones_ids,
        }

        let { error } = await supabase.from('profiles').update(payload).eq('id', editTeacher.id)
        if (error?.message?.includes('margen_tardanza_minutos')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.margen_tardanza_minutos
          const retry = await supabase.from('profiles').update(fallbackPayload).eq('id', editTeacher.id)
          error = retry.error
          if (!error) {
            alert('El docente se guardo, pero falta aplicar la migracion para usar el margen de tardanza personalizado.')
          }
        }
        if (error) throw error
      } else {
        const response = await createManagedUser({
          role: 'teacher',
          school_id: activeSchoolId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          permisos: form.permisos,
          secciones_ids: form.secciones_ids,
          margen_tardanza_minutos: Number(form.margen_tardanza_minutos) || 30,
        })
        setCopiedAccess(false)
        setCreatedTeacherAccess({
          name: form.full_name,
          email: form.email,
          password: response.generated_password,
        })
        setShowForm(false)
        setEditTeacher(null)
        await loadData()
      }
      setShowForm(false)
      setEditTeacher(null)
      await loadData()
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const removeMissingColumnFromPayload = (payload, error) => {
    const message = String(error?.message || '')
    const match = message.match(/'([^']+)' column|column profiles\.([a-zA-Z0-9_]+) does not exist/i)
    const column = match?.[1] || match?.[2]

    if (!column || !(column in payload)) return false
    delete payload[column]
    return true
  }

  const retireTeacher = async (teacher) => {
    const payload = {
      school_id: null,
      secciones_ids: [],
      permisos: [],
      approval_status: 'rejected',
      approval_note: `Docente retirado del centro el ${new Date().toISOString().slice(0, 10)} para conservar historial de asistencia.`,
    }

    while (Object.keys(payload).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', teacher.id)

      if (!error) return
      if (!removeMissingColumnFromPayload(payload, error)) throw error
    }

    throw new Error('No fue posible retirar el docente porque faltan columnas requeridas en profiles.')
  }

  const handleDelete = async () => {
    if (!deleteTeacher) return
    setSaving(true)
    try {
      const { count, error: countError } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', deleteTeacher.id)

      if (countError) throw countError

      if ((count ?? 0) > 0) {
        await retireTeacher(deleteTeacher)
        alert('El docente tiene historial de asistencia, por eso fue retirado del centro sin borrar sus registros.')
      } else {
        const { error } = await supabase.from('profiles').delete().eq('id', deleteTeacher.id)
        if (error) {
          const message = String(error.message || '')
          if (message.includes('foreign key constraint') || message.includes('violates foreign key')) {
            await retireTeacher(deleteTeacher)
            alert('El docente estaba vinculado a registros del sistema, por eso fue retirado sin borrar el historial.')
          } else {
            throw error
          }
        }
      }

      setDeleteTeacher(null)
      await loadData()
    } catch (err) { alert('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const copyCreatedAccess = async () => {
    if (!createdTeacherAccess?.password) return
    const text = `Docente: ${createdTeacherAccess.name}\nCorreo: ${createdTeacherAccess.email}\nContrasena temporal: ${createdTeacherAccess.password}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAccess(true)
    } catch {
      setCopiedAccess(false)
    }
  }

  const filtered = teachers.filter(t => {
    const matchSearch = !search ||
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
    const matchPerm = !filterPerm || (t.permisos ?? []).includes(filterPerm)
    return matchSearch && matchPerm
  })

  const permLabel = {
    pasar_asistencia: { label: 'Asistencia', cls: 'pasar' },
    ver_reportes:     { label: 'Reportes',   cls: 'reportes' },
    editar_matricula: { label: 'Matricula',  cls: 'editar' },
    aprobar_excusas:  { label: 'Excusas',    cls: 'pasar' },
  }

  return (
    <>
      <style>{styles}</style>
      <div className="mt-root">
        <Sidebar profile={profile} onSignOut={handleSignOut} />

        <main className="mt-main">
          <div className="mt-topbar">
            <div>
              <div className="mt-page-title">Docentes</div>
              <div className="mt-page-sub">{teachers.length} docente{teachers.length !== 1 ? 's' : ''} registrado{teachers.length !== 1 ? 's' : ''}</div>
            </div>
            <button className="mt-btn-primary" onClick={() => { setEditTeacher(null); setShowForm(true) }}>
              <IcoPlus /> Nuevo docente
            </button>
          </div>

          <div className="mt-toolbar">
            <div className="mt-search-wrap">
              <span className="mt-search-icon"><IcoSearch /></span>
              <input className="mt-search" placeholder="Buscar por nombre o correo..."
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <div className="mt-filter-wrap">
              <select className="mt-filter-select" value={filterPerm} onChange={e => setFilterPerm(e.target.value)}>
                <option value="">Todos los permisos</option>
                {PERMISOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-table-wrap">
            {loading ? (
              <div className="mt-loading">Cargando docentes...</div>
            ) : (
              <>
                <table className="mt-table">
                  <thead>
                    <tr>
                      <th>Docente</th>
                      <th>Contacto</th>
                      <th>Permisos</th>
                      <th>Secciones</th>
                      <th style={{textAlign:'right'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5}>
                        <div className="mt-empty">
                          {search || filterPerm
                            ? 'No se encontraron docentes con esos filtros'
                            : 'No hay docentes registrados. Agrega el primero.'}
                        </div>
                      </td></tr>
                    ) : (
                      filtered.map(t => (
                        <tr key={t.id}>
                          <td>
                            <IdentityBubble
                              compact
                              tone="emerald"
                              name={t.full_name}
                              subtitle={t.email}
                              meta={`${(t.permisos ?? []).length} permiso${(t.permisos ?? []).length === 1 ? '' : 's'}`}
                            />
                          </td>
                          <td>
                            <div style={{fontSize:12, color:'#102847'}}>{t.email}</div>
                            {t.phone && <div style={{fontSize:11, color:'#4A6A8A', marginTop:1}}>{t.phone}</div>}
                            <div style={{fontSize:11, color:'#4A6A8A', marginTop:4}}>
                              Margen tardanza: {t.margen_tardanza_minutos ?? 30} min
                            </div>
                          </td>
                          <td>
                            <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                              {(t.permisos ?? []).map(p => (
                                <span key={p} className={`mt-badge ${permLabel[p]?.cls ?? 'pasar'}`}>
                                  {permLabel[p]?.label ?? p}
                                </span>
                              ))}
                              {(!t.permisos || t.permisos.length === 0) && (
                                <span style={{fontSize:12, color:'#8BBAD8'}}>Sin permisos</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {(t.secciones_ids ?? []).length > 0 ? (
                              <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                                {(t.secciones_ids ?? []).map(sid => {
                                  const sec = secciones.find(s => s.id === sid)
                                  return sec ? (
                                    <span key={sid} className="mt-badge pasar">
                                      {sec.grado} {sec.seccion}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            ) : (
                              <span style={{fontSize:12, color:'#8BBAD8'}}>Sin secciones</span>
                            )}
                          </td>
                          <td>
                            <div style={{display:'flex', justifyContent:'flex-end', gap:4}}>
                              <button className="mt-action-btn edit" title="Editar"
                                onClick={() => { setEditTeacher(t); setShowForm(true) }}>
                                <IcoEdit />
                              </button>
                              <button className="mt-action-btn del" title="Eliminar"
                                onClick={() => setDeleteTeacher(t)}>
                                <IcoTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {filtered.length > 0 && (
                  <div className="mt-count">
                    Mostrando {filtered.length} de {teachers.length} docentes
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {showForm && (
          <TeacherForm
            teacher={editTeacher}
            secciones={secciones} 
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditTeacher(null) }}
            loading={saving}
          />
        )}

        {deleteTeacher && (
          <div className="mt-modal-overlay" onClick={() => setDeleteTeacher(null)}>
            <div className="mt-modal" style={{maxWidth:400}} onClick={e => e.stopPropagation()}>
              <div className="mt-modal-header">
                <div className="mt-modal-title">Retirar docente</div>
                <button type="button" aria-label="Cerrar modal" className="mt-modal-close" onClick={() => setDeleteTeacher(null)}>x</button>
              </div>
              <div className="mt-modal-body">
                <p style={{fontSize:14, color:'#4A6A8A', lineHeight:1.6}}>
                  Estas seguro que deseas retirar a <strong style={{color:'#102847'}}>{deleteTeacher.full_name}</strong>?
                  Si tiene historial de asistencia, se conservaran sus registros y dejara de aparecer en este centro.
                </p>
              </div>
              <div className="mt-modal-footer">
                <button className="mt-btn-cancel" onClick={() => setDeleteTeacher(null)}>Cancelar</button>
                <button className="mt-btn-danger" onClick={handleDelete} disabled={saving}>
                  {saving ? 'Procesando...' : 'Si, retirar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {createdTeacherAccess && (
          <div className="mt-modal-overlay" onClick={() => setCreatedTeacherAccess(null)}>
            <div className="mt-modal" style={{maxWidth:460}} onClick={e => e.stopPropagation()}>
              <div className="mt-modal-header">
                <div className="mt-modal-title">Acceso del docente creado</div>
                <button type="button" aria-label="Cerrar modal" className="mt-modal-close" onClick={() => setCreatedTeacherAccess(null)}>x</button>
              </div>
              <div className="mt-modal-body">
                <p className="mt-credential-note">
                  Guarda o comparte estas credenciales con el docente. Esta contrasena temporal debe cambiarse al iniciar sesion.
                </p>
                <div className="mt-credential-card" style={{marginTop:14}}>
                  <div className="mt-credential-row">
                    <span className="mt-credential-label">Docente</span>
                    <div className="mt-credential-value email">{createdTeacherAccess.name}</div>
                  </div>
                  <div className="mt-credential-row">
                    <span className="mt-credential-label">Correo de acceso</span>
                    <div className="mt-credential-value email">{createdTeacherAccess.email}</div>
                  </div>
                  <div className="mt-credential-row">
                    <span className="mt-credential-label">Contrasena temporal</span>
                    <div className="mt-credential-value">{createdTeacherAccess.password}</div>
                  </div>
                </div>
              </div>
              <div className="mt-modal-footer">
                <button className="mt-btn-ghost" onClick={copyCreatedAccess}>
                  {copiedAccess ? 'Copiado' : 'Copiar acceso'}
                </button>
                <button className="mt-btn-primary" onClick={() => setCreatedTeacherAccess(null)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
