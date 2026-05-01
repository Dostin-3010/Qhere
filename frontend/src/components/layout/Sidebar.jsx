import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = {
  parent: [
    { to: '/parent/dashboard', label: 'Inicio' },
    { to: '/parent/send-excuse', label: 'Enviar excusa' },
    { to: '/parent/history', label: 'Historial' },
  ],
  teacher: [
    { to: '/teacher/dashboard', label: 'Inicio' },
    { to: '/teacher/inbox', label: 'Bandeja' },
    { to: '/teacher/absences', label: 'Ausencias' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Inicio' },
    { to: '/admin/students', label: 'Estudiantes' },
    { to: '/admin/teachers', label: 'Docentes' },
    { to: '/admin/parents', label: 'Padres' },
  ],
}

export default function Sidebar() {
  const { profile } = useAuth()
  const roleLinks = links[profile?.role] || []

  return (
    <aside className="flex min-h-screen w-64 flex-col rounded-r-[26px] border-r border-white/10 bg-[linear-gradient(180deg,#09090b,#18181b)] px-4 py-6 text-white shadow-[24px_0_56px_rgba(17,17,17,0.22)]">
      <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/38">Menu</p>
      <nav className="flex flex-col gap-1">
        {roleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-white/12 text-white shadow-[inset_3px_0_0_#e82127]'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
