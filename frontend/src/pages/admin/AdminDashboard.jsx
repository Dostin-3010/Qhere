import { Component, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .ad2-root {
    display: flex;
    min-height: 100vh;
    background:
      linear-gradient(90deg, rgba(20, 49, 45, 0.035) 1px, transparent 1px),
      linear-gradient(180deg, rgba(20, 49, 45, 0.035) 1px, transparent 1px),
      #F4F7F2;
    background-size: 32px 32px;
    color: #14312D;
    font-family: 'DM Sans', sans-serif;
  }

  .ad2-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #14312D;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    overflow-y: auto;
  }

  .ad2-sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(184, 212, 232, 0.12);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ad2-sidebar-logo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #C9A24B;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ad2-sidebar-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }

  .ad2-sidebar-logo-text span {
    color: #C9A24B;
  }

  .ad2-sidebar-section {
    padding: 20px 12px 8px;
  }

  .ad2-sidebar-section-label {
    font-size: 10px;
    font-weight: 800;
    color: rgba(184, 212, 232, 0.45);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 0 8px;
    margin-bottom: 8px;
  }

  .ad2-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: none;
    background: none;
    color: rgba(247, 251, 244, 0.72);
    border-radius: 8px;
    padding: 11px 12px;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ad2-nav-item:hover,
  .ad2-nav-item.active {
    background: rgba(255, 255, 255, 0.1);
    color: #F7FBF4;
  }

  .ad2-sidebar-bottom {
    margin-top: auto;
    padding: 16px 12px;
    border-top: 1px solid rgba(184, 212, 232, 0.12);
  }

  .ad2-main {
    flex: 1;
    margin-left: 240px;
    min-height: 100vh;
    padding: 32px;
    overflow-x: hidden;
  }

  .ad2-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .ad2-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #14312D;
  }

  .ad2-page-sub {
    font-size: 14px;
    color: #587267;
    margin-top: 4px;
  }

  .ad2-date {
    border: 1px solid #d8eaf4;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #31516f;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .ad2-banner {
    display: grid;
    gap: 8px;
    margin-bottom: 20px;
    padding: 18px 20px;
    border-radius: 10px;
    background: #14312D;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 18px 46px rgba(20, 49, 45, 0.16);
  }

  .ad2-banner strong {
    font-size: 15px;
    color: #F7FBF4;
  }

  .ad2-banner p {
    margin: 0;
    color: rgba(247,251,244,0.76);
    font-size: 13px;
    line-height: 1.55;
  }

  .ad2-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }

  .ad2-stat-card {
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 14px 34px rgba(20, 49, 45, 0.07);
  }

  .ad2-stat-label {
    font-size: 12px;
    font-weight: 700;
    color: #6A7F72;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
  }

  .ad2-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: #14312D;
    line-height: 1;
    margin-bottom: 8px;
  }

  .ad2-stat-sub {
    font-size: 13px;
    color: #587267;
  }

  .ad2-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
    gap: 18px;
    align-items: start;
  }

  .ad2-stack {
    display: grid;
    gap: 18px;
  }

  .ad2-card {
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    box-shadow: 0 14px 34px rgba(20, 49, 45, 0.07);
    overflow: hidden;
  }

  .ad2-card-head {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #EEF2EA;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .ad2-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #14312D;
  }

  .ad2-card-sub {
    font-size: 12px;
    color: #6A7F72;
    margin-top: 3px;
  }

  .ad2-card-body {
    padding: 18px 20px 20px;
  }

  .ad2-empty {
    padding: 24px 12px;
    text-align: center;
    color: #7a98b4;
    font-size: 13px;
  }

  .ad2-week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
  }

  .ad2-week-col {
    display: grid;
    gap: 8px;
    justify-items: center;
  }

  .ad2-week-day {
    font-size: 11px;
    font-weight: 700;
    color: #6d8ba6;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ad2-week-track {
    width: 100%;
    min-height: 156px;
    border-radius: 10px;
    background: linear-gradient(180deg, #FAFCF8 0%, #EEF2EA 100%);
    border: 1px solid #D8E3D4;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    padding: 14px 10px 12px;
  }

  .ad2-week-bar {
    width: 18px;
    border-radius: 999px;
    min-height: 4px;
  }

  .ad2-week-bar.present {
    background: linear-gradient(180deg, #C9A24B 0%, #8E6D24 100%);
  }

  .ad2-week-bar.absent {
    background: linear-gradient(180deg, #DDE8D8 0%, #B9CCB2 100%);
  }

  .ad2-week-total {
    font-size: 11px;
    font-weight: 700;
    color: #4a6a8a;
  }

  .ad2-list {
    display: grid;
    gap: 10px;
  }

  .ad2-item {
    display: grid;
    gap: 6px;
    padding: 14px 16px;
    border-radius: 8px;
    background: #F7FAF5;
    border: 1px solid #D8E3D4;
  }

  .ad2-item-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
  }

  .ad2-item-title {
    font-size: 14px;
    font-weight: 700;
    color: #14312D;
  }

  .ad2-item-sub {
    font-size: 12px;
    color: #587267;
    line-height: 1.45;
  }

  .ad2-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .ad2-badge.pending {
    color: #92400e;
    background: #fef3c7;
  }

  .ad2-badge.approved {
    color: #166534;
    background: #dcfce7;
  }

  .ad2-badge.rejected {
    color: #991b1b;
    background: #fee2e2;
  }

  .ad2-action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .ad2-action-btn {
    border: 1px solid #D8E3D4;
    background: linear-gradient(180deg, #ffffff, #F7FAF5);
    border-radius: 10px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .ad2-action-btn:hover {
    transform: translateY(-2px);
    border-color: #B9CCB2;
    box-shadow: 0 18px 34px rgba(20, 49, 45, 0.1);
  }

  .ad2-action-title {
    font-size: 14px;
    font-weight: 700;
    color: #14312D;
    margin-bottom: 4px;
  }

  .ad2-action-sub {
    font-size: 12px;
    color: #587267;
    line-height: 1.45;
  }

  .ad2-link-btn {
    border: none;
    background: none;
    color: #14312D;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }

  .ad2-loading {
    display: grid;
    place-items: center;
    min-height: 320px;
    color: #4a6a8a;
    font-size: 14px;
    font-weight: 600;
  }

  .ad2-error-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #F4F7F2;
    padding: 24px;
  }

  .ad2-error-card {
    width: min(560px, 100%);
    padding: 24px;
    border-radius: 10px;
    background: rgba(255,255,255,0.96);
    border: 1px solid #f3c4c4;
    color: #8b1e1e;
    box-shadow: 0 18px 40px rgba(16, 40, 71, 0.08);
  }

  @media (max-width: 1080px) {
    .ad2-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ad2-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 880px) {
    .ad2-root {
      display: block;
    }

    .ad2-sidebar {
      position: static;
      width: 100%;
    }

    .ad2-main {
      margin-left: 0;
      padding: 22px;
    }

    .ad2-topbar {
      flex-direction: column;
    }

    .ad2-stats-grid,
    .ad2-action-grid,
    .ad2-week-grid {
      grid-template-columns: 1fr;
    }

    .ad2-week-track {
      min-height: 92px;
    }
  }

  /* Tesla local override: keep admin dashboard aligned with the global skin. */
  .ad2-root {
    background:
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,245,244,.98)),
      linear-gradient(rgba(17,17,17,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.03) 1px, transparent 1px),
      #f5f5f4;
    background-size: auto, 48px 48px, 48px 48px, auto;
    color: #111111;
    font-family: "Sora", sans-serif;
  }
  .ad2-sidebar {
    background:
      linear-gradient(180deg, rgba(232,33,39,.12), transparent 24%),
      linear-gradient(180deg, #09090b 0%, #18181b 100%);
  }
  .ad2-sidebar-logo {
    border-bottom-color: rgba(255,255,255,.1);
  }
  .ad2-sidebar-logo-icon {
    background: #111111;
    border: 1px solid rgba(255,255,255,.16);
    box-shadow: inset 0 -3px 0 #e82127;
    color: #ffffff;
  }
  .ad2-sidebar-logo-icon svg rect {
    fill: currentColor;
  }
  .ad2-sidebar-logo-text,
  .ad2-page-title,
  .ad2-stat-value,
  .ad2-card-title,
  .ad2-item-title,
  .ad2-action-title {
    color: #111111;
    font-family: "Sora", sans-serif;
  }
  .ad2-sidebar-logo-text {
    color: #ffffff;
  }
  .ad2-sidebar-logo-text span {
    color: #ffffff;
  }
  .ad2-sidebar-section-label,
  .ad2-page-sub,
  .ad2-stat-label,
  .ad2-stat-sub,
  .ad2-card-sub,
  .ad2-item-sub,
  .ad2-action-sub,
  .ad2-empty,
  .ad2-week-day,
  .ad2-week-total {
    color: #666666;
  }
  .ad2-loading {
    min-height: 360px;
    place-items: stretch;
    color: #666666;
  }
  .ad2-loading-card {
    width: min(720px, 100%);
    align-self: center;
    justify-self: center;
    border: 1px solid #dededb;
    border-radius: 22px;
    background: rgba(255,255,255,.92);
    padding: 24px;
    box-shadow: 0 18px 44px rgba(17,17,17,.08);
  }
  .ad2-loading-title {
    color: #111111;
    font-weight: 800;
    margin-bottom: 8px;
  }
  .ad2-loading-sub {
    color: #666666;
    font-size: 13px;
    margin-bottom: 18px;
  }
  .ad2-loading-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .ad2-loading-line {
    height: 84px;
    border-radius: 16px;
    background: linear-gradient(90deg, #f5f5f4, #ffffff, #f5f5f4);
    background-size: 200% 100%;
    animation: ad2-shimmer 1.4s ease-in-out infinite;
    border: 1px solid #ececea;
  }
  @keyframes ad2-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  .ad2-sidebar-section-label {
    color: rgba(255,255,255,.42);
  }
  .ad2-nav-item {
    color: rgba(255,255,255,.68);
    border-radius: 12px;
  }
  .ad2-nav-item:hover,
  .ad2-nav-item.active {
    background: rgba(255,255,255,.08);
    box-shadow: inset 3px 0 0 #e82127;
    color: #ffffff;
  }
  .ad2-date,
  .ad2-stat-card,
  .ad2-card,
  .ad2-item,
  .ad2-action-btn,
  .ad2-week-track {
    background: rgba(255,255,255,.94);
    border-color: #dededb;
    box-shadow: 0 18px 44px rgba(17,17,17,.08);
  }
  .ad2-date {
    color: #111111;
  }
  .ad2-banner {
    background:
      linear-gradient(115deg, rgba(232,33,39,.14), transparent 36%),
      #111111;
    border-color: rgba(255,255,255,.12);
    box-shadow: 0 28px 70px rgba(17,17,17,.16);
  }
  .ad2-banner strong,
  .ad2-banner p {
    color: #ffffff;
  }
  .ad2-card-head {
    border-bottom-color: #dededb;
  }
  .ad2-week-bar.present,
  .ad2-week-bar.absent {
    background: #111111;
  }
  .ad2-badge.pending {
    background: #f5f5f4;
    color: #111111;
  }
  .ad2-badge.approved {
    background: #111111;
    color: #ffffff;
  }
  .ad2-badge.rejected {
    background: #e82127;
    color: #ffffff;
  }
  .ad2-action-btn:hover {
    border-color: #c9c9c5;
    box-shadow: 0 22px 48px rgba(17,17,17,.12);
  }
  .ad2-link-btn {
    color: #111111;
  }
  .ad2-error-shell {
    background: #f5f5f4;
  }
  .ad2-error-card {
    border-color: #e82127;
    color: #e82127;
    box-shadow: 0 18px 44px rgba(17,17,17,.08);
  }
`

const DIAS_SEMANA = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const IcoDash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IcoStudents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IcoTeacher = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IcoParents = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcoExcuse = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
const IcoSetup = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
const IcoLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

function normalizeExcuseStatus(status) {
  const map = {
    pendiente: 'pending',
    pending: 'pending',
    aprobada: 'approved',
    approved: 'approved',
    rechazada: 'rejected',
    rejected: 'rejected',
  }

  return map[status] || 'pending'
}

function formatShortDate(value) {
  if (!value) return 'Sin fecha'
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'
  return parsed.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

function formatTimestamp(value) {
  if (!value) return 'Sin fecha'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'
  return parsed.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
}

class AdminRouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Admin dashboard fatal render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ad2-error-shell">
          <style>{styles}</style>
          <div className="ad2-error-card">
            <strong style={{ display: 'block', marginBottom: 10 }}>
              El dashboard tuvo un error al renderizar.
            </strong>
            <div style={{ lineHeight: 1.6 }}>
              La ruta ya no deberia quedarse completamente en blanco. Recarga la pagina y vuelve a entrar.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function Sidebar({ profile, onSignOut }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', Icon: IcoDash },
    { label: 'Estudiantes', path: '/admin/students', Icon: IcoStudents },
    { label: 'Docentes', path: '/admin/teachers', Icon: IcoTeacher },
    { label: 'Padres', path: '/admin/parents', Icon: IcoParents },
    { label: 'Excusas', path: '/admin/excuses', Icon: IcoExcuse },
    { label: 'Centro', path: '/admin/center', Icon: IcoSetup },
  ]

  return (
    <aside className="ad2-sidebar">
      <div className="ad2-sidebar-logo">
        <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" />
      </div>

      <div className="ad2-sidebar-section">
        <div className="ad2-sidebar-section-label">Menu principal</div>
        {navItems.map(({ label, path, Icon }) => (
          <button
            key={path}
            type="button"
            className={`ad2-nav-item${location.pathname === path ? ' active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="ad2-sidebar-bottom">
        <AdminSidebarProfileCard
          profile={profile}
          roleLabel="Director"
          onSignOut={onSignOut}
          LogoutIcon={IcoLogout}
        />
      </div>
    </aside>
  )
}

function AdminDashboardPage() {
  const navigate = useNavigate()
  const { profile, activeSchoolId, signOut } = useAuth()

  const [loading, setLoading] = useState(true)
  const [school, setSchool] = useState(null)
  const [stats, setStats] = useState({ students: 0, teachers: 0, parents: 0, todayPresent: 0, todayTotal: 0 })
  const [chartData, setChartData] = useState([])
  const [excuses, setExcuses] = useState([])
  const [opsSummary, setOpsSummary] = useState({ queuedAlerts: 0, geoAlerts: 0, pendingDevices: 0 })
  const [watchlist, setWatchlist] = useState([])
  const [sectionsCount, setSectionsCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (!activeSchoolId) {
        if (cancelled) return
        setSchool(null)
        setStats({ students: 0, teachers: 0, parents: 0, todayPresent: 0, todayTotal: 0 })
        setChartData([])
        setExcuses([])
        setOpsSummary({ queuedAlerts: 0, geoAlerts: 0, pendingDevices: 0 })
        setWatchlist([])
        setSectionsCount(0)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('*')
          .eq('id', activeSchoolId)
          .maybeSingle()

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('grade_sections')
          .select('id, grado, seccion, turno')
          .eq('school_id', activeSchoolId)

        if (sectionsError) throw sectionsError

        const scopedSectionIds = new Set((sectionsData || []).map(section => section.id))
        const scopedSectionList = sectionsData || []

        const [
          { data: allStudents, error: studentsError },
          { data: teacherProfiles, error: teachersError },
        ] = await Promise.all([
          supabase.from('students').select('id, nombre, matricula, grade_section_id'),
          supabase.from('profiles').select('*').eq('role', 'teacher'),
        ])

        if (studentsError) throw studentsError
        if (teachersError) throw teachersError

        const scopedStudents = (allStudents || []).filter(student =>
          student.grade_section_id && scopedSectionIds.has(student.grade_section_id)
        )
        const schoolStudentIds = scopedStudents.map(student => student.id)

        const scopedTeachers = (teacherProfiles || []).filter(teacher =>
          Array.isArray(teacher?.secciones_ids) &&
          teacher.secciones_ids.some(sectionId => scopedSectionIds.has(sectionId))
        )

        const { data: parentLinks } = schoolStudentIds.length
          ? await supabase
              .from('parents')
              .select('profile_id, student_id')
              .in('student_id', schoolStudentIds)
          : { data: [] }

        const uniqueParentIds = new Set((parentLinks || []).map(link => link.profile_id).filter(Boolean))
        const todayDate = new Date().toISOString().split('T')[0]

        const { data: attendanceToday } = schoolStudentIds.length
          ? await supabase
              .from('attendance')
              .select('estado')
              .in('student_id', schoolStudentIds)
              .eq('fecha', todayDate)
          : { data: [] }

        const todayPresent = (attendanceToday || []).filter(item =>
          ['presente', 'tarde', 'justificado'].includes(item.estado)
        ).length

        const { data: excusesData, error: excusesError } = schoolStudentIds.length
          ? await supabase
              .from('excuses')
              .select('*')
              .in('student_id', schoolStudentIds)
              .order('created_at', { ascending: false })
              .limit(6)
          : { data: [], error: null }

        if (excusesError) throw excusesError

        const excusesWithStudents = (excusesData || []).map(excuse => {
          const student = scopedStudents.find(item => item.id === excuse.student_id) || null
          return {
            ...excuse,
            student,
            normalizedStatus: normalizeExcuseStatus(excuse.estado || excuse.status),
          }
        })

        const weekRows = []
        for (let i = 6; i >= 0; i -= 1) {
          const current = new Date()
          current.setDate(current.getDate() - i)
          const currentDate = current.toISOString().split('T')[0]
          const { data: dayAttendance } = schoolStudentIds.length
            ? await supabase
                .from('attendance')
                .select('estado')
                .in('student_id', schoolStudentIds)
                .eq('fecha', currentDate)
            : { data: [] }

          const present = (dayAttendance || []).filter(item =>
            ['presente', 'tarde', 'justificado'].includes(item.estado)
          ).length
          const absent = (dayAttendance || []).filter(item => item.estado === 'ausente').length

          weekRows.push({
            label: DIAS_SEMANA[current.getDay() === 0 ? 6 : current.getDay() - 1],
            present,
            absent,
            total: present + absent,
          })
        }

        let queuedAlerts = 0
        let geoAlerts = 0
        let pendingDevices = 0

        try {
          const { count } = await supabase
            .from('notification_queue')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')

          queuedAlerts = count ?? 0
        } catch (error) {
          console.warn('Notification queue not available:', error)
        }

        try {
          const { data } = await supabase
            .from('attendance_geo_events')
            .select('id, metadata')
            .order('captured_at', { ascending: false })
            .limit(20)

          geoAlerts = (data || []).filter(item => item.metadata?.outside_perimeter).length
        } catch (error) {
          console.warn('Attendance geo events not available:', error)
        }

        try {
          const { count } = await supabase
            .from('authorized_devices')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')

          pendingDevices = count ?? 0
        } catch (error) {
          console.warn('Authorized devices not available:', error)
        }

        let nextWatchlist = []
        try {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const startDate = thirtyDaysAgo.toISOString().split('T')[0]

          const [
            { data: attendanceWindow, error: attendanceError },
            { data: gradeRows, error: gradeRowsError },
          ] = await Promise.all([
            supabase.from('attendance').select('student_id, estado').gte('fecha', startDate),
            supabase
              .from('gradebook_entries')
              .select('student_id, score, max_score, status, students(nombre, matricula)')
              .neq('status', 'draft'),
          ])

          if (attendanceError) throw attendanceError
          if (gradeRowsError) throw gradeRowsError

          const validStudentIds = new Set(schoolStudentIds)
          const attendanceByStudent = {}
          ;(attendanceWindow || []).forEach(item => {
            if (!validStudentIds.has(item.student_id)) return
            const current = attendanceByStudent[item.student_id] || { total: 0, attended: 0 }
            current.total += 1
            if (['presente', 'tarde', 'justificado'].includes(item.estado)) current.attended += 1
            attendanceByStudent[item.student_id] = current
          })

          const gradesByStudent = {}
          ;(gradeRows || []).forEach(item => {
            if (!validStudentIds.has(item.student_id)) return
            const current = gradesByStudent[item.student_id] || { total: 0, sum: 0, student: item.students }
            const maxScore = Number(item.max_score) || 0
            const score = Number(item.score) || 0
            current.total += 1
            current.sum += maxScore > 0 ? (score / maxScore) * 100 : score
            if (!current.student && item.students) current.student = item.students
            gradesByStudent[item.student_id] = current
          })

          nextWatchlist = Object.entries(gradesByStudent)
            .map(([studentId, info]) => {
              const attendanceInfo = attendanceByStudent[studentId] || { total: 0, attended: 0 }
              const attendancePct = attendanceInfo.total > 0
                ? Math.round((attendanceInfo.attended / attendanceInfo.total) * 100)
                : null
              const average = info.total > 0 ? Math.round(info.sum / info.total) : null

              return {
                id: studentId,
                nombre: info.student?.nombre || 'Estudiante',
                matricula: info.student?.matricula || '--',
                average,
                attendancePct,
              }
            })
            .filter(item => (item.average !== null && item.average < 70) || (item.attendancePct !== null && item.attendancePct < 75))
            .sort((a, b) => (a.attendancePct ?? 100) - (b.attendancePct ?? 100) || (a.average ?? 100) - (b.average ?? 100))
            .slice(0, 5)
        } catch (error) {
          console.warn('Gradebook integration not available:', error)
        }

        if (cancelled) return

        setSchool(schoolData || null)
        setSectionsCount(scopedSectionList.length)
        setStats({
          students: schoolStudentIds.length,
          teachers: scopedTeachers.length,
          parents: uniqueParentIds.size,
          todayPresent,
          todayTotal: attendanceToday?.length ?? 0,
        })
        setChartData(weekRows)
        setExcuses(excusesWithStudents)
        setOpsSummary({ queuedAlerts, geoAlerts, pendingDevices })
        setWatchlist(nextWatchlist)
      } catch (error) {
        console.error('Error loading admin dashboard:', error)
        if (cancelled) return
        setSchool(null)
        setStats({ students: 0, teachers: 0, parents: 0, todayPresent: 0, todayTotal: 0 })
        setChartData([])
        setExcuses([])
        setOpsSummary({ queuedAlerts: 0, geoAlerts: 0, pendingDevices: 0 })
        setWatchlist([])
        setSectionsCount(0)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [activeSchoolId])

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    [],
  )

  const weekMax = Math.max(1, ...chartData.map(item => item.total || 0))
  const todayPct = stats.todayTotal > 0 ? Math.round((stats.todayPresent / stats.todayTotal) * 100) : 0

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ad2-root">
        <Sidebar profile={profile} onSignOut={handleSignOut} />

        <main className="ad2-main">
          <div className="ad2-topbar">
            <div>
              <div className="ad2-page-title">{school?.nombre || 'Panel de Administracion'}</div>
              <div className="ad2-page-sub">
                Bienvenido/a, {profile?.full_name?.split(' ')[0] || 'Director'}
              </div>
            </div>
            <div className="ad2-date">{todayLabel}</div>
          </div>

          {loading ? (
            <div className="ad2-loading">
              <div className="ad2-loading-card">
                <div className="ad2-loading-title">Preparando el panel</div>
                <div className="ad2-loading-sub">Estamos sincronizando estudiantes, docentes, asistencia y centro seleccionado.</div>
                <div className="ad2-loading-grid" aria-hidden="true">
                  <div className="ad2-loading-line" />
                  <div className="ad2-loading-line" />
                  <div className="ad2-loading-line" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="ad2-banner">
                <strong>
                  {school
                    ? `${school.nombre} esta vinculado al centro seleccionado.`
                    : 'No se pudo cargar el centro educativo.'}
                </strong>
                <p>
                  {activeSchoolId
                    ? `Se encontraron ${sectionsCount} secciones configuradas para este centro.`
                    : 'Debes iniciar sesion eligiendo un centro educativo valido.'}
                </p>
                {activeSchoolId && sectionsCount === 0 ? (
                  <p>
                    Todavia no hay grados o secciones creadas para este centro. Cargalos desde el modulo Centro educativo
                    antes de registrar estudiantes.
                  </p>
                ) : null}
              </div>

              <div className="ad2-stats-grid">
                {[
                  ['Estudiantes', stats.students, 'Registrados en este centro'],
                  ['Docentes', stats.teachers, 'Con secciones asignadas'],
                  ['Padres', stats.parents, 'Vinculados a estudiantes'],
                  ['Asistencia hoy', `${todayPct}%`, `${stats.todayPresent} de ${stats.todayTotal} registros`],
                ].map(([label, value, sub]) => (
                  <div key={label} className="ad2-stat-card">
                    <div className="ad2-stat-label">{label}</div>
                    <div className="ad2-stat-value">{value}</div>
                    <div className="ad2-stat-sub">{sub}</div>
                  </div>
                ))}
              </div>

              <div className="ad2-grid">
                <div className="ad2-stack">
                  <section className="ad2-card">
                    <div className="ad2-card-head">
                      <div>
                        <div className="ad2-card-title">Asistencia semanal</div>
                        <div className="ad2-card-sub">Ultimos 7 dias registrados</div>
                      </div>
                    </div>
                    <div className="ad2-card-body">
                      {chartData.length === 0 ? (
                        <div className="ad2-empty">Todavia no hay asistencias registradas para este centro.</div>
                      ) : (
                        <div className="ad2-week-grid">
                          {chartData.map(item => (
                            <div key={item.label} className="ad2-week-col">
                              <div className="ad2-week-day">{item.label}</div>
                              <div className="ad2-week-track">
                                <div
                                  className="ad2-week-bar absent"
                                  style={{ height: `${Math.max(4, (item.absent / weekMax) * 120)}px` }}
                                />
                                <div
                                  className="ad2-week-bar present"
                                  style={{ height: `${Math.max(4, (item.present / weekMax) * 120)}px` }}
                                />
                              </div>
                              <div className="ad2-week-total">{item.total} registros</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="ad2-card">
                    <div className="ad2-card-head">
                      <div>
                        <div className="ad2-card-title">Accesos rapidos</div>
                        <div className="ad2-card-sub">Gestion principal del centro</div>
                      </div>
                    </div>
                    <div className="ad2-card-body">
                      <div className="ad2-action-grid">
                        {[
                          ['Gestionar estudiantes', 'Crear, editar y emitir QR', '/admin/students'],
                          ['Gestionar docentes', 'Asignar permisos y secciones', '/admin/teachers'],
                          ['Gestionar padres', 'Vincular tutores con estudiantes', '/admin/parents'],
                          ['Centro educativo', 'Cursos, secciones, turnos y calendario', '/admin/center'],
                        ].map(([title, sub, path]) => (
                          <button
                            key={path}
                            type="button"
                            className="ad2-action-btn"
                            onClick={() => navigate(path)}
                          >
                            <div className="ad2-action-title">{title}</div>
                            <div className="ad2-action-sub">{sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>

                <div className="ad2-stack">
                  <section className="ad2-card">
                    <div className="ad2-card-head">
                      <div>
                        <div className="ad2-card-title">Excusas recientes</div>
                        <div className="ad2-card-sub">
                          {excuses.filter(item => item.normalizedStatus === 'pending').length} pendientes de revision
                        </div>
                      </div>
                      <button type="button" className="ad2-link-btn" onClick={() => navigate('/admin/excuses')}>
                        Ver todo
                      </button>
                    </div>
                    <div className="ad2-card-body">
                      {excuses.length === 0 ? (
                        <div className="ad2-empty">No hay excusas registradas todavia.</div>
                      ) : (
                        <div className="ad2-list">
                          {excuses.map(excuse => (
                            <div key={excuse.id} className="ad2-item">
                              <div className="ad2-item-top">
                                <div className="ad2-item-title">{excuse.student?.nombre || 'Estudiante'}</div>
                                <span className={`ad2-badge ${excuse.normalizedStatus}`}>
                                  {excuse.normalizedStatus === 'approved'
                                    ? 'Aprobada'
                                    : excuse.normalizedStatus === 'rejected'
                                      ? 'Rechazada'
                                      : 'Pendiente'}
                                </span>
                              </div>
                              <div className="ad2-item-sub">
                                {excuse.tipo_ausencia || excuse.excuse_type || 'Sin tipo'} · {formatShortDate(excuse.fecha_ausencia || excuse.absence_date)}
                              </div>
                              <div className="ad2-item-sub">
                                Creada el {formatTimestamp(excuse.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="ad2-card">
                    <div className="ad2-card-head">
                      <div>
                        <div className="ad2-card-title">Alertas operativas</div>
                        <div className="ad2-card-sub">Cola de notificaciones, geocercas y dispositivos</div>
                      </div>
                    </div>
                    <div className="ad2-card-body">
                      <div className="ad2-list">
                        <div className="ad2-item">
                          <div className="ad2-item-title">Alertas en cola</div>
                          <div className="ad2-item-sub">{opsSummary.queuedAlerts} pendientes de procesamiento.</div>
                        </div>
                        <div className="ad2-item">
                          <div className="ad2-item-title">Eventos fuera del perimetro</div>
                          <div className="ad2-item-sub">{opsSummary.geoAlerts} eventos detectados recientemente.</div>
                        </div>
                        <div className="ad2-item">
                          <div className="ad2-item-title">Dispositivos pendientes</div>
                          <div className="ad2-item-sub">{opsSummary.pendingDevices} esperando aprobacion.</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="ad2-card">
                    <div className="ad2-card-head">
                      <div>
                        <div className="ad2-card-title">Riesgo academico</div>
                        <div className="ad2-card-sub">Cruce de notas y asistencia disponible</div>
                      </div>
                    </div>
                    <div className="ad2-card-body">
                      {watchlist.length === 0 ? (
                        <div className="ad2-empty">No hay estudiantes en watchlist o faltan calificaciones integradas.</div>
                      ) : (
                        <div className="ad2-list">
                          {watchlist.map(student => (
                            <div key={student.id} className="ad2-item">
                              <div className="ad2-item-title">{student.nombre}</div>
                              <div className="ad2-item-sub">Matricula: {student.matricula}</div>
                              <div className="ad2-item-sub">
                                Promedio: {student.average ?? '--'}% · Asistencia: {student.attendancePct ?? '--'}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRouteErrorBoundary>
      <AdminDashboardPage />
    </AdminRouteErrorBoundary>
  )
}
