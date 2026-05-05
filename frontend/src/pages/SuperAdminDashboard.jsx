import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  assignDirectorToSchool,
  createManagedUser,
  createSchool,
  deleteSchool,
  deleteSuperAdminUser,
  fetchSuperAdminOverview,
  updateDirectorApproval,
  updateSchool,
  updateSuperAdminUser,
} from '../api/backendApi'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/ui/BrandLogo'
import { isSuperAdminEmail } from '../utils/access'
import {
  MAX_EMAIL_LENGTH,
  formatDominicanPhone,
  normalizeEmail,
  validateDominicanPhone,
  validateEmail,
} from '../utils/formValidation'

const ROLE_LABEL = {
  admin: 'Director',
  teacher: 'Docente',
  parent: 'Padre/Tutor',
}

const STATUS_LABEL = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const EMPTY_USER_FORM = {
  id: '',
  full_name: '',
  email: '',
  phone: '',
  role: 'admin',
  school_id: '',
  approval_status: 'approved',
  password: '',
}

const EMPTY_SCHOOL_FORM = {
  id: '',
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
  director: '',
  configurado: false,
}

const styles = `
  .sa2-root {
    min-height: 100vh;
    background: #f6f7f8;
    color: #111111;
    font-family: "Sora", "Inter", system-ui, sans-serif;
  }
  .sa2-shell {
    width: min(1440px, 100%);
    margin: 0 auto;
    padding: 18px;
  }
  .sa2-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px 0 18px;
    background: rgba(246,247,248,.94);
    backdrop-filter: blur(12px);
  }
  .sa2-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .sa2-title {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 900;
    line-height: 1.1;
  }
  .sa2-sub {
    margin-top: 2px;
    color: #666;
    font-size: .82rem;
    font-weight: 700;
  }
  .sa2-actions,
  .sa2-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .sa2-btn {
    min-height: 40px;
    border: 0;
    border-radius: 12px;
    padding: 0 14px;
    background: #ffffff;
    color: #111111;
    font: inherit;
    font-size: .84rem;
    font-weight: 900;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #dedede;
    transition: transform .16s ease, background .16s ease, border-color .16s ease;
  }
  .sa2-btn:hover { transform: translateY(-1px); border-color: #111; }
  .sa2-btn:disabled { opacity: .58; cursor: not-allowed; transform: none; }
  .sa2-btn.primary { background: #111111; color: #ffffff; border-color: #111111; }
  .sa2-btn.danger { background: #e82127; color: #ffffff; border-color: #e82127; }
  .sa2-btn.soft-danger { background: #fff1f2; color: #b91c1c; border-color: #fecdd3; }
  .sa2-btn.success { background: #166534; color: #ffffff; border-color: #166534; }
  .sa2-grid {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .sa2-side,
  .sa2-panel,
  .sa2-modal {
    background: #ffffff;
    border: 1px solid #e3e3e3;
    border-radius: 18px;
    box-shadow: 0 18px 50px rgba(17,17,17,.07);
  }
  .sa2-side {
    position: sticky;
    top: 86px;
    padding: 14px;
    display: grid;
    gap: 12px;
  }
  .sa2-userbox {
    padding: 14px;
    border-radius: 16px;
    background: #111111;
    color: #ffffff;
  }
  .sa2-userbox strong {
    display: block;
    font-size: 1rem;
    line-height: 1.25;
  }
  .sa2-userbox span {
    display: block;
    margin-top: 5px;
    color: rgba(255,255,255,.7);
    font-size: .78rem;
    word-break: break-word;
  }
  .sa2-statgrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .sa2-stat {
    min-height: 82px;
    padding: 12px;
    border-radius: 14px;
    background: #f5f5f4;
    border: 1px solid #ececea;
  }
  .sa2-stat span {
    color: #666;
    font-size: .7rem;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .sa2-stat strong {
    display: block;
    margin-top: 10px;
    font-size: 1.7rem;
    line-height: 1;
  }
  .sa2-tabs {
    display: grid;
    gap: 7px;
  }
  .sa2-tab {
    width: 100%;
    min-height: 42px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    color: #333;
    text-align: left;
    font: inherit;
    font-size: .9rem;
    font-weight: 900;
    cursor: pointer;
  }
  .sa2-tab.active {
    background: #111111;
    color: #ffffff;
  }
  .sa2-panel {
    overflow: hidden;
  }
  .sa2-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 18px;
    border-bottom: 1px solid #eeeeee;
  }
  .sa2-panel-head h2 {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.1;
  }
  .sa2-panel-head p {
    margin: 5px 0 0;
    color: #666;
    font-size: .84rem;
  }
  .sa2-toolbar {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 180px 180px;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid #eeeeee;
    background: #fbfbfb;
  }
  .sa2-input,
  .sa2-select {
    width: 100%;
    min-height: 42px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    background: #ffffff;
    color: #111111;
    font: inherit;
    font-size: .88rem;
    padding: 0 12px;
    box-sizing: border-box;
  }
  .sa2-input:focus,
  .sa2-select:focus {
    outline: none;
    border-color: #111111;
    box-shadow: 0 0 0 3px rgba(232,33,39,.09);
  }
  .sa2-input.invalid { border-color: #dc2626; background: #fff7f7; }
  .sa2-error {
    color: #dc2626;
    font-size: .72rem;
    font-weight: 700;
  }
  .sa2-table-wrap {
    overflow: auto;
  }
  .sa2-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 820px;
  }
  .sa2-table th,
  .sa2-table td {
    padding: 13px 16px;
    border-bottom: 1px solid #eeeeee;
    text-align: left;
    vertical-align: middle;
  }
  .sa2-table th {
    color: #666;
    background: #fbfbfb;
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .sa2-name {
    display: grid;
    gap: 3px;
    min-width: 0;
  }
  .sa2-name strong {
    color: #111;
    font-size: .92rem;
  }
  .sa2-name span {
    color: #666;
    font-size: .8rem;
    word-break: break-word;
  }
  .sa2-badge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: .72rem;
    font-weight: 900;
    white-space: nowrap;
    border: 1px solid transparent;
  }
  .sa2-badge.approved { background: #ecfdf3; color: #166534; border-color: #bbf7d0; }
  .sa2-badge.pending { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
  .sa2-badge.rejected { background: #fff1f2; color: #b91c1c; border-color: #fecdd3; }
  .sa2-badge.missing { background: #f5f5f4; color: #444; border-color: #dedede; }
  .sa2-card-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 18px;
  }
  .sa2-school {
    display: grid;
    gap: 12px;
    padding: 15px;
    border: 1px solid #e5e5e5;
    border-radius: 16px;
    background: #ffffff;
  }
  .sa2-school-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }
  .sa2-school h3 {
    margin: 0;
    font-size: 1rem;
  }
  .sa2-school p {
    margin: 4px 0 0;
    color: #666;
    font-size: .82rem;
    line-height: 1.45;
  }
  .sa2-empty {
    margin: 18px;
    padding: 16px;
    border-radius: 14px;
    background: #f5f5f4;
    color: #444;
    font-size: .9rem;
  }
  .sa2-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(17,17,17,.48);
  }
  .sa2-modal {
    width: min(620px, 100%);
    max-height: min(760px, 92vh);
    overflow: auto;
  }
  .sa2-modal-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    padding: 18px;
    border-bottom: 1px solid #eeeeee;
  }
  .sa2-modal-head h2 {
    margin: 0;
    font-size: 1.12rem;
  }
  .sa2-form {
    display: grid;
    gap: 12px;
    padding: 18px;
  }
  .sa2-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .sa2-field {
    display: grid;
    gap: 6px;
  }
  .sa2-field label {
    color: #555;
    font-size: .74rem;
    font-weight: 900;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .sa2-modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 18px;
    border-top: 1px solid #eeeeee;
    background: #fbfbfb;
  }
  .sa2-confirm {
    display: grid;
    gap: 12px;
    padding: 18px;
  }
  .sa2-warning {
    padding: 13px;
    border-radius: 14px;
    background: #fff1f2;
    color: #9f1239;
    border: 1px solid #fecdd3;
    font-size: .88rem;
    line-height: 1.5;
  }
  @media (max-width: 1020px) {
    .sa2-grid { grid-template-columns: 1fr; }
    .sa2-side { position: static; }
    .sa2-tabs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .sa2-card-list { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .sa2-shell { padding: 12px; }
    .sa2-topbar { position: static; align-items: stretch; flex-direction: column; }
    .sa2-actions .sa2-btn,
    .sa2-row .sa2-btn { flex: 1 1 140px; }
    .sa2-toolbar,
    .sa2-form-grid { grid-template-columns: 1fr; }
    .sa2-tabs { grid-template-columns: 1fr; }
    .sa2-panel-head { flex-direction: column; }
    .sa2-modal-foot { flex-direction: column-reverse; }
    .sa2-modal-foot .sa2-btn { width: 100%; }
  }
`

