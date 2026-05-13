import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import DirectorRegister from './pages/DirectorRegister'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ResetPassword from './pages/ResetPassword'

// Estudiante
import StudentDashboard from './pages/student/StudentDashboard'
import MyExcuses from './pages/student/MyExcuses'

// Padre
import ParentDashboard from './pages/parent/ParentDashboard'
import SendExcuse from './pages/parent/SendExcuse'
import ExcuseHistory from './pages/parent/ExcuseHistory'

// Docente
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ExcuseInbox from './pages/teacher/ExcuseInbox'
import StudentAbsences from './pages/teacher/StudentAbsences'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageTeachers from './pages/admin/ManageTeachers'
import ManageParents from './pages/admin/ManageParents'
import SchoolSetup from './pages/admin/SchoolSetup'
import AdminExcuses from './pages/admin/adminExcuses'

import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Pública */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/director/register" element={<DirectorRegister />} />

      <Route path="/super-admin" element={<ProtectedRoute superAdmin />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
      </Route>

      {/* Estudiante */}
      <Route path="/student" element={<ProtectedRoute role="student" />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-excuses" element={<MyExcuses />} />
      </Route>

      {/* Padre */}
      <Route path="/parent" element={<ProtectedRoute role="parent" />}>
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="send-excuse" element={<SendExcuse />} />
        <Route path="history" element={<ExcuseHistory />} />
      </Route>

      {/* Docente */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="inbox" element={<ExcuseInbox />} />
        <Route path="absences" element={<StudentAbsences />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route path="setup" element={<Navigate to="/admin/center" replace />} />
        <Route path="center" element={<SchoolSetup />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="parents" element={<ManageParents />} />
        <Route path="excuses" element={<AdminExcuses />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
