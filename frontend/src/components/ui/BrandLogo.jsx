function LogoMark({ size = 36 }) {
  return (
    <span
      className="qh-brand-mark"
      style={{
        position: 'relative',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: Math.max(10, Math.round(size * 0.28)),
        display: 'grid',
        placeItems: 'center',
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: 'inset 0 -3px 0 #e82127',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <svg width={Math.round(size * 0.56)} height={Math.round(size * 0.56)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.2" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" fill="currentColor" />
        <rect x="14" y="14" width="3" height="3" rx="0.6" fill="currentColor" />
        <rect x="18" y="14" width="3" height="3" rx="0.6" fill="currentColor" />
        <rect x="14" y="18" width="3" height="3" rx="0.6" fill="currentColor" />
        <rect x="18" y="18" width="3" height="3" rx="0.6" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function BrandLogo({
  subtitle,
  size = 36,
  titleColor = '#ffffff',
  subtitleColor = 'rgba(255,255,255,0.58)',
  compact = false,
}) {
  return (
    <span
      className="qh-brand-logo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 8 : 10,
        minWidth: 0,
      }}
    >
      <LogoMark size={size} />
      <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <strong
          style={{
            color: titleColor,
            fontFamily: '"Fraunces", "Playfair Display", serif',
            fontSize: compact ? 18 : 22,
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          QHere
        </strong>
        {subtitle ? (
          <span
            style={{
              color: subtitleColor,
              fontSize: compact ? 10 : 11,
              fontWeight: 600,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  )
}
