import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

const C = {
  navy: '#1B3F6B',
  navyDeep: '#102847',
  sky: '#B8D4E8',
  skyLight: '#D8EAF4',
  skyPale: '#EEF6FB',
  border: '#C8DFF0',
  dark: '#0D2238',
  mid: '#4A6A8A',
}

const IcoDash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
const IcoStudents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
const IcoTeacher = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
const IcoParents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
const IcoExcuse = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
const IcoSetup = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
const IcoLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
const IcoCheck = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
const IcoX = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
const IcoClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
const IcoFile = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
const IcoEye = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .ae-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }
  .ae-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .ae-logo { padding:24px 20px 20px; border-bottom:1px solid rgba(184,212,232,0.1); display:flex; align-items:center; gap:10px; }
  .ae-logo-icon { width:36px; height:36px; background:#1B3F6B; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ae-logo-text { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#fff; }
  .ae-logo-text span { color:${C.sky}; }
  .ae-nav { flex:1; padding:20px 12px 8px; }
  .ae-nav-label { font-size:10px; font-weight:700; color:rgba(184,212,232,0.4); text-transform:uppercase; letter-spacing:0.1em; padding:0 8px; margin-bottom:6px; }
  .ae-nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; cursor:pointer; transition:all 0.2s; border:none; background:none; width:100%; text-align:left; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; color:rgba(184,212,232,0.6); margin-bottom:2px; }
  .ae-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .ae-nav-item.active { background:#1B3F6B; color:#fff; }
  .ae-nav-item svg { opacity:0.6; flex-shrink:0; }
  .ae-nav-item.active svg, .ae-nav-item:hover svg { opacity:1; }
  .ae-sidebar-bottom { margin-top:auto; padding:16px 12px; border-top:1px solid rgba(184,212,232,0.1); }
  .ae-user-card { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; background:rgba(184,212,232,0.06); }
  .ae-avatar { width:32px; height:32px; background:#1B3F6B; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:${C.sky}; flex-shrink:0; }
  .ae-user-name { font-size:13px; font-weight:600; color:#fff; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ae-user-role { font-size:11px; color:rgba(184,212,232,0.5); }
  .ae-logout { background:none; border:none; color:rgba(184,212,232,0.4); cursor:pointer; padding:4px; border-radius:6px; transition:color 0.2s; display:flex; }
  .ae-logout:hover { color:#ef4444; }

  .ae-main { margin-left:240px; flex:1; padding:32px; }
  .ae-header { margin-bottom:28px; }
  .ae-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .ae-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  .ae-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }
  .ae-stat { background:#fff; border-radius:12px; padding:18px 20px; border:1px solid ${C.border}; display:flex; align-items:center; gap:14px; }
  .ae-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ae-stat-val { font-size:22px; font-weight:700; color:${C.dark}; line-height:1; }
  .ae-stat-label { font-size:12px; color:${C.mid}; margin-top:3px; }

  .ae-toolbar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .ae-search { flex:1; min-width:200px; max-width:320px; padding:9px 14px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; background:#fff; color:${C.dark}; transition:border 0.18s; }
  .ae-search:focus { border-color:${C.navy}; }
  .ae-select { padding:9px 12px; border-radius:9px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; background:#fff; color:${C.dark}; outline:none; cursor:pointer; }
  .ae-filter-tabs { display:flex; gap:4px; background:#fff; padding:4px; border-radius:10px; border:1px solid ${C.border}; }
  .ae-filter-tab { padding:7px 16px; border-radius:7px; border:none; background:transparent; font-size:13px; font-weight:500; color:${C.mid}; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:6px; }
  .ae-filter-tab.active { background:${C.navy}; color:#fff; }
  .ae-filter-tab:not(.active):hover { background:${C.skyLight}; color:${C.dark}; }
  .ae-count { background:${C.skyLight}; color:${C.navy}; border-radius:20px; padding:1px 7px; font-size:11px; font-weight:700; }
  .ae-filter-tab.active .ae-count { background:rgba(255,255,255,0.2); color:#fff; }

  .ae-list { display:flex; flex-direction:column; gap:10px; }
  .ae-card { background:#fff; border-radius:13px; border:1px solid ${C.border}; overflow:hidden; transition:box-shadow 0.18s; }
  .ae-card:hover { box-shadow:0 4px 18px rgba(27,63,107,0.07); }
  .ae-card.pending { border-left:4px solid #f59e0b; }
  .ae-card.approved { border-left:4px solid #22c55e; }
  .ae-card.rejected { border-left:4px solid #ef4444; }

  .ae-card-top { padding:16px 20px; display:flex; align-items:flex-start; gap:14px; }
  .ae-card-avatar { width:40px; height:40px; border-radius:10px; background:${C.skyLight}; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:${C.navy}; flex-shrink:0; }
  .ae-card-info { flex:1; min-width:0; }
  .ae-card-name { font-size:15px; font-weight:600; color:${C.dark}; }
  .ae-card-meta { display:flex; flex-wrap:wrap; gap:10px; margin-top:4px; }
  .ae-meta { font-size:12px; color:${C.mid}; }
  .ae-card-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }

  .ae-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
  .ae-badge.pending { background:#fef9c3; color:#854d0e; }
  .ae-badge.approved { background:#dcfce7; color:#166534; }
  .ae-badge.rejected { background:#fee2e2; color:#991b1b; }

  .ae-card-body { padding:0 20px 14px; }
  .ae-motivo { font-size:13px; color:${C.mid}; background:${C.skyPale}; border-radius:8px; padding:9px 12px; line-height:1.5; }
  .ae-tipo { display:inline-block; font-size:11px; font-weight:600; color:${C.navy}; background:${C.skyLight}; border-radius:6px; padding:2px 8px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.4px; }
  .ae-rechazo { margin-top:8px; padding:8px 12px; background:#fff5f5; border-radius:8px; font-size:13px; color:#991b1b; border-left:3px solid #fca5a5; }

  .ae-card-foot { padding:10px 20px; border-top:1px solid ${C.border}; background:${C.skyPale}; display:flex; gap:8px; align-items:center; }
  .ae-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .ae-btn-view { background:#fff; color:${C.navy}; border:1px solid ${C.border}; }
  .ae-btn-view:hover { background:${C.skyLight}; }

  .ae-empty { text-align:center; padding:60px 20px; color:${C.mid}; font-size:14px; }

  .ae-overlay { position:fixed; inset:0; background:rgba(10,24,40,0.45); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .ae-modal { background:#fff; border-radius:16px; width:100%; max-width:500px; box-shadow:0 20px 60px rgba(0,0,0,0.18); animation:ae-pop 0.2s ease; }
  @keyframes ae-pop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
  .ae-modal-head { display:flex; align-items:center; justify-content:space-between; padding:22px 26px 18px; border-bottom:1px solid ${C.border}; }
  .ae-modal-head h2 { font-family:'Playfair Display',serif; font-size:20px; color:${C.dark}; }
  .ae-modal-body { padding:22px 26px; }
  .ae-modal-foot { padding:16px 26px; border-top:1px solid ${C.border}; display:flex; justify-content:flex-end; }
  .ae-close { background:none; border:none; cursor:pointer; color:${C.mid}; font-size:20px; line-height:1; }
  .ae-close:hover { color:${C.dark}; }
  .ae-detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${C.border}; font-size:14px; gap:12px; }
  .ae-detail-row:last-child { border-bottom:none; }
  .ae-detail-label { color:${C.mid}; font-weight:500; }
  .ae-detail-val { color:${C.dark}; text-align:right; max-width:280px; }

  @media (max-width:900px) {
    .ae-sidebar { transform:translateX(-100%); }
    .ae-main { margin-left:0; padding:20px; }
    .ae-stats { grid-template-columns:repeat(2,1fr); }
  }
`

const TYPE_LABELS = {
  illness: 'Enfermedad',
  family: 'Motivo familiar',
  accident: 'Accidente',
  other: 'Otro',
  enfermedad: 'Enfermedad',
  familiar: 'Motivo familiar',
  accidente: 'Accidente',
  otro: 'Otro',
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getInitials(name = '') {
  const value = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  return value || 'AD'
}

function formatFecha(value) {
  if (!value) return '--'
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getStudentName(student) {
  return student?.full_name || student?.nombre || '--'
}

function getStudentCode(student) {
  return student?.enrollment_code || student?.matricula || '--'
}

function getExcuseStatus(excuse) {
  return excuse?.status || excuse?.estado || 'pending'
}

function getExcuseDate(excuse) {
  return excuse?.absence_date || excuse?.fecha_ausencia || null
}

function getExcuseType(excuse) {
  return excuse?.excuse_type || excuse?.tipo_ausencia || ''
}

function getExcuseReason(excuse) {
  return excuse?.reason || excuse?.motivo || ''
}

function getTeacherComment(excuse) {
  return excuse?.teacher_comment || excuse?.comentario_docente || ''
}

function getAttachmentUrl(excuse) {
  return excuse?.attachment_url || excuse?.evidencia_url || ''
}

function getStatusMeta(status = 'pending') {
  const normalized = {
    pendiente: 'pending',
    aprobada: 'approved',
    rechazada: 'rejected',
  }[status] || status

  const meta = {
    pending: { label: 'Pendiente', className: 'pending' },
    approved: { label: 'Aprobada', className: 'approved' },
    rejected: { label: 'Rechazada', className: 'rejected' },
  }

  return meta[normalized] || { label: normalized || 'Pendiente', className: normalized || 'pending' }
}

export default function AdminExcuses() {
  const { profile, activeSchoolId, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [excuses, setExcuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterMes, setFilterMes] = useState('todos')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', Icon: IcoDash },
    { label: 'Estudiantes', path: '/admin/students', Icon: IcoStudents },
    { label: 'Docentes', path: '/admin/teachers', Icon: IcoTeacher },
    { label: 'Padres', path: '/admin/parents', Icon: IcoParents },
    { label: 'Excusas', path: '/admin/excuses', Icon: IcoExcuse },
    { label: 'Centro', path: '/admin/center', Icon: IcoSetup },
  ]

  useEffect(() => {
    injectStyles()
    loadExcuses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSchoolId])

  function injectStyles() {
    if (document.getElementById('ae-styles')) return
    const style = document.createElement('style')
    style.id = 'ae-styles'
    style.textContent = STYLES
    document.head.appendChild(style)
  }

  async function loadExcuses() {
    setLoading(true)

    try {
      if (!activeSchoolId) {
        setExcuses([])
        setLoading(false)
        return
      }

      const [{ data: schoolSections, error: schoolSectionsError }, { data: allStudents, error: allStudentsError }] = await Promise.all([
        supabase
          .from('grade_sections')
          .select('id')
          .eq('school_id', activeSchoolId),
        supabase
          .from('students')
          .select('id, grade_section_id'),
      ])

      if (schoolSectionsError) throw schoolSectionsError
      if (allStudentsError) throw allStudentsError

      const schoolSectionIds = new Set((schoolSections || []).map(section => section.id))
      const schoolStudentIds = (allStudents || [])
        .filter(student => student.grade_section_id && schoolSectionIds.has(student.grade_section_id))
        .map(student => student.id)
      const { data: excusesData, error } = schoolStudentIds.length
        ? await supabase
            .from('excuses')
            .select('*')
            .in('student_id', schoolStudentIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null }

      if (error) throw error

      const studentIds = [...new Set((excusesData || []).map(excuse => excuse.student_id).filter(Boolean))]
      const profileIds = [...new Set(
        (excusesData || [])
          .flatMap(excuse => [excuse.parent_id, excuse.teacher_id])
          .filter(Boolean)
      )]

      const [
        { data: studentsData, error: studentsError },
        { data: profilesData, error: profilesError },
      ] = await Promise.all([
        studentIds.length
          ? supabase.from('students').select('*').in('id', studentIds)
          : Promise.resolve({ data: [], error: null }),
        profileIds.length
          ? supabase.from('profiles').select('*').in('id', profileIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (studentsError) console.warn('Error loading students for admin excuses:', studentsError)
      if (profilesError) console.warn('Error loading profiles for admin excuses:', profilesError)

      const studentsMap = new Map((studentsData || []).map(student => [student.id, student]))
      const profilesMap = new Map((profilesData || []).map(profile => [profile.id, profile]))

      setExcuses((excusesData || []).map(excuse => ({
        ...excuse,
        students: studentsMap.get(excuse.student_id) || null,
        parent: profilesMap.get(excuse.parent_id) || null,
        teacher: profilesMap.get(excuse.teacher_id) || null,
      })))
    } catch (error) {
      console.error('Error loading admin excuses:', error)
      setExcuses([])
    } finally {
      setLoading(false)
    }
  }

  const mesesDisponibles = [...new Set(
    excuses
      .map(excuse => getExcuseDate(excuse)?.slice(0, 7))
      .filter(Boolean)
  )].sort().reverse()

  const filtered = excuses.filter(excuse => {
    const statusMeta = getStatusMeta(getExcuseStatus(excuse))
    const absenceDate = getExcuseDate(excuse)
    const query = search.trim().toLowerCase()
    const studentName = getStudentName(excuse.students).toLowerCase()
    const studentCode = getStudentCode(excuse.students).toLowerCase()
    const reason = getExcuseReason(excuse).toLowerCase()

    const matchEstado = filterEstado === 'todos' || statusMeta.className === filterEstado
    const matchMes = filterMes === 'todos' || absenceDate?.startsWith(filterMes)
    const matchSearch = !query || studentName.includes(query) || studentCode.includes(query) || reason.includes(query)

    return matchEstado && matchMes && matchSearch
  })

  const counts = {
    todos: excuses.length,
    pending: excuses.filter(excuse => getStatusMeta(getExcuseStatus(excuse)).className === 'pending').length,
    approved: excuses.filter(excuse => getStatusMeta(getExcuseStatus(excuse)).className === 'approved').length,
    rejected: excuses.filter(excuse => getStatusMeta(getExcuseStatus(excuse)).className === 'rejected').length,
  }

  return (
    <div className="ae-root">
      <aside className="ae-sidebar">
        <div className="ae-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" />
        </div>

        <div className="ae-nav">
          <div className="ae-nav-label">Menu principal</div>
          {navItems.map(({ label, path, Icon }) => (
            <button
              key={path}
              className={`ae-nav-item${location.pathname === path ? ' active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="ae-sidebar-bottom">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Administrador"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      <main className="ae-main">
        <div className="ae-header">
          <h1>Excusas del sistema</h1>
          <p>Todas las justificaciones enviadas por los tutores</p>
        </div>

        <div className="ae-stats">
          <div className="ae-stat">
            <div className="ae-stat-icon" style={{ background: '#fef9c3' }}>
              <IcoClock />
            </div>
            <div>
              <div className="ae-stat-val">{counts.pending}</div>
              <div className="ae-stat-label">Pendientes</div>
            </div>
          </div>

          <div className="ae-stat">
            <div className="ae-stat-icon" style={{ background: '#dcfce7' }}>
              <IcoCheck />
            </div>
            <div>
              <div className="ae-stat-val">{counts.approved}</div>
              <div className="ae-stat-label">Aprobadas</div>
            </div>
          </div>

          <div className="ae-stat">
            <div className="ae-stat-icon" style={{ background: '#fee2e2' }}>
              <IcoX />
            </div>
            <div>
              <div className="ae-stat-val">{counts.rejected}</div>
              <div className="ae-stat-label">Rechazadas</div>
            </div>
          </div>
        </div>

        <div className="ae-toolbar">
          <input
            className="ae-search"
            placeholder="Buscar por estudiante, codigo o motivo..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <select className="ae-select" value={filterMes} onChange={event => setFilterMes(event.target.value)}>
            <option value="todos">Todos los meses</option>
            {mesesDisponibles.map(monthKey => {
              const [year, month] = monthKey.split('-')
              return (
                <option key={monthKey} value={monthKey}>
                  {MONTHS[Number(month) - 1]} {year}
                </option>
              )
            })}
          </select>

          <div className="ae-filter-tabs">
            {[
              { key: 'todos', label: 'Todas' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'approved', label: 'Aprobadas' },
              { key: 'rejected', label: 'Rechazadas' },
            ].map(filter => (
              <button
                key={filter.key}
                className={`ae-filter-tab${filterEstado === filter.key ? ' active' : ''}`}
                onClick={() => setFilterEstado(filter.key)}
              >
                {filter.label}
                <span className="ae-count">{counts[filter.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="ae-empty">Cargando excusas...</div>
        ) : filtered.length === 0 ? (
          <div className="ae-empty">
            {excuses.length === 0 ? 'No hay excusas registradas en el sistema.' : 'No hay excusas con estos filtros.'}
          </div>
        ) : (
          <div className="ae-list">
            {filtered.map(excuse => {
              const studentName = getStudentName(excuse.students)
              const studentCode = getStudentCode(excuse.students)
              const statusMeta = getStatusMeta(getExcuseStatus(excuse))
              const excuseType = getExcuseType(excuse)
              const teacherComment = getTeacherComment(excuse)
              const attachmentUrl = getAttachmentUrl(excuse)

              return (
                <div key={excuse.id} className={`ae-card ${statusMeta.className}`}>
                  <div className="ae-card-top">
                    <div className="ae-card-avatar">{getInitials(studentName)}</div>

                    <div className="ae-card-info">
                      <div className="ae-card-name">{studentName}</div>
                      <div className="ae-card-meta">
                        <span className="ae-meta">Codigo: {studentCode}</span>
                        <span className="ae-meta">Ausencia: {formatFecha(getExcuseDate(excuse))}</span>
                        {excuse.parent?.full_name && <span className="ae-meta">Tutor: {excuse.parent.full_name}</span>}
                        {excuse.teacher?.full_name && <span className="ae-meta">Docente: {excuse.teacher.full_name}</span>}
                      </div>
                    </div>

                    <div className="ae-card-right">
                      <span className={`ae-badge ${statusMeta.className}`}>
                        {statusMeta.className === 'pending' && <IcoClock />}
                        {statusMeta.className === 'approved' && <IcoCheck />}
                        {statusMeta.className === 'rejected' && <IcoX />}
                        {statusMeta.label}
                      </span>
                      <span style={{ fontSize: 11, color: C.mid }}>
                        {new Date(excuse.created_at).toLocaleDateString('es-DO')}
                      </span>
                    </div>
                  </div>

                  <div className="ae-card-body">
                    {excuseType && (
                      <div className="ae-tipo">{TYPE_LABELS[excuseType] || excuseType}</div>
                    )}

                    <div className="ae-motivo">
                      {getExcuseReason(excuse) || <em style={{ opacity: 0.5 }}>Sin motivo especificado</em>}
                    </div>

                    {statusMeta.className === 'rejected' && teacherComment && (
                      <div className="ae-rechazo">
                        <strong style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>
                          Motivo del rechazo:
                        </strong>
                        {teacherComment}
                      </div>
                    )}
                  </div>

                  <div className="ae-card-foot">
                    {attachmentUrl && (
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ae-btn ae-btn-view"
                        style={{ textDecoration: 'none' }}
                      >
                        <IcoFile />
                        Ver evidencia
                      </a>
                    )}

                    <button className="ae-btn ae-btn-view" onClick={() => setDetail(excuse)}>
                      <IcoEye />
                      Detalle completo
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {detail && (
        <div className="ae-overlay" onClick={() => setDetail(null)}>
          <div className="ae-modal" onClick={event => event.stopPropagation()}>
            <div className="ae-modal-head">
              <h2>Detalle de excusa</h2>
              <button className="ae-close" onClick={() => setDetail(null)}>
                x
              </button>
            </div>

            <div className="ae-modal-body">
              {[
                ['Estudiante', getStudentName(detail.students)],
                ['Matricula', getStudentCode(detail.students)],
                ['Fecha ausencia', formatFecha(getExcuseDate(detail))],
                ['Tipo', TYPE_LABELS[getExcuseType(detail)] || getExcuseType(detail) || '--'],
                ['Motivo', getExcuseReason(detail) || '--'],
                ['Estado', getStatusMeta(getExcuseStatus(detail)).label],
                ['Tutor', detail.parent?.full_name || '--'],
                ['Contacto tutor', detail.parent?.phone || detail.parent?.email || '--'],
                ['Docente revisor', detail.teacher?.full_name || 'Sin revisar'],
                ['Enviada el', new Date(detail.created_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })],
                ...(getTeacherComment(detail) ? [['Comentario docente', getTeacherComment(detail)]] : []),
              ].map(([label, value]) => (
                <div key={label} className="ae-detail-row">
                  <span className="ae-detail-label">{label}</span>
                  <span className="ae-detail-val" style={label === 'Comentario docente' ? { color: '#991b1b' } : {}}>
                    {value || '--'}
                  </span>
                </div>
              ))}

              {getAttachmentUrl(detail) && (
                <div style={{ marginTop: 16 }}>
                  <a
                    href={getAttachmentUrl(detail)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ae-btn ae-btn-view"
                    style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', display: 'flex' }}
                  >
                    <IcoFile />
                    Abrir evidencia adjunta
                  </a>
                </div>
              )}
            </div>

            <div className="ae-modal-foot">
              <button className="ae-btn ae-btn-view" onClick={() => setDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
