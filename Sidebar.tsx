import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  Armchair,
  Users,
  Shield,
  Plane,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Operations' },
  { to: '/pnr', icon: Search, label: 'PNR Search' },
  { to: '/seats', icon: Armchair, label: 'Seat Map' },
  { to: '/passengers', icon: Users, label: 'Passengers' },
  { to: '/admin', icon: Shield, label: 'Admin', roles: ['admin'] },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r',
        isLight ? 'glass-light border-sky-200' : 'glass border-sky-500/10'
      )}
    >
      <div className="flex items-center gap-3 border-b border-sky-500/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
          <Plane className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className={cn('text-lg font-bold tracking-tight', isLight ? 'text-sky-900' : 'text-white')}>
            SkyPNR <span className="text-sky-400">Pro</span>
          </h1>
          <p className="text-xs text-sky-500/80">Operations Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav
          .filter((n) => !n.roles || n.roles.includes(user?.role || ''))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 shadow-inner'
                    : isLight
                      ? 'text-slate-600 hover:bg-sky-50'
                      : 'text-slate-400 hover:bg-white/5 hover:text-sky-200'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="border-t border-sky-500/10 p-3 space-y-2">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            isLight ? 'text-slate-600 hover:bg-sky-50' : 'text-slate-400 hover:bg-white/5'
          )}
        >
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {isLight ? 'Dark mode' : 'Light mode'}
        </button>
        <div className={cn('rounded-lg px-3 py-2 text-xs', isLight ? 'bg-sky-50' : 'bg-white/5')}>
          <p className={cn('font-medium', isLight ? 'text-sky-900' : 'text-white')}>{user?.name}</p>
          <p className="text-sky-500 capitalize">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </motion.aside>
  )
}
