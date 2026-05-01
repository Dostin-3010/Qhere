import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  assignDirectorToSchool,
  createSchool,
  fetchSuperAdminOverview,
  updateDirectorApproval,
} from '../api/backendApi'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/ui/BrandLogo'
import { isSuperAdminEmail } from '../utils/access'

const styles = `
  .ra-root {
    min-height: 100vh;
    padding: 28px 20px 44px;
    background:
      radial-gradient(circle at 8% 0%, rgba(232,33,39,.08), transparent 28%),
      radial-gradient(circle at 94% 6%, rgba(17,17,17,.08), transparent 30%),
      linear-gradient(180deg, #ffffff 0%, #f5f5f4 52%, #efefed 100%);
    font-family: "Sora", sans-serif;
    color: #111111;
  }
  .ra-wrap {
    width: min(1180px, 100%);
    margin: 0 auto;
  }
  .ra-top {
    position: relative;
    display: grid;
    grid-template-columns: 1.15fr .85fr;
    gap: 22px;
    align-items: stretch;
    margin-bottom: 22px;
    padding: 26px;
    border-radius: 34px;
    background:
      linear-gradient(135deg, rgba(255,255,255,.09), transparent 36%),
      linear-gradient(160deg, #1b070b 0%, #111111 54%, #202020 100%);
    color: #ffffff;
    box-shadow: 0 34px 90px rgba(17,17,17,.22);
    overflow: hidden;
  }
  .ra-top::after {
    content: "";
    position: absolute;
    right: -86px;
    bottom: -120px;
    width: 360px;
    height: 360px;
    border-radius: 999px;
    border: 56px solid rgba(232,33,39,.13);
    pointer-events: none;
  }
  .ra-hero-main,
  .ra-command {
    position: relative;
    z-index: 1;
  }
  .ra-brand-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .ra-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: rgba(255,255,255,.82);
  }
  .ra-kicker-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #e82127;
  }
  .ra-title {
    margin: 18px 0 10px;
    font: 800 clamp(2.05rem, 4vw, 3.15rem)/.96 "Fraunces", serif;
    letter-spacing: -.04em;
    color: #ffffff;
  }
  .ra-copy {
    max-width: 640px;
    color: rgba(255,255,255,.72);
    line-height: 1.78;
    font-size: .95rem;
  }
  .ra-command {
    display: grid;
    gap: 14px;
    align-content: space-between;
    padding: 18px;
    border-radius: 26px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    backdrop-filter: blur(14px);
  }
  .ra-command-title {
    margin: 0;
    font-size: .78rem;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: rgba(255,255,255,.62);
  }
  .ra-command-user {
    display: grid;
    gap: 6px;
  }
  .ra-command-user strong {
    font: 800 1.45rem "Fraunces", serif;
    color: #ffffff;
  }
  .ra-command-user span {
    color: rgba(255,255,255,.68);
    font-size: .9rem;
  }
  .ra-command-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .ra-command-chip {
    min-height: 82px;
    padding: 14px;
    border-radius: 20px;
    background: rgba(0,0,0,.22);
    border: 1px solid rgba(255,255,255,.1);
  }
  .ra-command-chip span {
    display: block;
    color: rgba(255,255,255,.56);
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .13em;
    text-transform: uppercase;
  }
  .ra-command-chip strong {
    display: block;
    margin-top: 12px;
    color: #ffffff;
    font-size: 1.5rem;
    line-height: 1;
  }
  .ra-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ra-btn {
    min-height: 46px;
    padding: 0 18px;
    border-radius: 999px;
    border: 0;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform .2s ease, opacity .2s ease, background .2s ease;
  }
  .ra-btn.primary {
    background: #ffffff;
    color: #111111;
  }
  .ra-top .ra-btn.primary {
    background: #ffffff;
    color: #111111;
  }
  .ra-top .ra-btn.secondary {
    background: rgba(255,255,255,.08);
    color: #ffffff;
    border: 1px solid rgba(255,255,255,.16);
  }
  .ra-btn.primary {
    background: #111111;
    color: #fff;
  }
  .ra-btn.secondary {
    background: #fff;
    color: #111111;
    border: 1px solid rgba(17,17,17,.12);
  }
  .ra-btn.success {
    background: #111111;
    color: #fff;
  }
  .ra-btn.danger {
    background: #e82127;
    color: #fff;
  }
  .ra-btn:hover { transform: translateY(-2px); }
  .ra-btn:disabled { opacity: .72; cursor: not-allowed; transform: none; }
  .ra-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .ra-stat {
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,.9);
    border: 1px solid rgba(17,17,17,.08);
    border-radius: 26px;
    padding: 22px 22px 20px;
    box-shadow: 0 20px 50px rgba(17,17,17,.07);
  }
  .ra-stat::before {
    content: "";
    position: absolute;
    top: 18px;
    right: 18px;
    width: 42px;
    height: 42px;
    border-radius: 16px;
    background: #111111;
    box-shadow: inset 0 -4px 0 #e82127;
  }
  .ra-stat strong {
    display: block;
    font: 800 2.35rem "Fraunces", serif;
    color: #111111;
  }
  .ra-stat span {
    display: block;
    margin-top: 6px;
    color: #666666;
    font-weight: 700;
  }
  .ra-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(0, 1.16fr) minmax(360px, .84fr);
    margin-top: 22px;
  }
  .ra-card {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(17,17,17,.08);
    border-radius: 30px;
    padding: 24px;
    box-shadow: 0 22px 58px rgba(17,17,17,.08);
  }
  .ra-card-headline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  .ra-card-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: #e82127;
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .ra-card h2 {
    margin: 0;
    font: 800 1.45rem "Fraunces", serif;
    color: #111111;
  }
  .ra-card p {
    margin: 8px 0 0;
    color: #666666;
    line-height: 1.7;
    font-size: .92rem;
  }
  .ra-stack {
    display: grid;
    gap: 14px;
    margin-top: 18px;
  }
  .ra-director {
    border-radius: 22px;
    border: 1px solid rgba(17,17,17,.08);
    background: linear-gradient(180deg, #ffffff, #fbfbfa);
    padding: 18px;
  }
  .ra-director-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .ra-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: .78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .ra-badge.pending {
    background: #f5f5f4;
    border: 1px dashed rgba(17,17,17,.18);
    color: #111111;
  }
  .ra-badge.approved {
    background: #111111;
    color: #ffffff;
  }
  .ra-badge.rejected {
    background: #fee2e2;
    color: #e82127;
  }
  .ra-meta {
    display: grid;
    gap: 6px;
    margin-top: 14px;
    color: #666666;
    font-size: .9rem;
  }
  .ra-school {
    margin-top: 14px;
    padding: 14px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid #dededb;
  }
  .ra-school strong,
  .ra-director strong {
    color: #111111;
  }
  .ra-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .ra-empty {
    margin-top: 16px;
    padding: 16px 18px;
    border-radius: 18px;
    background: #f5f5f4;
    color: #111111;
  }
  .ra-school-list {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }
  .ra-school-item {
    border-radius: 20px;
    border: 1px solid rgba(17,17,17,.08);
    background: #ffffff;
    padding: 16px;
  }
  .ra-school-item strong {
    color: #111111;
  }
  .ra-school-item div {
    color: #666666;
    font-size: .9rem;
    line-height: 1.55;
  }
  .ra-assignment-help {
    margin: 14px 0 0;
    padding: 14px 16px;
    border-radius: 18px;
    background: #f5f5f4;
    border: 1px solid rgba(17,17,17,.08);
    color: #333333;
    font-size: .9rem;
    line-height: 1.6;
  }
  .ra-note {
    margin-top: 14px;
    padding: 14px 16px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid #dededb;
  }
  .ra-note strong {
    display: block;
    color: #111111;
    margin-bottom: 6px;
  }
  .ra-note p {
    margin: 0;
    font-size: .9rem;
    line-height: 1.6;
  }
  .ra-note span {
    display: block;
    margin-top: 8px;
    color: #5d6f84;
    font-size: .82rem;
  }
  .ra-history {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(17,17,17,.08);
  }
  .ra-history h3 {
    margin: 0;
    font: 800 1.05rem "Fraunces", serif;
    color: #111111;
  }
  .ra-history p {
    margin-top: 6px;
  }
  .ra-form {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }
  .ra-input,
  .ra-select {
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(17,17,17,.14);
    background: #fff;
    color: #111111;
    font: inherit;
    box-sizing: border-box;
  }
  .ra-input:focus,
  .ra-select:focus {
    outline: none;
    border-color: #111111;
    box-shadow: 0 0 0 3px rgba(232,33,39,.1);
  }
  @media (max-width: 960px) {
    .ra-top,
    .ra-stats,
    .ra-grid {
      grid-template-columns: 1fr;
    }
    .ra-command-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 680px) {
    .ra-root { padding: 16px 12px 32px; }
    .ra-top { padding: 20px; border-radius: 26px; }
    .ra-title { font-size: 2.1rem; }
    .ra-command-grid { grid-template-columns: 1fr; }
    .ra-actions .ra-btn { width: 100%; }
  }
  .ra-top .ra-title {
    color: #ffffff !important;
    font-family: "Fraunces", serif !important;
    text-shadow: 0 18px 38px rgba(0,0,0,.32);
  }
  .ra-top .ra-copy,
  .ra-top .ra-command-user span,
  .ra-top .ra-command-title,
  .ra-top .ra-command-chip span {
    color: rgba(255,255,255,.72) !important;
  }
  .ra-top .ra-kicker {
    color: #111111 !important;
    background: #ffffff !important;
    border-color: rgba(255,255,255,.24) !important;
  }
  .ra-top .ra-btn.primary {
    background: #ffffff !important;
    color: #111111 !important;
  }
  .ra-top .ra-btn.secondary {
    background: rgba(255,255,255,.1) !important;
    color: #ffffff !important;
    border-color: rgba(255,255,255,.18) !important;
  }
`

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
  const [savingId, setSavingId] = useState('')
  const [creatingSchool, setCreatingSchool] = useState(false)
  const [assigningSchoolId, setAssigningSchoolId] = useState('')
  const [assignmentMessages, setAssignmentMessages] = useState({})
  const [schoolForm, setSchoolForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    director: '',
  })
  const [directorAssignments, setDirectorAssignments] = useState({})
  const [overview, setOverview] = useState({
    stats: { schools: 0, directors: 0, pending_directors: 0 },
    directors: [],
    schools: [],
    panel_notifications: [],
  })

  async function loadOverview() {
    setLoading(true)
    try {
      const data = await fetchSuperAdminOverview()
      setOverview(data)
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el panel absoluto.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  async function handleStatusChange(profileId, action) {
    setSavingId(`${profileId}:${action}`)
    try {
      await updateDirectorApproval(profileId, action)
      toast.success(action === 'approve' ? 'Solicitud aprobada.' : 'Solicitud rechazada.')
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la solicitud.')
    } finally {
      setSavingId('')
    }
  }

  async function handleCreateSchool(event) {
    event.preventDefault()

    if (!schoolForm.nombre.trim()) {
      toast.error('Escribe al menos el nombre del centro.')
      return
    }

    setCreatingSchool(true)
    try {
      await createSchool(schoolForm)
      toast.success('Centro educativo creado.')
      setSchoolForm({ nombre: '', direccion: '', telefono: '', email: '', director: '' })
      await loadOverview()
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el centro educativo.')
    } finally {
      setCreatingSchool(false)
    }
  }

  async function handleAssignDirector(schoolId) {
    const directorProfileId = directorAssignments[schoolId]
    if (!directorProfileId) {
      toast.error('Selecciona un director antes de asignar.')
      setAssignmentMessages((prev) => ({
        ...prev,
        [schoolId]: 'Selecciona un director para activar la asignacion.',
      }))
      return
    }

    setAssigningSchoolId(schoolId)
    setAssignmentMessages((prev) => ({
      ...prev,
      [schoolId]: 'Asignando director al centro...',
    }))
    try {
      const result = await assignDirectorToSchool(schoolId, directorProfileId)
      toast.success('Director asignado y aprobado para el centro.')
      const directorName = result?.director_name || 'El director'
      const storageNote = result?.profile_update_applied
        ? 'Perfil y acceso actualizados.'
        : 'Acceso actualizado en Authentication; falta aplicar la migracion de profiles para guardar school_id en tabla.'
      setAssignmentMessages((prev) => ({
        ...prev,
        [schoolId]: `${directorName} ya puede entrar con este centro. ${storageNote}`,
      }))
      setDirectorAssignments((prev) => ({ ...prev, [schoolId]: '' }))
      await loadOverview()
    } catch (error) {
      const message = error.message || 'No se pudo asignar el director.'
      toast.error(message)
      setAssignmentMessages((prev) => ({
        ...prev,
        [schoolId]: message,
      }))
    } finally {
      setAssigningSchoolId('')
    }
  }

  const pendingDirectors = useMemo(
    () => overview.directors.filter((item) => item.approval_status === 'pending'),
    [overview.directors],
  )
  const reviewedDirectors = useMemo(
    () =>
      overview.directors.filter((item) => {
        const status = String(item.approval_status || '').toLowerCase()
        return ['approved', 'rejected'].includes(status) && !isSuperAdminEmail(item.email)
      }),
    [overview.directors],
  )
  const assignableDirectors = useMemo(
    () =>
      overview.directors.filter((item) => {
        const status = String(item.approval_status || '').toLowerCase()
        return item.auth_exists !== false && ['pending', 'approved'].includes(status) && !isSuperAdminEmail(item.email)
      }),
    [overview.directors],
  )

  return (
    <>
      <style>{styles}</style>
      <div className="ra-root">
        <div className="ra-wrap">
          <div className="ra-top">
            <div className="ra-hero-main">
              <div className="ra-brand-line">
                <BrandLogo subtitle="Control absoluto" size={42} />
                <div className="ra-kicker">
                  <span className="ra-kicker-dot" />
                  Panel maestro
                </div>
              </div>
              <h1 className="ra-title">Centro de mando para directores y centros.</h1>
              <p className="ra-copy">
                Consola exclusiva para autorizar accesos directivos, registrar centros educativos,
                revisar historial de solicitudes y mantener el control institucional de QHere.
              </p>

              <div className="ra-actions">
                <button className="ra-btn primary" onClick={loadOverview} type="button">
                  Recargar datos
                </button>
                <button className="ra-btn secondary" onClick={() => navigate('/login')} type="button">
                  Ir al acceso
                </button>
                <button className="ra-btn secondary" onClick={signOut} type="button">
                  Cerrar sesion
                </button>
              </div>
            </div>

            <aside className="ra-command">
              <p className="ra-command-title">Sesion administrativa</p>
              <div className="ra-command-user">
                <strong>{profile?.full_name || 'Super admin'}</strong>
                <span>{profile?.email || 'Cuenta absoluta'}</span>
              </div>
              <div className="ra-command-grid">
                <div className="ra-command-chip">
                  <span>Centros</span>
                  <strong>{loading ? '--' : overview.stats.schools}</strong>
                </div>
                <div className="ra-command-chip">
                  <span>Directores</span>
                  <strong>{loading ? '--' : overview.stats.directors}</strong>
                </div>
                <div className="ra-command-chip">
                  <span>Pendientes</span>
                  <strong>{loading ? '--' : overview.stats.pending_directors}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className="ra-grid">
            <section className="ra-card">
              <div className="ra-card-headline">
                <div>
                  <div className="ra-card-eyebrow">Bandeja de aprobacion</div>
                  <h2>Solicitudes de direccion</h2>
                  <p>Aprueba o rechaza nuevos directores antes de que puedan operar su centro.</p>
                </div>
                <div className="ra-badge pending">{pendingDirectors.length} pendientes</div>
              </div>

              {loading ? (
                <div className="ra-empty">Cargando solicitudes...</div>
              ) : pendingDirectors.length === 0 ? (
                <div className="ra-empty">No hay solicitudes pendientes en este momento.</div>
              ) : (
                <div className="ra-stack">
                  {pendingDirectors.map((item) => (
                    <article className="ra-director" key={item.id}>
                      <div className="ra-director-head">
                        <div>
                          <strong>{item.full_name}</strong>
                          <div className={`ra-badge ${item.approval_status}`}>
                            {item.approval_status === 'pending' ? 'Pendiente' : item.approval_status}
                          </div>
                        </div>
                        <span>{formatDate(item.approval_requested_at || item.created_at)}</span>
                      </div>

                      <div className="ra-meta">
                        <span>{item.email}</span>
                        <span>{item.phone || 'Sin telefono registrado'}</span>
                      </div>

                      <div className="ra-school">
                        <strong>{item.school?.nombre || 'Centro sin datos'}</strong>
                        <div>{item.school?.email || 'Sin correo institucional'}</div>
                        <div>{item.school?.direccion || 'Sin direccion registrada'}</div>
                      </div>

                      <div className="ra-row">
                        <button
                          className="ra-btn success"
                          disabled={savingId === `${item.id}:approve`}
                          onClick={() => handleStatusChange(item.id, 'approve')}
                          type="button"
                        >
                          {savingId === `${item.id}:approve` ? 'Aprobando...' : 'Aprobar'}
                        </button>
                        <button
                          className="ra-btn danger"
                          disabled={savingId === `${item.id}:reject`}
                          onClick={() => handleStatusChange(item.id, 'reject')}
                          type="button"
                        >
                          {savingId === `${item.id}:reject` ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="ra-history">
                <h3>Historial de solicitudes</h3>
                <p>Las solicitudes rechazadas se quedan visibles aqui. Si el director reenvia el formulario, vuelven automaticamente a pendiente.</p>
                {reviewedDirectors.length === 0 ? (
                  <div className="ra-empty">Aun no hay solicitudes aprobadas o rechazadas.</div>
                ) : (
                  <div className="ra-stack">
                    {reviewedDirectors.slice(0, 6).map((item) => (
                      <article className="ra-director" key={`${item.id}:history`}>
                        <div className="ra-director-head">
                          <div>
                            <strong>{item.full_name}</strong>
                            <div className={`ra-badge ${item.approval_status}`}>
                              {item.approval_status === 'rejected' ? 'Rechazada' : 'Aprobada'}
                            </div>
                          </div>
                          <span>{formatDate(item.approved_at || item.created_at)}</span>
                        </div>
                        <div className="ra-meta">
                          <span>{item.email}</span>
                          <span>{item.school?.nombre || 'Sin centro vinculado visible'}</span>
                          {item.approval_status === 'rejected' ? <span>Puede reenviar la solicitud desde el registro directivo.</span> : null}
                          {item.approval_note ? <span>Nota: {item.approval_note}</span> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="ra-card">
              <div className="ra-card-headline">
                <div>
                  <div className="ra-card-eyebrow">Gestion de centros</div>
                  <h2>Centros recientes</h2>
                  <p>Registra centros, revisa estado y vincula directores autorizados.</p>
                </div>
              </div>
              <div className="ra-assignment-help">
                Si un director ve el mensaje de centro no asignado, selecciona su cuenta aqui y pulsa
                Asignar. Esta accion tambien aprueba el acceso y guarda el centro en su perfil.
              </div>
              {assignableDirectors.length === 0 ? (
                <div className="ra-assignment-help" role="status">
                  No hay directores pendientes o aprobados disponibles para asignar. Si rechazaste uno, debe reenviar la solicitud.
                </div>
              ) : null}

              <form className="ra-form" onSubmit={handleCreateSchool}>
                <input
                  className="ra-input"
                  onChange={(event) => setSchoolForm((prev) => ({ ...prev, nombre: event.target.value }))}
                  placeholder="Nombre del centro educativo"
                  value={schoolForm.nombre}
                />
                <input
                  className="ra-input"
                  onChange={(event) => setSchoolForm((prev) => ({ ...prev, direccion: event.target.value }))}
                  placeholder="Direccion"
                  value={schoolForm.direccion}
                />
                <input
                  className="ra-input"
                  onChange={(event) => setSchoolForm((prev) => ({ ...prev, telefono: event.target.value }))}
                  placeholder="Telefono"
                  value={schoolForm.telefono}
                />
                <input
                  className="ra-input"
                  onChange={(event) => setSchoolForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Correo institucional"
                  type="email"
                  value={schoolForm.email}
                />
                <button className="ra-btn primary" disabled={creatingSchool} type="submit">
                  {creatingSchool ? 'Creando centro...' : 'Registrar centro'}
                </button>
              </form>

              {loading ? (
                <div className="ra-empty">Cargando centros...</div>
              ) : overview.schools.length === 0 ? (
                <div className="ra-empty">Todavia no hay centros registrados.</div>
              ) : (
                <div className="ra-school-list">
                  {overview.schools.slice(0, 8).map((school) => (
                    <div className="ra-school-item" key={school.id}>
                      <strong>{school.nombre}</strong>
                      <div>{school.director || 'Director pendiente'}</div>
                      <div>{school.email || 'Sin correo institucional'}</div>
                      <div>{school.configurado ? 'Configurado' : 'Pendiente de configuracion'}</div>
                      {assignmentMessages[school.id] ? (
                        <div className="ra-assignment-help" role="status">
                          {assignmentMessages[school.id]}
                        </div>
                      ) : null}
                      <div className="ra-row">
                        <select
                          className="ra-select"
                          onChange={(event) => setDirectorAssignments((prev) => ({ ...prev, [school.id]: event.target.value }))}
                          value={directorAssignments[school.id] || ''}
                        >
                          <option value="">Asignar director al centro</option>
                          {assignableDirectors.map((director) => (
                            <option key={director.id} value={director.id}>
                              {director.full_name} - {director.email}
                              {' - '}
                              {director.approval_status === 'pending' ? 'pendiente' : 'aprobado'}
                            </option>
                          ))}
                        </select>
                        <button
                          className="ra-btn secondary"
                          disabled={assigningSchoolId === school.id || assignableDirectors.length === 0}
                          onClick={() => handleAssignDirector(school.id)}
                          type="button"
                        >
                          {assigningSchoolId === school.id ? 'Asignando...' : 'Asignar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="ra-empty" style={{ marginTop: 18 }}>
                Sesion activa: <strong>{profile?.email || 'superadmin'}</strong>
              </div>

              <div className="ra-empty" style={{ marginTop: 18 }}>
                Notificaciones internas del panel
              </div>

              {overview.panel_notifications.length === 0 ? (
                <div className="ra-empty">No hay alertas internas pendientes para esta cuenta.</div>
              ) : (
                <div className="ra-school-list">
                  {overview.panel_notifications.map((item) => (
                    <div className="ra-note" key={item.id}>
                      <strong>{item.subject || 'Notificacion interna'}</strong>
                      <p>{item.payload?.message || item.payload?.body || 'Sin contenido adicional.'}</p>
                      <span>{formatDate(item.created_at || item.scheduled_for)}</span>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
