import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

type Cell = { row: number; col: number; value: number }

export function SeatHeatmap({ data }: { data: Cell[] }) {
  const { theme } = useTheme()
  const light = theme === 'light'

  const color = (v: number) => {
    if (v >= 90) return 'bg-emerald-500'
    if (v >= 75) return 'bg-sky-500'
    if (v >= 60) return 'bg-amber-500'
    return 'bg-slate-600'
  }

  return (
    <div className={cn('rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
      <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Seat Occupancy Heatmap</h3>
      <div className="grid grid-cols-6 gap-1">
        {data.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.02 }}
            title={`${cell.value}%`}
            className={cn('aspect-square rounded-sm opacity-80 hover:opacity-100', color(cell.value))}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>High load</span>
      </div>
    </div>
  )
}
