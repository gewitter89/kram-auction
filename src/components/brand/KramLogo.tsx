'use client'

import { useId } from 'react'

interface KramLogoProps {
  variant?: 'full' | 'icon' | 'dark'
  size?: number
  ariaLabel?: string
}

/**
 * KramLogo — K-Badge brand mark + wordmark.
 *
 * variant="full"  → mark + KRAM wordmark, for light backgrounds (#F8FAFC / white)
 * variant="dark"  → mark + KRAM wordmark, for dark backgrounds (#0B1220)
 * variant="icon"  → mark only (standalone badge)
 *
 * size controls the mark width/height in px (default 36).
 * Wordmark scales proportionally.
 */
export function KramLogo({ variant = 'full', size = 36, ariaLabel }: KramLogoProps) {
  // useId ensures unique SVG gradient IDs when multiple logos are on the same page
  const uid = useId().replace(/:/g, '')
  const gradId = `kg-${uid}`

  const isDark = variant === 'dark'
  const wordmarkColor = isDark ? '#FFFFFF' : '#0F172A'
  const subColor = isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'
  const wordmarkSize = Math.round(size * 0.65)
  const subSize = Math.max(9, Math.round(size * 0.28))
  const showSub = size >= 34

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? 'KRAM'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: `${Math.round(size * 0.27)}px` }}
    >
      {/* ── Brand mark: rounded-square badge with K letterform ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Deep navy → electric blue gradient — premium fintech look */}
          <linearGradient id={gradId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#0f172a" />
            <stop offset="52%"  stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Badge background */}
        <rect x="0" y="0" width="44" height="44" rx="11" fill={`url(#${gradId})`} />

        {/* Inner border — subtle premium depth */}
        <rect
          x="0.5" y="0.5" width="43" height="43" rx="10.5"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* K letterform — white, geometric, filled paths */}
        {/* Left vertical stem */}
        <rect x="10" y="10" width="5" height="24" rx="2.5" fill="white" />

        {/* Upper arm: mid-stem → top-right */}
        <path d="M14.5 22 L31 10 L31 15 L17 22.5 Z" fill="white" />

        {/* Lower arm: mid-stem → bottom-right */}
        <path d="M14.5 22.5 L31 34 L26 34 L14.5 24.5 Z" fill="white" />

        {/* Live/bid accent dot — lime green, top-right corner */}
        {/* Soft glow ring */}
        <circle cx="34.5" cy="9.5" r="5"   fill="rgba(132,204,22,0.22)" />
        {/* Main dot */}
        <circle cx="34.5" cy="9.5" r="3.5" fill="#84cc16" />
        {/* Specular highlight */}
        <circle cx="33.3" cy="8.3" r="1.2" fill="rgba(255,255,255,0.55)" />
      </svg>

      {/* ── Wordmark ── */}
      {variant !== 'icon' && (
        <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: `${wordmarkSize}px`,
              letterSpacing: '-0.03em',
              color: wordmarkColor,
              lineHeight: 1,
            }}
          >
            KRAM
          </span>
          {showSub && (
            <span
              style={{
                fontWeight: 500,
                fontSize: `${subSize}px`,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: subColor,
                lineHeight: 1,
                marginTop: '3px',
              }}
            >
              auction
            </span>
          )}
        </span>
      )}
    </span>
  )
}
