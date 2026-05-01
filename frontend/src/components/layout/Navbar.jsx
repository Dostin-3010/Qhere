import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between rounded-[22px] border border-[#dededb] bg-white px-6 py-4 text-[#111111] shadow-[0_18px_44px_rgba(17,17,17,0.08)]">
      <BrandLogo compact size={34} titleColor="#111111" subtitleColor="#666666" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#666666]">{profile?.full_name}</span>
        <button
          onClick={handleSignOut}
          className="rounded-xl border border-[#111111] bg-[#111111] px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-black"
        >
          Cerrar sesion
        </button>
      </div>
    </nav>
  )
}
