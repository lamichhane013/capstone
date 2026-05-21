'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/predict', label: 'Predict' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-48 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="font-bold text-gray-900">EduPredict</h1>
        <p className="text-xs text-gray-500">Student Analytics</p>
      </div>
      <nav className="p-2 flex-1">
        {navItems.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded text-sm mb-1 ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
