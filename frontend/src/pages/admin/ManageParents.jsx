// ============================================================
// ManageParents.jsx
// Ruta: /admin/parents
// Prefijo CSS: .mp-
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import IdentityBubble from '../../components/ui/IdentityBubble'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import { createManagedUser } from '../../api/backendApi'
import BrandLogo from '../../components/ui/BrandLogo'
import {
  MAX_EMAIL_LENGTH,
  formatDominicanPhone,
  normalizeEmail,
  validateDominicanPhone,
  validateEmail,
} from '../../utils/formValidation'

// â”€â”€â”€ Paleta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  navy:     '#1B3F6B', navyDeep: '#102847', navyMid: '#2A5590',
  sky:      '#B8D4E8', skyLight: '#D8EAF4', skyPale: '#EEF6FB',
  skyMid:   '#8BBAD8', border:   '#C8DFF0', dark:    '#0D2238', mid: '#4A6A8A',
}

// â”€â”€â”€ Iconos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IcoDash     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
const IcoStudents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
const IcoTeacher  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoParents  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
const IcoExcuse   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
const IcoSetup    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
const IcoLogout   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoPlus     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IcoEdit     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcoTrash    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
const IcoLink     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
const IcoX        = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoUnlink   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>

// â”€â”€â”€ Estilos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .mp-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .mp-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .mp-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .mp-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .mp-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .mp-nav { flex:1; padding:16px 0; }
  .mp-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; text-decoration:none; }
  .mp-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .mp-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .mp-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .mp-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .mp-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .mp-user-name { font-size:13px; color:#fff; font-weight:500; }
  .mp-user-role { font-size:11px; color:${C.skyMid}; }
  .mp-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .mp-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .mp-main { margin-left:240px; flex:1; padding:32px; }
  .mp-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; }
  .mp-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .mp-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Botones */
  .mp-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .mp-btn-primary { background:${C.navy}; color:#fff; }
  .mp-btn-primary:hover { background:${C.navyMid}; }
  .mp-btn-secondary { background:#fff; color:${C.navy}; border:1px solid ${C.border}; }
  .mp-btn-secondary:hover { background:${C.skyLight}; }
  .mp-btn-danger { background:#fff0f0; color:#c0392b; border:1px solid #f5c6c6; }
  .mp-btn-danger:hover { background:#ffe0e0; }
  .mp-btn-sm { padding:6px 12px; font-size:13px; }
  .mp-btn:disabled { opacity:0.5; cursor:not-allowed; }

  /* Barra de bÃºsqueda */
  .mp-toolbar { display:flex; gap:12px; margin-bottom:20px; align-items:center; flex-wrap:wrap; }
  .mp-search { flex:1; min-width:200px; max-width:320px; padding:9px 14px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:#fff; color:${C.dark}; transition:border 0.18s; }
  .mp-search:focus { border-color:${C.navy}; }

  /* Tabla */
  .mp-card { background:#fff; border-radius:14px; border:1px solid ${C.border}; overflow:hidden; }
  .mp-table-wrap { overflow-x:auto; }
  .mp-table { width:100%; border-collapse:collapse; font-size:14px; }
  .mp-table th { text-align:left; padding:11px 16px; font-size:12px; font-weight:600; color:${C.mid}; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid ${C.border}; background:${C.skyPale}; }
  .mp-table td { padding:13px 16px; border-bottom:1px solid ${C.border}; color:${C.dark}; vertical-align:middle; }
  .mp-table tr:last-child td { border-bottom:none; }
  .mp-table tr:hover td { background:${C.skyPale}; }
  .mp-actions { display:flex; gap:6px; }
  .mp-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:7px; border:1px solid ${C.border}; background:#fff; cursor:pointer; color:${C.mid}; transition:all 0.18s; }
  .mp-icon-btn:hover { background:${C.skyLight}; color:${C.navy}; }
  .mp-icon-btn.danger:hover { background:#fff0f0; color:#c0392b; border-color:#f5c6c6; }
  .mp-empty { text-align:center; padding:48px 20px; color:${C.mid}; font-size:14px; }

  /* Hijos chips */
  .mp-hijos { display:flex; flex-wrap:wrap; gap:5px; }
  .mp-hijo-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; background:${C.skyLight}; border:1px solid ${C.border}; border-radius:20px; font-size:12px; color:${C.navy}; font-weight:500; }
  .mp-hijo-chip button { background:none; border:none; cursor:pointer; color:${C.mid}; display:flex; align-items:center; padding:0; transition:color 0.15s; line-height:1; }
  .mp-hijo-chip button:hover { color:#c0392b; }

  /* Modal */
  .mp-overlay { position:fixed; inset:0; background:rgba(10,24,40,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .mp-modal { background:#fff; border-radius:16px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(0,0,0,0.18); animation:mp-pop 0.2s ease; }
  @keyframes mp-pop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
  .mp-modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 26px 18px; border-bottom:1px solid ${C.border}; }
  .mp-modal-head h2 { font-family:'Playfair Display',serif; font-size:20px; color:${C.dark}; }
  .mp-modal-body { padding:22px 26px; }
  .mp-modal-foot { padding:16px 26px; border-top:1px solid ${C.border}; display:flex; justify-content:flex-end; gap:10px; }
  .mp-close { background:none; border:none; cursor:pointer; color:${C.mid}; display:flex; align-items:center; transition:color 0.15s; }
  .mp-close:hover { color:${C.dark}; }

  /* Campos */
  .mp-field { margin-bottom:16px; }
  .mp-label { display:block; font-size:13px; font-weight:500; color:${C.dark}; margin-bottom:5px; }
  .mp-label span { color:${C.mid}; font-weight:400; font-size:12px; }
  .mp-input, .mp-select { width:100%; padding:9px 12px; border-radius:8px; border:1px solid ${C.border}; font-size:14px; color:${C.dark}; font-family:'DM Sans',sans-serif; outline:none; transition:border 0.18s; background:#fff; box-sizing:border-box; }
  .mp-input:focus, .mp-select:focus { border-color:${C.navy}; }
  .mp-input.invalid { border-color:#dc2626; background:#fff7f7; }
  .mp-error { color:#dc2626; font-size:11px; line-height:1.4; margin-top:6px; }
  .mp-row2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

  /* SecciÃ³n vincular hijos */
  .mp-vincular-section { margin-top:18px; padding-top:18px; border-top:1px solid ${C.border}; }
  .mp-vincular-title { font-size:13px; font-weight:600; color:${C.dark}; margin-bottom:10px; }
  .mp-vincular-row { display:flex; gap:8px; align-items:center; }
  .mp-vincular-row .mp-select { flex:1; }
  .mp-hijos-lista { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; min-height:28px; }

  /* Password box */
  .mp-pwd-box { background:${C.skyLight}; border:1px solid ${C.border}; border-radius:10px; padding:14px 16px; margin-bottom:16px; }
  .mp-pwd-box p { font-size:13px; color:${C.mid}; margin-bottom:6px; }
  .mp-pwd-val { font-size:16px; font-weight:700; color:${C.navy}; letter-spacing:1px; font-family:monospace; }

  /* Toast */
  .mp-toast-wrap { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; flex-direction:column; gap:10px; }
  .mp-toast { display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:10px; font-size:14px; font-weight:500; box-shadow:0 4px 20px rgba(0,0,0,0.12); animation:mp-slide 0.25s ease; }
  .mp-toast.success { background:#166534; color:#fff; }
  .mp-toast.error   { background:#991b1b; color:#fff; }
  .mp-toast.info    { background:${C.navy}; color:#fff; }
  @keyframes mp-slide { from { transform:translateX(60px); opacity:0; } to { transform:translateX(0); opacity:1; } }

  @media (max-width:900px) {
    .mp-sidebar { transform:translateX(-100%); }
    .mp-main { margin-left:0; padding:20px; }
    .mp-row2 { grid-template-columns:1fr; }
  }
`

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function genPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
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

function isMissingColumnError(error, columnName) {
  const message = String(error?.message || error?.details || '').toLowerCase()
  return message.includes(columnName.toLowerCase()) && message.includes('does not exist')
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPONENTE PRINCIPAL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function ManageParents() {
  const { profile, activeSchoolId, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, toast } = useToast()

  const [parents, setParents]       = useState([])
  const [students, setStudents]     = useState([])   // todos los estudiantes para el selector
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(null) // null | 'create' | 'edit' | 'link' | 'confirm-delete'
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Form crear/editar
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', relacion: 'padre' })
  const [formErrors, setFormErrors] = useState({})
  const [editId, setEditId]         = useState(null)  // profile_id del padre en ediciÃ³n
  const [newPwd, setNewPwd]         = useState('')

  // VinculaciÃ³n
  const [linkParentId, setLinkParentId]   = useState(null)  // profile_id
  const [linkParentName, setLinkParentName] = useState('')
  const [linkHijos, setLinkHijos]         = useState([])    // rows de parents para ese padre
  const [linkSelected, setLinkSelected]   = useState('')    // student_id seleccionado para agregar

  const navItems = [
    { label: 'Dashboard',     path: '/admin/dashboard', Icon: IcoDash     },
    { label: 'Estudiantes',   path: '/admin/students',  Icon: IcoStudents },
    { label: 'Docentes',      path: '/admin/teachers',  Icon: IcoTeacher  },
    { label: 'Padres',        path: '/admin/parents',   Icon: IcoParents  },
    { label: 'Excusas',       path: '/admin/excuses',   Icon: IcoExcuse   },
    { label: 'Centro', path: '/admin/center',     Icon: IcoSetup    },
  ]

  useEffect(() => {
    injectStyles()
    void loadParents()
    void loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchoolId])

  function setFormField(field, value) {
    const nextValue = field === 'phone' ? formatDominicanPhone(value) : value
    setForm((current) => ({ ...current, [field]: nextValue }))
    setFormErrors((current) => ({ ...current, [field]: '' }))
  }

  function validateParentForm({ requireEmail = true } = {}) {
    const normalized = {
      ...form,
      full_name: form.full_name.trim(),
      email: normalizeEmail(form.email),
      phone: formatDominicanPhone(form.phone),
    }
    const nextErrors = {
      full_name: normalized.full_name ? '' : 'El nombre completo es obligatorio.',
      email: requireEmail ? validateEmail(normalized.email, 'correo electronico') : '',
      phone: validateDominicanPhone(normalized.phone),
    }

    setForm(normalized)
    setFormErrors(nextErrors)

    return Object.values(nextErrors).every((message) => !message) ? normalized : null
  }

  function injectStyles() {
    if (document.getElementById('mp-styles')) return
    const el = document.createElement('style')
    el.id = 'mp-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  async function fetchStudentsForActiveSchool(fields = 'id, nombre, matricula') {
    const { data: schoolSections, error: sectionsError } = await supabase
      .from('grade_sections')
      .select('id')
      .eq('school_id', activeSchoolId)

    if (sectionsError) throw sectionsError

    const schoolSectionIds = new Set((schoolSections || []).map(section => section.id))
    let studentsResult = await supabase
      .from('students')
      .select(`${fields}, school_id, grade_section_id`)
      .order('nombre')

    if (studentsResult.error && isMissingColumnError(studentsResult.error, 'school_id')) {
      studentsResult = await supabase
        .from('students')
        .select(`${fields}, grade_section_id`)
        .order('nombre')
    }

    if (studentsResult.error) throw studentsResult.error

    const studentsRows = studentsResult.data || []
    const studentsHaveSchoolId = studentsRows.some(student =>
      Object.prototype.hasOwnProperty.call(student, 'school_id')
    )
    const scopedStudents = studentsRows.filter(student => {
      if (studentsHaveSchoolId && student.school_id === activeSchoolId) return true
      return student.grade_section_id && schoolSectionIds.has(student.grade_section_id)
    })

    return { students: scopedStudents, studentIds: new Set(scopedStudents.map(student => student.id)) }
  }

  // â”€â”€ Cargar padres con sus hijos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function loadParents() {
    if (!activeSchoolId) {
      setParents([])
      setLoading(false)
      return
    }

    setLoading(true)
    let scopedStudentIds = new Set()
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'parent')
      .order('full_name')

    if (profilesError) {
      toast(profilesError.message || 'No se pudieron cargar los padres/tutores.', 'error')
      setParents([])
      setLoading(false)
      return
    }

    try {
      const scoped = await fetchStudentsForActiveSchool('id')
      scopedStudentIds = scoped.studentIds
    } catch (error) {
      toast(error.message || 'No se pudieron cargar los estudiantes del centro.', 'error')
      setParents([])
      setLoading(false)
      return
    }

    if (!profiles?.length) { setParents([]); setLoading(false); return }

    const { data: links, error: linksError } = await supabase
      .from('parents')
      .select('*, students(id, nombre, matricula)')
      .in('profile_id', profiles.map(p => p.id))

    if (linksError) {
      toast(linksError.message || 'No se pudieron cargar los vinculos de tutores.', 'error')
      setParents([])
      setLoading(false)
      return
    }

    const scopedParents = (profiles || []).filter(parent => {
      const parentLinks = (links || []).filter(link => link.profile_id === parent.id)
      const isAssignedToActiveSchool = parent.school_id === activeSchoolId
      const hasStudentInActiveSchool = parentLinks.some(link => scopedStudentIds.has(link.student_id))
      const hasSchoolIdColumn = Object.prototype.hasOwnProperty.call(parent, 'school_id')

      // Si el esquema viejo aun no tiene profiles.school_id, mantenemos visibles
      // los padres sin vinculos para que el director pueda asociarlos.
      const isUnlinkedLegacyParent = !hasSchoolIdColumn && parentLinks.length === 0

      return isAssignedToActiveSchool || hasStudentInActiveSchool || isUnlinkedLegacyParent
    })

    if (!scopedParents.length) { setParents([]); setLoading(false); return }

    const scopedProfileIds = scopedParents.map(parent => parent.id)
    const scopedLinks = (links || []).filter(link =>
      scopedProfileIds.includes(link.profile_id) && scopedStudentIds.has(link.student_id)
    )

    const result = scopedParents.map(p => ({
      ...p,
      hijos: scopedLinks.filter(l => l.profile_id === p.id),
    }))

    setParents(result)
    setLoading(false)
  }

  async function loadStudents() {
    if (!activeSchoolId) {
      setStudents([])
      return
    }

    try {
      const { students: scopedStudents } = await fetchStudentsForActiveSchool('id, nombre, matricula')
      setStudents(scopedStudents)
    } catch (error) {
      toast(error.message || 'No se pudieron cargar los estudiantes para vincular.', 'error')
      setStudents([])
    }
  }

  // â”€â”€ Crear padre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleCreate(e) {
    e.preventDefault()
    const validForm = validateParentForm()
    if (!validForm) return
    setSaving(true)
    const pwd = genPassword()
    setNewPwd(pwd)

    try {
      await createManagedUser({
        role: 'parent',
        school_id: activeSchoolId,
        full_name: validForm.full_name,
        email: validForm.email,
        phone: validForm.phone,
        password: pwd,
      })
      toast(`Padre/tutor creado. Contrasena: ${pwd}`, 'success')
      setModal('pwd-created')
      setForm({ full_name: '', email: '', phone: '', relacion: 'padre' })
      await loadParents()
    } catch (err) {
      console.error(err)
      toast(err.message || 'Error al crear el padre/tutor.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // â”€â”€ Editar padre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleEdit(e) {
    e.preventDefault()
    const validForm = validateParentForm({ requireEmail: false })
    if (!validForm) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: validForm.full_name,
        phone:     validForm.phone,
      }).eq('id', editId)
      if (error) throw error
      toast('Datos actualizados correctamente.', 'success')
      closeModal()
      await loadParents()
    } catch (err) {
      toast(err.message || 'Error al actualizar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // â”€â”€ Eliminar padre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      // Eliminar vÃ­nculos primero
      await supabase.from('parents').delete().eq('profile_id', deleteTarget)
      // Eliminar perfil
      const { error } = await supabase.from('profiles').delete().eq('id', deleteTarget)
      if (error) throw error
      toast('Padre/tutor eliminado.', 'success')
      closeModal()
      await loadParents()
    } catch (err) {
      toast(err.message || 'Error al eliminar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // â”€â”€ Cargar hijos de un padre para el modal de vinculaciÃ³n â”€
  async function openLinkModal(parent) {
    setLinkParentId(parent.id)
    setLinkParentName(parent.full_name)
    setLinkHijos(parent.hijos || [])
    setLinkSelected('')
    setModal('link')
  }

  // â”€â”€ Agregar vÃ­nculo hijo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function addHijo() {
    if (!linkSelected) { toast('Selecciona un estudiante.', 'error'); return }
    // Verificar duplicado
    if (linkHijos.find(h => h.student_id === linkSelected)) {
      toast('Este estudiante ya estÃ¡ vinculado.', 'error'); return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('parents').insert({
        profile_id: linkParentId,
        student_id: linkSelected,
        relacion:   form.relacion || 'padre',
      })
      if (error) throw error
      // Recargar hijos de este padre
      const { data: links } = await supabase
        .from('parents')
        .select('*, students(id, nombre, matricula)')
        .eq('profile_id', linkParentId)
      setLinkHijos(links || [])
      setLinkSelected('')
      toast('Estudiante vinculado.', 'success')
      await loadParents()
    } catch (err) {
      toast(err.message || 'Error al vincular.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // â”€â”€ Quitar vÃ­nculo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function removeHijo(linkId) {
    try {
      await supabase.from('parents').delete().eq('id', linkId)
      setLinkHijos(p => p.filter(h => h.id !== linkId))
      toast('VÃ­nculo eliminado.', 'info')
      await loadParents()
    } catch {
      toast('Error al desvincular.', 'error')
    }
  }

  // â”€â”€ Helpers de modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function openCreate() {
    setForm({ full_name: '', email: '', phone: '', relacion: 'padre' })
    setFormErrors({})
    setEditId(null)
    setNewPwd('')
    setModal('create')
  }

  function openEdit(parent) {
    setForm({ full_name: parent.full_name, email: parent.email, phone: formatDominicanPhone(parent.phone || ''), relacion: 'padre' })
    setFormErrors({})
    setEditId(parent.id)
    setModal('edit')
  }

  function openDelete(parent) {
    setDeleteTarget(parent.id)
    setModal('confirm-delete')
  }

  function closeModal() {
    setModal(null)
    setFormErrors({})
    setDeleteTarget(null)
    setEditId(null)
    setNewPwd('')
  }

  // â”€â”€ Filtrar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filtered = parents.filter(p => {
    const q = search.toLowerCase()
    return !q || p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
  })

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="mp-root">
      {/* Sidebar */}
      <aside className="mp-sidebar">
        <div className="mp-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Panel Administrativo" />
        </div>
        <nav className="mp-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`mp-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="mp-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Administrador"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="mp-main">
        <div className="mp-header">
          <div>
            <h1>Padres y Tutores</h1>
            <p>{parents.length} registrado{parents.length !== 1 ? 's' : ''} en el sistema</p>
          </div>
          <button className="mp-btn mp-btn-primary" onClick={openCreate}>
            <IcoPlus /> Nuevo padre / tutor
          </button>
        </div>

        <div className="mp-toolbar">
          <input
            className="mp-search"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="mp-card">
          <div className="mp-table-wrap">
            {loading ? (
              <div className="mp-empty">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="mp-empty">
                {search ? 'No hay coincidencias.' : 'No hay padres/tutores registrados. Crea el primero.'}
              </div>
            ) : (
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Telefono</th>
                    <th>Hijos vinculados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <IdentityBubble
                          compact
                          tone="amber"
                          name={p.full_name}
                          subtitle={p.phone || 'Tutor sin telefono registrado'}
                          meta={`${p.hijos?.length || 0} estudiante${(p.hijos?.length || 0) === 1 ? '' : 's'} vinculado${(p.hijos?.length || 0) === 1 ? '' : 's'}`}
                        />
                      </td>
                      <td style={{ color: C.mid, fontSize: 13 }}>{p.email}</td>
                      <td style={{ color: C.mid, fontSize: 13 }}>{p.phone || 'â€”'}</td>
                      <td>
                        {p.hijos?.length ? (
                          <div className="mp-hijos">
                            {p.hijos.map(h => (
                              <span key={h.id} className="mp-hijo-chip">
                                {h.students?.nombre || 'â€”'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: C.mid, fontSize: 13 }}>Sin hijos vinculados</span>
                        )}
                      </td>
                      <td>
                        <div className="mp-actions">
                          <button className="mp-icon-btn" title="Vincular hijos" onClick={() => openLinkModal(p)}><IcoLink /></button>
                          <button className="mp-icon-btn" title="Editar" onClick={() => openEdit(p)}><IcoEdit /></button>
                          <button className="mp-icon-btn danger" title="Eliminar" onClick={() => openDelete(p)}><IcoTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* â”€â”€ Modal: Crear padre â”€â”€ */}
      {modal === 'create' && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-head">
              <h2>Nuevo padre / tutor</h2>
              <button className="mp-close" onClick={closeModal}><IcoX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mp-modal-body">
                <div className="mp-field">
                  <label className="mp-label">Nombre completo *</label>
                  <input className={`mp-input${formErrors.full_name ? ' invalid' : ''}`} placeholder="Ej: Maria Gonzalez" maxLength={90} value={form.full_name} onChange={e => setFormField('full_name', e.target.value)} autoFocus />
                  {formErrors.full_name && <div className="mp-error">{formErrors.full_name}</div>}
                </div>
                <div className="mp-row2">
                  <div className="mp-field">
                    <label className="mp-label">Correo electronico *</label>
                    <input className={`mp-input${formErrors.email ? ' invalid' : ''}`} type="email" placeholder="correo@ejemplo.com" autoComplete="email" maxLength={MAX_EMAIL_LENGTH} value={form.email} onChange={e => setFormField('email', e.target.value)} />
                    {formErrors.email && <div className="mp-error">{formErrors.email}</div>}
                  </div>
                  <div className="mp-field">
                    <label className="mp-label">Telefono <span>(opcional)</span></label>
                    <input className={`mp-input${formErrors.phone ? ' invalid' : ''}`} placeholder="809-000-0000" autoComplete="tel" inputMode="tel" maxLength={12} value={form.phone} onChange={e => setFormField('phone', e.target.value)} />
                    {formErrors.phone && <div className="mp-error">{formErrors.phone}</div>}
                  </div>
                </div>
                <div className="mp-field">
                  <label className="mp-label">Relacion con el estudiante</label>
                  <select className="mp-select" value={form.relacion} onChange={e => setForm(f => ({ ...f, relacion: e.target.value }))}>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="tutor">Tutor legal</option>
                    <option value="abuelo">Abuelo/a</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <p style={{ fontSize: 12, color: C.mid, background: C.skyLight, padding: '10px 12px', borderRadius: 8 }}>
                  Se generara una contrasena temporal automaticamente. Deberas compartirla con el padre/tutor.
                </p>
              </div>
              <div className="mp-modal-foot">
                <button type="button" className="mp-btn mp-btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="mp-btn mp-btn-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear cuenta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: ContraseÃ±a generada â”€â”€ */}
      {modal === 'pwd-created' && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-head">
              <h2>Cuenta creada exitosamente</h2>
              <button className="mp-close" onClick={closeModal}><IcoX /></button>
            </div>
            <div className="mp-modal-body">
              <p style={{ fontSize: 14, color: C.mid, marginBottom: 16 }}>
                Comparte estas credenciales con el padre/tutor. La contraseÃ±a no se podrÃ¡ ver de nuevo.
              </p>
              <div className="mp-pwd-box">
                <p>ContraseÃ±a temporal generada:</p>
                <div className="mp-pwd-val">{newPwd}</div>
              </div>
              <p style={{ fontSize: 12, color: C.mid }}>
                El padre/tutor puede cambiar su contraseÃ±a desde su perfil despuÃ©s de iniciar sesiÃ³n.
              </p>
            </div>
            <div className="mp-modal-foot">
              <button className="mp-btn mp-btn-primary" onClick={closeModal}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Editar padre â”€â”€ */}
      {modal === 'edit' && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-head">
              <h2>Editar padre / tutor</h2>
              <button className="mp-close" onClick={closeModal}><IcoX /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="mp-modal-body">
                <div className="mp-field">
                  <label className="mp-label">Nombre completo *</label>
                  <input className={`mp-input${formErrors.full_name ? ' invalid' : ''}`} maxLength={90} value={form.full_name} onChange={e => setFormField('full_name', e.target.value)} autoFocus />
                  {formErrors.full_name && <div className="mp-error">{formErrors.full_name}</div>}
                </div>
                <div className="mp-field">
                  <label className="mp-label">Correo <span>(no editable)</span></label>
                  <input className="mp-input" value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="mp-field">
                  <label className="mp-label">Telefono</label>
                  <input className={`mp-input${formErrors.phone ? ' invalid' : ''}`} placeholder="809-000-0000" autoComplete="tel" inputMode="tel" maxLength={12} value={form.phone} onChange={e => setFormField('phone', e.target.value)} />
                  {formErrors.phone && <div className="mp-error">{formErrors.phone}</div>}
                </div>
              </div>
              <div className="mp-modal-foot">
                <button type="button" className="mp-btn mp-btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="mp-btn mp-btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Vincular hijos â”€â”€ */}
      {modal === 'link' && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-head">
              <h2>Vincular estudiantes</h2>
              <button className="mp-close" onClick={closeModal}><IcoX /></button>
            </div>
            <div className="mp-modal-body">
              <p style={{ fontSize: 14, color: C.mid, marginBottom: 16 }}>
                Padre/tutor: <strong style={{ color: C.dark }}>{linkParentName}</strong>
              </p>

              <div className="mp-vincular-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <div className="mp-vincular-title">Hijos vinculados actualmente:</div>
                <div className="mp-hijos-lista">
                  {linkHijos.length === 0 ? (
                    <span style={{ fontSize: 13, color: C.mid }}>Sin hijos vinculados todavÃ­a</span>
                  ) : linkHijos.map(h => (
                    <span key={h.id} className="mp-hijo-chip">
                      {h.students?.nombre || 'â€”'}
                      <span style={{ fontSize: 11, color: C.mid, marginLeft: 2 }}>({h.students?.matricula})</span>
                      <button onClick={() => removeHijo(h.id)} title="Desvincular"><IcoUnlink /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mp-vincular-section">
                <div className="mp-vincular-title">Agregar estudiante:</div>
                <div className="mp-vincular-row">
                  <select
                    className="mp-select"
                    value={linkSelected}
                    onChange={e => setLinkSelected(e.target.value)}
                  >
                    <option value="">â€” Selecciona un estudiante â€”</option>
                    {students
                      .filter(s => !linkHijos.find(h => h.student_id === s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.matricula})</option>
                      ))}
                  </select>
                  <button
                    className="mp-btn mp-btn-primary mp-btn-sm"
                    onClick={addHijo}
                    disabled={saving || !linkSelected}
                  >
                    <IcoLink /> Vincular
                  </button>
                </div>
              </div>
            </div>
            <div className="mp-modal-foot">
              <button className="mp-btn mp-btn-secondary" onClick={closeModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Confirmar eliminar â”€â”€ */}
      {modal === 'confirm-delete' && (
        <div className="mp-overlay" onClick={closeModal}>
          <div className="mp-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="mp-modal-head">
              <h2>Eliminar padre / tutor</h2>
              <button className="mp-close" onClick={closeModal}><IcoX /></button>
            </div>
            <div className="mp-modal-body">
              <p style={{ fontSize: 14, color: C.mid }}>
                Esta acciÃ³n eliminarÃ¡ el perfil y todos los vÃ­nculos con estudiantes. No se puede deshacer.
              </p>
            </div>
            <div className="mp-modal-foot">
              <button className="mp-btn mp-btn-secondary" onClick={closeModal}>Cancelar</button>
              <button className="mp-btn mp-btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Eliminando...' : 'SÃ­, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="mp-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`mp-toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  )
}
