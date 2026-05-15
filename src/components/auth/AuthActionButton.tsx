'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { requireAuthAction } from '@/lib/require-auth'

interface AuthActionButtonProps {
  children: React.ReactNode
  callbackUrl: string
  action?: string
  onClick?: () => void
  className?: string
  as?: 'button' | 'div'
}

/**
 * Wraps any action button with auth check.
 * If user is not logged in — redirects to login.
 * If logged in — executes onClick.
 */
export function AuthActionButton({
  children,
  callbackUrl,
  action,
  onClick,
  className = '',
  as = 'button'
}: AuthActionButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  function handleClick() {
    if (!session) {
      router.push(requireAuthAction(callbackUrl, action))
      return
    }
    onClick?.()
  }

  const Component = as

  return (
    <Component onClick={handleClick} className={className}>
      {children}
    </Component>
  )
}
