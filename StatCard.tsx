import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { CountUp } from './CountUp'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'

export function StatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  change,
  icon: Icon,
  delay = 0,
}: {
  title: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  change?: string
  icon: LucideIcon
  delay?: number
}) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 transition-shadow duration-300',
        isLight ? 'glass-light shadow-lg hover:shadow-xl' : 'glass hover:shadow-lg hover:shadow-sky-500/10'
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl transition-all group-hover:bg-sky-500/20" />
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', isLight ? 'text-slate-500' : 'text-slate-400')}>{title}</p>
          <p className={cn('mt-2 text-3xl font-bold tracking-tight', isLight ? 'text-sky-900' : 'text-white')}>
            <CountUp value={value} decimals={decimals} suffix={suffix} prefix={prefix} />
          </p>
          {change && (
            <p className="mt-1 text-xs text-emerald-400">{change}</p>
          )}
        </div>
        <div className="rounded-xl bg-sky-500/15 p-3">
          <Icon className="h-5 w-5 text-sky-400" />
        </div>
      </div>
    </motion.div>
  )
}
