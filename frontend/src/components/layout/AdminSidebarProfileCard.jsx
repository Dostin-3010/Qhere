import { getIdentityInitials } from '../ui/IdentityBubble'

export default function AdminSidebarProfileCard({
  profile,
  roleLabel = 'Administrador',
  onSignOut,
  LogoutIcon,
}) {
  const initials = getIdentityInitials(profile?.full_name)
  const firstName = profile?.full_name || 'Administrador'

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        padding: 14,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: '#111111',
            color: '#f8fbff',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'inset 0 -3px 0 #e82127',
          }}
        >
          {initials}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.56)',
              marginBottom: 4,
            }}
          >
            {roleLabel}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {firstName}
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          title="Cerrar sesion"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: '1px solid rgba(232,33,39,0.55)',
            background: 'rgba(232,33,39,0.12)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {LogoutIcon ? <LogoutIcon /> : 'x'}
        </button>
      </div>

      <div
        style={{
          fontSize: 12,
          lineHeight: 1.45,
          color: 'rgba(255,255,255,0.64)',
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        Sesion administrativa activa
      </div>
    </div>
  )
}
