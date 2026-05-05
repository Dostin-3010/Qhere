/* eslint-disable react-refresh/only-export-components */

const tones = {
  blue: {
    border: 'rgba(17, 17, 17, 0.12)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,245,244,0.98) 100%)',
    avatarBackground: '#111111',
    avatarShadow: '0 12px 24px rgba(17, 17, 17, 0.16)',
    avatarRing: 'rgba(232, 33, 39, 0.12)',
    title: '#111111',
    subtitle: '#666666',
    metaBackground: '#f5f5f4',
    metaColor: '#111111',
  },
  emerald: {
    border: 'rgba(17, 17, 17, 0.12)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,245,244,0.98) 100%)',
    avatarBackground: '#111111',
    avatarShadow: '0 12px 24px rgba(17, 17, 17, 0.16)',
    avatarRing: 'rgba(232, 33, 39, 0.12)',
    title: '#111111',
    subtitle: '#666666',
    metaBackground: '#f5f5f4',
    metaColor: '#111111',
  },
  amber: {
    border: 'rgba(17, 17, 17, 0.12)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,245,244,0.98) 100%)',
    avatarBackground: '#111111',
    avatarShadow: '0 12px 24px rgba(17, 17, 17, 0.16)',
    avatarRing: 'rgba(232, 33, 39, 0.12)',
    title: '#111111',
    subtitle: '#666666',
    metaBackground: '#fff1f1',
    metaColor: '#e82127',
  },
}

export function getIdentityInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?'
}

export default function IdentityBubble({
  name,
  subtitle,
  meta,
  tone = 'blue',
  compact = false,
}) {
  const palette = tones[tone] || tones.blue
  const initials = getIdentityInitials(name)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 10 : 12,
        minWidth: 0,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: compact ? 16 : 18,
        border: `1px solid ${palette.border}`,
        background: palette.background,
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: compact ? 38 : 42,
          height: compact ? 38 : 42,
          borderRadius: compact ? 14 : 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: palette.avatarBackground,
          color: '#fff',
          fontSize: compact ? 12 : 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          boxShadow: palette.avatarShadow,
          outline: `6px solid ${palette.avatarRing}`,
          outlineOffset: -2,
        }}
      >
        {initials}
      </div>

      <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
        <div
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 700,
            color: palette.title,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name || 'Sin nombre'}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: compact ? 11 : 12,
              fontWeight: 500,
              color: palette.subtitle,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {meta ? (
          <div
            style={{
              width: 'fit-content',
              maxWidth: '100%',
              padding: '3px 8px',
              borderRadius: 999,
              background: palette.metaBackground,
              color: palette.metaColor,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  )
}
