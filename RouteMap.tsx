import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

type Route = { from: string; to: string; volume: number }

export function RouteMap({ routes }: { routes: Route[] }) {
  const { theme } = useTheme()
  const light = theme === 'light'
  const max = Math.max(...routes.map((r) => r.volume))

  return (
    <div className={cn('rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
      <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Route Network</h3>
      <div className="space-y-3">
        {routes.map((r, i) => (
          <motion.div
            key={`${r.from}-${r.to}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className={cn('w-10 font-mono text-xs font-bold', light ? 'text-sky-600' : 'text-sky-400')}>{r.from}</span>
            <div className="relative flex-1">
              <div className={cn('h-1 rounded-full', light ? 'bg-sky-100' : 'bg-sky-900/50')}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.volume / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
                />
              </div>
              <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-sky-400" />
            </div>
            <span className={cn('w-10 font-mono text-xs font-bold text-right', light ? 'text-sky-600' : 'text-sky-400')}>{r.to}</span>
            <span className={cn('w-12 text-right text-xs', light ? 'text-slate-500' : 'text-slate-500')}>{r.volume}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
