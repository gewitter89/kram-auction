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
      className="group/logo inline-flex items-center transition-all duration-300 hover:scale-[1.02]"
      style={{ gap: `${Math.round(size * 0.27)}px` }}
    >
      {/* ── Brand mark: rounded-square badge with K letterform ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0 transition-all duration-300 group-hover/logo:shadow-[0_8px_24px_rgba(37,99,235,0.25)] group-hover/logo:scale-[1.05]"
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
        <rect
          x="0" y="0" width="44" height="44" rx="11"
          fill={`url(#${gradId})`}
          className="transition-all duration-300 group-hover/logo:brightness-110"
        />

        {/* Inner border — subtle premium depth */}
        <rect
          x="0.5" y="0.5" width="43" height="43" rx="10.5"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* K letterform — white, geometric, filled paths */}
        {/* Left vertical stem */}
        <rect
          x="10" y="10" width="5" height="24" rx="2.5"
          fill="white"
          className="transition-transform duration-300 group-hover/logo:translate-x-[0.5px]"
        />

        {/* Upper arm: mid-stem → top-right */}
        <path
          d="M14.5 22 L31 10 L31 15 L17 22.5 Z"
          fill="white"
          className="transition-transform duration-300 group-hover/logo:translate-y-[-0.5px] group-hover/logo:translate-x-[0.5px]"
        />

        {/* Lower arm: mid-stem → bottom-right */}
        <path
          d="M14.5 22.5 L31 34 L26 34 L14.5 24.5 Z"
          fill="white"
          className="transition-transform duration-300 group-hover/logo:translate-y-[0.5px] group-hover/logo:translate-x-[0.5px]"
        />

        {/* Live/bid accent dot — lime green, top-right corner */}
        {/* Soft glow ring with active ping */}
        <circle
          cx="34.5" cy="9.5" r="6.5"
          fill="rgba(132,204,22,0.35)"
          className="origin-[34.5px_9.5px] animate-ping"
        />
        <circle
          cx="34.5" cy="9.5" r="5"
          fill="rgba(132,204,22,0.22)"
        />
        {/* Main dot */}
        <circle cx="34.5" cy="9.5" r="3.5" fill="#84cc16" />
        {/* Specular highlight */}
        <circle cx="33.3" cy="8.3" r="1.2" fill="rgba(255,255,255,0.55)" />
      </svg>

      {/* ── Wordmark ── */}
      {variant !== 'icon' && (
        <span className="flex flex-col justify-center leading-none">
          <span
            className="font-extrabold tracking-[-0.03em] transition-all duration-300 group-hover/logo:text-[#2563EB] group-hover/logo:translate-x-[1px]"
            style={{
              fontSize: `${wordmarkSize}px`,
              color: wordmarkColor,
              lineHeight: 1,
            }}
          >
            KRAM
          </span>
          {showSub && (
            <span
              className="font-medium tracking-[0.1em] uppercase mt-[3px] transition-all duration-300 group-hover/logo:text-[#3B82F6] group-hover/logo:translate-x-[1.5px]"
              style={{
                fontSize: `${subSize}px`,
                color: subColor,
                lineHeight: 1,
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

