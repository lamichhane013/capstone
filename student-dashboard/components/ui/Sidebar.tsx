'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Brain,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/helpers'
import { useTheme } from './ThemeProvider'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/predict', label: 'AI Predict', icon: Brain },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen transition-all duration-300 ease-in-out z-50',
        'bg-[#060b11] border-r border-slate-800/60',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-800/60',
        collapsed && 'justify-center px-0'
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
          <GraduationCap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm tracking-wide whitespace-nowrap">
              EduPredict
            </div>
            <div className="text-slate-500 text-xs font-mono whitespace-nowrap">
              Analytics v1.0
            </div>
          </div>
        )}
      </div>

      {/* AI Badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg bg-brand-500/8 border border-brand-500/20">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-brand-400" />
            <span className="text-brand-400 text-xs font-mono">AI-Powered Engine</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'sidebar-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-brand-500/12 text-brand-400 border-l-2 border-brand-400'
                  : 'text-slate-500 hover:text-slate-200'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 py-3 border-t border-slate-800/60 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'sidebar-item w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-slate-500 hover:text-slate-200 transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span className="whitespace-nowrap">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'sidebar-item w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-slate-500 hover:text-slate-200 transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
