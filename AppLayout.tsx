import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'

export function AppLayout() {
  const location = useLocation()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={cn('min-h-screen', isLight ? 'gradient-bg-light text-slate-900' : 'gradient-bg text-slate-100')}>
      <Sidebar />
      <main className="ml-64 min-h-screen p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster
        theme={isLight ? 'light' : 'dark'}
        position="top-right"
        toastOptions={{
          className: isLight ? '' : 'glass border-sky-500/20',
        }}
      />
    </div>
  )
}
