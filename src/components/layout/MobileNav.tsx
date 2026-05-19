'use client'

import Link from 'next/link'
import { Home, Search, PlusCircle, Store, User, LogIn } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/', icon: Home, label: 'Головна' },
    { href: '/catalog', icon: Search, label: 'Пошук' },
    { href: session ? '/sell' : '/auth/login?callbackUrl=/sell', icon: PlusCircle, label: 'Продати' },
    { href: '/sellers', icon: Store, label: 'Продавцям' },
    { href: session ? '/cabinet' : '/auth/login', icon: session ? User : LogIn, label: session ? 'Профіль' : 'Увійти' },
  ]

  // Hide on auth pages
  if (pathname.startsWith('/auth')) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-[#64748B]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
