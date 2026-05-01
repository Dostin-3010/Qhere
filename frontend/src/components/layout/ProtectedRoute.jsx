import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isSuperAdminProfile } from '../../utils/access'
import { normalizeOptionalUuid } from '../../utils/schoolAccess'

export default function ProtectedRoute({ role, superAdmin = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (superAdmin && !isSuperAdminProfile(profile)) {
    return <Navigate to="/login" replace />
  }

  // Usar profile.role (columna real en DB), no profile.rol
  if (role && profile?.role !== role) return <Navigate to="/login" replace />

  if (
    role === 'admin' &&
    profile?.role === 'admin' &&
    !isSuperAdminProfile(profile) &&
    !normalizeOptionalUuid(profile.school_id)
  ) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
