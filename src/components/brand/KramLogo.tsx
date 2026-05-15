interface KramLogoProps {
  variant?: 'full' | 'icon' | 'dark'
  size?: number
}

export function KramLogo({ variant = 'full', size = 36 }: KramLogoProps) {
  const isDark = variant === 'dark'
  const shieldFill = isDark ? '#FFFFFF' : '#0B1220'
  const letterColor = isDark ? '#0B1220' : '#FFFFFF'
  const textColor = isDark ? 'white' : '#0B1220'
  const wordmarkSize = Math.round(size * 0.65)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kramShield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shieldFill} stopOpacity="1"/>
            <stop offset="100%" stopColor={shieldFill} stopOpacity="0.92"/>
          </linearGradient>
        </defs>
        {/* Shield with refined geometry */}
        <path
          d="M18 2.5L5 7.5C5 7.5 5 13 5 17C5 24.5 10.5 30.5 18 33C25.5 30.5 31 24.5 31 17C31 13 31 7.5 31 7.5L18 2.5Z"
          fill="url(#kramShield)"
        />
        {/* K letter - vertical stroke (cleaner, thicker) */}
        <path
          d="M13.5 11.5V24.5"
          stroke={letterColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* K - lower diagonal */}
        <path
          d="M13.5 18L19.5 24.5"
          stroke={letterColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* K - upper diagonal as bid arrow (blue accent) */}
        <path
          d="M13.5 18L21 11.5"
          stroke="#2563EB"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrow tip */}
        <path
          d="M17.5 11.5H21V15"
          stroke="#2563EB"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Premium yellow spark */}
        <circle cx="23.5" cy="9" r="1.8" fill="#FFD54A"/>
        <circle cx="23.5" cy="9" r="0.8" fill="#FFFFFF" opacity="0.6"/>
      </svg>
      {variant !== 'icon' && (
        <span style={{
          fontWeight: 800,
          fontSize: `${wordmarkSize}px`,
          letterSpacing: '-0.04em',
          color: textColor,
          lineHeight: 1
        }}>
          KRAM
        </span>
      )}
    </span>
  )
}