function getStatus(value) {
  const status = String(value || 'approved').toLowerCase()
  return STATUS_LABEL[status] ? status : 'approved'
}

function normalizeUserForm(user = EMPTY_USER_FORM) {
  return {
    id: user.id || '',
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'admin',
    school_id: user.school_id || '',
    approval_status: getStatus(user.approval_status),
    password: '',
  }
}

function normalizeSchoolForm(school = EMPTY_SCHOOL_FORM) {
  return {
    id: school.id || '',
    nombre: school.nombre || '',
    direccion: school.direccion || '',
    telefono: school.telefono || '',
    email: school.email || '',
    director: school.director || '',
    configurado: Boolean(school.configurado),
  }
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [tab, setTab] = useState('users')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userModal, setUserModal] = useState(null)
  const [schoolModal, setSchoolModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [assignment, setAssignment] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [generatedAccess, setGeneratedAccess] = useState(null)
  const [overview, setOverview] = useState({
    stats: { schools: 0, users: 0, directors: 0, teachers: 0, parents: 0, pending_directors: 0 },
    users: [],
    directors: [],
    schools: [],
    panel_notifications: [],
  })

  async function loadOverview() {
    setLoading(true)
    try {
      const data = await fetchSuperAdminOverview()
      setOverview({
        stats: data.stats || {},
        users: data.users || data.directors || [],
        directors: data.directors || [],
        schools: data.schools || [],
        panel_notifications: data.panel_notifications || [],
      })
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el panel.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  const schoolsById = useMemo(
    () => Object.fromEntries(overview.schools.map((school) => [school.id, school])),
    [overview.schools],
  )

  const assignableDirectors = useMemo(
    () => overview.users.filter((user) =>
      user.role === 'admin' &&
      !isSuperAdminEmail(user.email) &&
      user.auth_exists !== false &&
      ['pending', 'approved'].includes(getStatus(user.approval_status))),
    [overview.users],
  )

  const pendingDirectors = useMemo(
    () => overview.users.filter((user) => user.role === 'admin' && getStatus(user.approval_status) === 'pending' && !isSuperAdminEmail(user.email)),
    [overview.users],
  )

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return overview.users.filter((user) => {
      if (isSuperAdminEmail(user.email)) return false
      const status = getStatus(user.approval_status)
      const matchSearch = !q ||
        user.full_name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        schoolsById[user.school_id]?.nombre?.toLowerCase().includes(q)
      const matchRole = roleFilter === 'all' || user.role === roleFilter
      const matchStatus = statusFilter === 'all' || status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [overview.users, roleFilter, schoolsById, search, statusFilter])

  function validateUserForm(form, isEditing) {
    const normalized = {
      ...form,
      full_name: form.full_name.trim(),
      email: normalizeEmail(form.email),
      phone: formatDominicanPhone(form.phone),
    }
    const errors = {
      full_name: normalized.full_name ? '' : 'El nombre es obligatorio.',
      email: validateEmail(normalized.email, 'correo'),
      phone: normalized.phone ? validateDominicanPhone(normalized.phone) : '',
      password: !isEditing && normalized.password && normalized.password.length < 6 ? 'Minimo 6 caracteres.' : '',
    }
    setFormErrors(errors)
    return Object.values(errors).some(Boolean) ? null : normalized
  }

  function validateSchoolForm(form) {
    const normalized = {
      ...form,
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
      telefono: formatDominicanPhone(form.telefono),
      email: form.email ? normalizeEmail(form.email) : '',
      director: form.director.trim(),
    }
    const errors = {
      nombre: normalized.nombre ? '' : 'El nombre es obligatorio.',
      telefono: normalized.telefono ? validateDominicanPhone(normalized.telefono, { label: 'telefono del centro' }) : '',
      email: normalized.email ? validateEmail(normalized.email, 'correo institucional') : '',
    }
    setFormErrors(errors)
    return Object.values(errors).some(Boolean) ? null : normalized
  }

  async function handleSaveUser(event) {
    event.preventDefault()
    const isEditing = Boolean(userModal?.form?.id)
    const normalized = validateUserForm(userModal.form, isEditing)
    if (!normalized) {
      toast.error('Revisa los campos del usuario.')
      return
    }

    setSaving('user')
    try {
      if (isEditing) {
        await updateSuperAdminUser(normalized.id, normalized)
        toast.success('Usuario actualizado.')
      } else {
        const response = await createManagedUser({
          role: normalized.role,
          school_id: normalized.school_id || null,
          full_name: normalized.full_name,
          email: normalized.email,
          phone: normalized.phone,
          password: normalized.password || undefined,
          permisos: [],
          secciones_ids: [],
          margen_tardanza_minutos: 30,
        })
        if (response.generated_password) {
          setGeneratedAccess({
            email: normalized.email,
            password: response.generated_password,
          })
        }
        toast.success('Usuario creado.')
      }
      setUserModal(null)
      setFormErrors({})
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el usuario.')
    } finally {
      setSaving('')
    }
  }

  async function handleSaveSchool(event) {
    event.preventDefault()
    const isEditing = Boolean(schoolModal?.form?.id)
    const normalized = validateSchoolForm(schoolModal.form)
    if (!normalized) {
      toast.error('Revisa los campos del centro.')
      return
    }

    setSaving('school')
    try {
      if (isEditing) {
        await updateSchool(normalized.id, normalized)
        toast.success('Centro actualizado.')
      } else {
        await createSchool(normalized)
        toast.success('Centro creado.')
      }
      setSchoolModal(null)
      setFormErrors({})
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el centro.')
    } finally {
      setSaving('')
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return
    setSaving('delete')
    try {
      if (deleteTarget.type === 'user') {
        await deleteSuperAdminUser(deleteTarget.item.id)
        toast.success('Usuario eliminado.')
      } else {
        await deleteSchool(deleteTarget.item.id, { force: true })
        toast.success('Centro eliminado con sus datos dependientes.')
      }
      setDeleteTarget(null)
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar.')
    } finally {
      setSaving('')
    }
  }

  async function handleApproval(user, action) {
    setSaving(`${user.id}:${action}`)
    try {
      await updateDirectorApproval(user.id, action)
      toast.success(action === 'approve' ? 'Director aprobado.' : 'Director rechazado.')
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el estado.')
    } finally {
      setSaving('')
    }
  }

  async function handleAssignDirector(schoolId) {
    const directorId = assignment[schoolId]
    if (!directorId) {
      toast.error('Selecciona un director.')
      return
    }

    setSaving(`assign:${schoolId}`)
    try {
      await assignDirectorToSchool(schoolId, directorId)
      toast.success('Director asignado.')
      setAssignment((current) => ({ ...current, [schoolId]: '' }))
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo asignar el director.')
    } finally {
      setSaving('')
    }
  }

  function openUserModal(user = null) {
    setGeneratedAccess(null)
    setFormErrors({})
    setUserModal({ form: normalizeUserForm(user || EMPTY_USER_FORM) })
  }

  function openSchoolModal(school = null) {
    setFormErrors({})
    setSchoolModal({ form: normalizeSchoolForm(school || EMPTY_SCHOOL_FORM) })
  }

  function patchUserForm(patch) {
    setUserModal((current) => ({ ...current, form: { ...current.form, ...patch } }))
  }

  function patchSchoolForm(patch) {
    setSchoolModal((current) => ({ ...current, form: { ...current.form, ...patch } }))
  }

  return (
    <>
      <style>{styles}</style>
      <div className="sa2-root">
        <div className="sa2-shell">
          <header className="sa2-topbar">
            <div className="sa2-brand">
              <BrandLogo compact size={42} />
              <div>
                <h1 className="sa2-title">Super Panel</h1>
                <div className="sa2-sub">Control total de QHere</div>
              </div>
            </div>
            <div className="sa2-actions">
              <button className="sa2-btn" onClick={loadOverview} type="button">Recargar</button>
              <button className="sa2-btn" onClick={() => navigate('/login')} type="button">Acceso</button>
              <button className="sa2-btn soft-danger" onClick={signOut} type="button">Salir</button>
            </div>
          </header>

          <div className="sa2-grid">
            <aside className="sa2-side">
              <div className="sa2-userbox">
                <strong>{profile?.full_name || 'Super admin'}</strong>
                <span>{profile?.email || 'Cuenta absoluta'}</span>
              </div>
              <div className="sa2-statgrid">
                <div className="sa2-stat"><span>Centros</span><strong>{loading ? '--' : overview.stats.schools || 0}</strong></div>
                <div className="sa2-stat"><span>Usuarios</span><strong>{loading ? '--' : overview.stats.users || 0}</strong></div>
                <div className="sa2-stat"><span>Directores</span><strong>{loading ? '--' : overview.stats.directors || 0}</strong></div>
                <div className="sa2-stat"><span>Pendientes</span><strong>{loading ? '--' : pendingDirectors.length}</strong></div>
              </div>
              <nav className="sa2-tabs" aria-label="Secciones del super panel">
                <button className={`sa2-tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')} type="button">Usuarios</button>
                <button className={`sa2-tab${tab === 'schools' ? ' active' : ''}`} onClick={() => setTab('schools')} type="button">Centros</button>
                <button className={`sa2-tab${tab === 'approvals' ? ' active' : ''}`} onClick={() => setTab('approvals')} type="button">Aprobaciones</button>
              </nav>
            </aside>

            <main className="sa2-panel">
              {tab === 'users' ? (
                <>
                  <div className="sa2-panel-head">
                    <div>
                      <h2>Usuarios</h2>
                      <p>Directores, docentes y padres registrados en el sistema.</p>
                    </div>
                    <button className="sa2-btn primary" onClick={() => openUserModal()} type="button">Nuevo usuario</button>
                  </div>
                  <div className="sa2-toolbar">
                    <input className="sa2-input" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuario o centro" value={search} />
                    <select className="sa2-select" onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
                      <option value="all">Todos los roles</option>
                      <option value="admin">Directores</option>
                      <option value="teacher">Docentes</option>
                      <option value="parent">Padres/Tutores</option>
                    </select>
                    <select className="sa2-select" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                      <option value="all">Todos los estados</option>
                      <option value="approved">Aprobados</option>
                      <option value="pending">Pendientes</option>
                      <option value="rejected">Rechazados</option>
                    </select>
                  </div>
                  {loading ? (
                    <div className="sa2-empty">Cargando usuarios...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="sa2-empty">No hay usuarios con esos filtros.</div>
                  ) : (
                    <div className="sa2-table-wrap">
                      <table className="sa2-table">
                        <thead>
                          <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Centro</th>
                            <th>Estado</th>
                            <th>Auth</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const status = getStatus(user.approval_status)
                            return (
                              <tr key={user.id}>
                                <td>
                                  <div className="sa2-name">
                                    <strong>{user.full_name || 'Sin nombre'}</strong>
                                    <span>{user.email}</span>
                                  </div>
                                </td>
                                <td>{ROLE_LABEL[user.role] || user.role}</td>
                                <td>{schoolsById[user.school_id]?.nombre || user.school?.nombre || 'Sin centro'}</td>
                                <td><span className={`sa2-badge ${status}`}>{STATUS_LABEL[status]}</span></td>
                                <td><span className={`sa2-badge ${user.auth_exists === false ? 'missing' : 'approved'}`}>{user.auth_exists === false ? 'Sin Auth' : 'Activo'}</span></td>
                                <td>
                                  <div className="sa2-row">
                                    <button className="sa2-btn" onClick={() => openUserModal(user)} type="button">Editar</button>
                                    <button className="sa2-btn soft-danger" onClick={() => setDeleteTarget({ type: 'user', item: user })} type="button">Borrar</button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : null}

              {tab === 'schools' ? (
                <>
                  <div className="sa2-panel-head">
                    <div>
                      <h2>Centros</h2>
                      <p>Centros educativos, directores asignados y configuracion.</p>
                    </div>
                    <button className="sa2-btn primary" onClick={() => openSchoolModal()} type="button">Nuevo centro</button>
                  </div>
                  {loading ? (
                    <div className="sa2-empty">Cargando centros...</div>
                  ) : overview.schools.length === 0 ? (
                    <div className="sa2-empty">No hay centros registrados.</div>
                  ) : (
                    <div className="sa2-card-list">
                      {overview.schools.map((school) => (
                        <article className="sa2-school" key={school.id}>
                          <div className="sa2-school-top">
                            <div>
                              <h3>{school.nombre}</h3>
                              <p>{school.direccion || 'Sin direccion'}</p>
                              <p>{school.email || 'Sin correo'} · {school.telefono || 'Sin telefono'}</p>
                            </div>
                            <span className={`sa2-badge ${school.configurado ? 'approved' : 'pending'}`}>{school.configurado ? 'Configurado' : 'Pendiente'}</span>
                          </div>
                          <div>
                            <div className="sa2-name">
                              <strong>{school.director || 'Director pendiente'}</strong>
                              <span>{school.id}</span>
                            </div>
                          </div>
                          <div className="sa2-row">
                            <select className="sa2-select" onChange={(event) => setAssignment((current) => ({ ...current, [school.id]: event.target.value }))} value={assignment[school.id] || ''}>
                              <option value="">Asignar director</option>
                              {assignableDirectors.map((director) => (
                                <option key={director.id} value={director.id}>{director.full_name} - {director.email}</option>
                              ))}
                            </select>
                            <button className="sa2-btn" disabled={saving === `assign:${school.id}`} onClick={() => handleAssignDirector(school.id)} type="button">
                              {saving === `assign:${school.id}` ? 'Asignando...' : 'Asignar'}
                            </button>
                          </div>
                          <div className="sa2-row">
                            <button className="sa2-btn" onClick={() => openSchoolModal(school)} type="button">Editar</button>
                            <button className="sa2-btn soft-danger" onClick={() => setDeleteTarget({ type: 'school', item: school })} type="button">Borrar centro</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              ) : null}

              {tab === 'approvals' ? (
                <>
                  <div className="sa2-panel-head">
                    <div>
                      <h2>Aprobaciones de directores</h2>
                      <p>Solicitudes pendientes de acceso directivo.</p>
                    </div>
                    <span className="sa2-badge pending">{pendingDirectors.length} pendientes</span>
                  </div>
                  {loading ? (
                    <div className="sa2-empty">Cargando solicitudes...</div>
                  ) : pendingDirectors.length === 0 ? (
                    <div className="sa2-empty">No hay directores pendientes.</div>
                  ) : (
                    <div className="sa2-card-list">
                      {pendingDirectors.map((director) => (
                        <article className="sa2-school" key={director.id}>
                          <div className="sa2-school-top">
                            <div>
                              <h3>{director.full_name}</h3>
                              <p>{director.email}</p>
                              <p>{director.school?.nombre || schoolsById[director.school_id]?.nombre || 'Sin centro visible'}</p>
                              <p>{formatDate(director.approval_requested_at || director.created_at)}</p>
                            </div>
                            <span className="sa2-badge pending">Pendiente</span>
                          </div>
                          <div className="sa2-row">
                            <button className="sa2-btn success" disabled={saving === `${director.id}:approve`} onClick={() => handleApproval(director, 'approve')} type="button">Aprobar</button>
                            <button className="sa2-btn danger" disabled={saving === `${director.id}:reject`} onClick={() => handleApproval(director, 'reject')} type="button">Rechazar</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </main>
          </div>
        </div>
      </div>

      {userModal ? (
        <div className="sa2-overlay" onMouseDown={() => setUserModal(null)}>
          <form className="sa2-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleSaveUser}>
            <div className="sa2-modal-head">
              <h2>{userModal.form.id ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button className="sa2-btn" onClick={() => setUserModal(null)} type="button">Cerrar</button>
            </div>
            <div className="sa2-form">
              <div className="sa2-form-grid">
                <div className="sa2-field">
                  <label>Nombre</label>
                  <input className={`sa2-input${formErrors.full_name ? ' invalid' : ''}`} onChange={(event) => patchUserForm({ full_name: event.target.value })} value={userModal.form.full_name} />
                  {formErrors.full_name ? <span className="sa2-error">{formErrors.full_name}</span> : null}
                </div>
                <div className="sa2-field">
                  <label>Correo</label>
                  <input className={`sa2-input${formErrors.email ? ' invalid' : ''}`} maxLength={MAX_EMAIL_LENGTH} onChange={(event) => patchUserForm({ email: event.target.value })} type="email" value={userModal.form.email} />
                  {formErrors.email ? <span className="sa2-error">{formErrors.email}</span> : null}
                </div>
                <div className="sa2-field">
                  <label>Telefono</label>
                  <input className={`sa2-input${formErrors.phone ? ' invalid' : ''}`} inputMode="tel" maxLength={12} onChange={(event) => patchUserForm({ phone: formatDominicanPhone(event.target.value) })} value={userModal.form.phone} />
                  {formErrors.phone ? <span className="sa2-error">{formErrors.phone}</span> : null}
                </div>
                <div className="sa2-field">
                  <label>Rol</label>
                  <select className="sa2-select" onChange={(event) => patchUserForm({ role: event.target.value })} value={userModal.form.role}>
                    <option value="admin">Director</option>
                    <option value="teacher">Docente</option>
                    <option value="parent">Padre/Tutor</option>
                  </select>
                </div>
                <div className="sa2-field">
                  <label>Centro</label>
                  <select className="sa2-select" onChange={(event) => patchUserForm({ school_id: event.target.value })} value={userModal.form.school_id}>
                    <option value="">Sin centro</option>
                    {overview.schools.map((school) => <option key={school.id} value={school.id}>{school.nombre}</option>)}
                  </select>
                </div>
                <div className="sa2-field">
                  <label>Estado</label>
                  <select className="sa2-select" onChange={(event) => patchUserForm({ approval_status: event.target.value })} value={userModal.form.approval_status}>
                    <option value="approved">Aprobado</option>
                    <option value="pending">Pendiente</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                {!userModal.form.id ? (
                  <div className="sa2-field">
                    <label>Contrasena</label>
                    <input className={`sa2-input${formErrors.password ? ' invalid' : ''}`} onChange={(event) => patchUserForm({ password: event.target.value })} placeholder="Vacia = generar automaticamente" type="text" value={userModal.form.password} />
                    {formErrors.password ? <span className="sa2-error">{formErrors.password}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="sa2-modal-foot">
              <button className="sa2-btn" onClick={() => setUserModal(null)} type="button">Cancelar</button>
              <button className="sa2-btn primary" disabled={saving === 'user'} type="submit">{saving === 'user' ? 'Guardando...' : 'Guardar usuario'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {schoolModal ? (
        <div className="sa2-overlay" onMouseDown={() => setSchoolModal(null)}>
          <form className="sa2-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={handleSaveSchool}>
            <div className="sa2-modal-head">
              <h2>{schoolModal.form.id ? 'Editar centro' : 'Nuevo centro'}</h2>
              <button className="sa2-btn" onClick={() => setSchoolModal(null)} type="button">Cerrar</button>
            </div>
            <div className="sa2-form">
              <div className="sa2-form-grid">
                <div className="sa2-field">
                  <label>Nombre</label>
                  <input className={`sa2-input${formErrors.nombre ? ' invalid' : ''}`} onChange={(event) => patchSchoolForm({ nombre: event.target.value })} value={schoolModal.form.nombre} />
                  {formErrors.nombre ? <span className="sa2-error">{formErrors.nombre}</span> : null}
                </div>
                <div className="sa2-field">
                  <label>Director visible</label>
                  <input className="sa2-input" onChange={(event) => patchSchoolForm({ director: event.target.value })} value={schoolModal.form.director} />
                </div>
                <div className="sa2-field">
                  <label>Telefono</label>
                  <input className={`sa2-input${formErrors.telefono ? ' invalid' : ''}`} inputMode="tel" maxLength={12} onChange={(event) => patchSchoolForm({ telefono: formatDominicanPhone(event.target.value) })} value={schoolModal.form.telefono} />
                  {formErrors.telefono ? <span className="sa2-error">{formErrors.telefono}</span> : null}
                </div>
                <div className="sa2-field">
                  <label>Correo</label>
                  <input className={`sa2-input${formErrors.email ? ' invalid' : ''}`} maxLength={MAX_EMAIL_LENGTH} onChange={(event) => patchSchoolForm({ email: event.target.value })} type="email" value={schoolModal.form.email} />
                  {formErrors.email ? <span className="sa2-error">{formErrors.email}</span> : null}
                </div>
              </div>
              <div className="sa2-field">
                <label>Direccion</label>
                <input className="sa2-input" onChange={(event) => patchSchoolForm({ direccion: event.target.value })} value={schoolModal.form.direccion} />
              </div>
              <label className="sa2-row">
                <input checked={schoolModal.form.configurado} onChange={(event) => patchSchoolForm({ configurado: event.target.checked })} type="checkbox" />
                Centro configurado
              </label>
            </div>
            <div className="sa2-modal-foot">
              <button className="sa2-btn" onClick={() => setSchoolModal(null)} type="button">Cancelar</button>
              <button className="sa2-btn primary" disabled={saving === 'school'} type="submit">{saving === 'school' ? 'Guardando...' : 'Guardar centro'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="sa2-overlay" onMouseDown={() => setDeleteTarget(null)}>
          <div className="sa2-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sa2-modal-head">
              <h2>{deleteTarget.type === 'user' ? 'Borrar usuario' : 'Borrar centro'}</h2>
              <button className="sa2-btn" onClick={() => setDeleteTarget(null)} type="button">Cerrar</button>
            </div>
            <div className="sa2-confirm">
              <div className="sa2-warning">
                {deleteTarget.type === 'user'
                  ? `Se eliminara ${deleteTarget.item.full_name || deleteTarget.item.email} del panel y de Supabase Auth.`
                  : `Se eliminara ${deleteTarget.item.nombre} junto con usuarios, estudiantes, secciones y datos dependientes de ese centro.`}
              </div>
            </div>
            <div className="sa2-modal-foot">
              <button className="sa2-btn" onClick={() => setDeleteTarget(null)} type="button">Cancelar</button>
              <button className="sa2-btn danger" disabled={saving === 'delete'} onClick={handleDeleteConfirmed} type="button">
                {saving === 'delete' ? 'Borrando...' : 'Confirmar borrado'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {generatedAccess ? (
        <div className="sa2-overlay" onMouseDown={() => setGeneratedAccess(null)}>
          <div className="sa2-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sa2-modal-head">
              <h2>Acceso generado</h2>
              <button className="sa2-btn" onClick={() => setGeneratedAccess(null)} type="button">Cerrar</button>
            </div>
            <div className="sa2-confirm">
              <div className="sa2-name">
                <strong>{generatedAccess.email}</strong>
                <span>Contrasena temporal: {generatedAccess.password}</span>
              </div>
            </div>
            <div className="sa2-modal-foot">
              <button className="sa2-btn primary" onClick={() => setGeneratedAccess(null)} type="button">Entendido</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
