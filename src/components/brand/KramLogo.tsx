'use client'

import { useId } from 'react'

interface KramLogoProps {
  variant?: 'full' | 'icon' | 'dark'
  size?: number
  ariaLabel?: string
}

/**
 * KramLogo — Signature brand mark + wordmark.
 * Clean, premium, smooth transitions with zero aggressive loops.
 */
export function KramLogo({ variant = 'full', size = 36, ariaLabel }: KramLogoProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `kg-${uid}`

  const isDark = variant === 'dark'
  const wordmarkColor = isDark ? '#FFFFFF' : '#0F172A'
  const subColor = isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'
  const wordmarkSize = Math.round(size * 0.65)
  const subSize = Math.max(9, Math.round(size * 0.28))
  const showSub = size >= 34

  const shimmerCss = `
    @keyframes kramHoverSheen {
      0% {
        transform: translateX(-150%) skewX(-25deg);
      }
      100% {
        transform: translateX(150%) skewX(-25deg);
      }
    }
    @keyframes kramPulseLime {
      0%, 100% {
        transform: scale(1);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }
    .kram-metallic-sheen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
      transform: translateX(-150%) skewX(-25deg);
    }
    .group\\/logo:hover .kram-metallic-sheen {
      animation: kramHoverSheen 1.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .kram-pulse-ring {
      transform-origin: 34.5px 9.5px;
      animation: kramPulseLime 2s ease-in-out infinite;
    }
  `

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? 'KRAM'}
      className="group/logo inline-flex items-center transition-all duration-300 hover:scale-[1.015] cursor-pointer"
      style={{ gap: `${Math.round(size * 0.27)}px` }}
    >
      <style dangerouslySetInnerHTML={{ __html: shimmerCss }} />
      
      {/* ── Brand mark: rounded-square badge with K letterform ── */}
      <div className="relative overflow-hidden rounded-[11px] flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="transition-all duration-300 group-hover/logo:shadow-[0_8px_24px_rgba(37,99,235,0.2)] group-hover/logo:scale-[1.03]"
        >
          <defs>
            {/* Deep navy → royal blue → electric sky blue gradient */}
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
            className="transition-all duration-300 group-hover/logo:brightness-105"
          />

          {/* Inner border — subtle premium depth */}
          <rect
            x="0.5" y="0.5" width="43" height="43" rx="10.5"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          {/* K letterform — white, geometric, filled paths */}
          {/* Left vertical stem */}
          <rect
            x="10" y="10" width="5" height="24" rx="2.5"
            fill="white"
            className="transition-transform duration-500 group-hover/logo:translate-x-[0.5px]"
          />

          {/* Upper arm: mid-stem → top-right */}
          <path
            d="M14.5 22 L31 10 L31 15 L17 22.5 Z"
            fill="white"
            className="transition-transform duration-500 group-hover/logo:translate-y-[-0.2px] group-hover/logo:translate-x-[0.3px]"
          />

          {/* Lower arm: mid-stem → bottom-right */}
          <path
            d="M14.5 22.5 L31 34 L26 34 L14.5 24.5 Z"
            fill="white"
            className="transition-transform duration-500 group-hover/logo:translate-y-[0.2px] group-hover/logo:translate-x-[0.3px]"
          />

          {/* Live/bid accent dot — lime green, top-right corner */}
          <circle
            cx="34.5" cy="9.5" r="6.5"
            fill="rgba(132,204,22,0.35)"
            className="kram-pulse-ring"
          />
          <circle
            cx="34.5" cy="9.5" r="5"
            fill="rgba(132,204,22,0.2)"
          />
          {/* Main dot */}
          <circle cx="34.5" cy="9.5" r="3.5" fill="#84cc16" />
          {/* Specular highlight */}
          <circle cx="33.3" cy="8.3" r="1.2" fill="rgba(255,255,255,0.6)" />
        </svg>
        
        {/* Metallic glossy sheen sweeper reflection overlay */}
        <div className="kram-metallic-sheen pointer-events-none" />
      </div>

      {/* ── Wordmark ── */}
      {variant !== 'icon' && (
        <span
          className="font-extrabold tracking-[-0.03em] transition-all duration-300 group-hover/logo:text-[#2563EB]"
          style={{
            fontSize: `${wordmarkSize}px`,
            color: wordmarkColor,
            lineHeight: 1,
          }}
        >
          KRAM
        </span>
      )}
    </span>
  )
}
