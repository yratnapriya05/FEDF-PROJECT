import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

export function RevenueChart({ labels, data }: { labels: string[]; data: number[] }) {
  const { theme } = useTheme()
  const light = theme === 'light'
  const grid = light ? 'rgba(14,165,233,0.1)' : 'rgba(56,189,248,0.08)'
  const text = light ? '#64748b' : '#94a3b8'

  return (
    <div className={cn('rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
      <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Revenue Overview</h3>
      <Line
        data={{
          labels,
          datasets: [{
            label: 'Revenue',
            data,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(14,165,233,0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#0ea5e9',
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y ?? 0) },
            },
          },
          scales: {
            x: { grid: { color: grid }, ticks: { color: text } },
            y: {
              grid: { color: grid },
              ticks: { color: text, callback: (v) => `$${Number(v) / 1000}k` },
            },
          },
        }}
        height={220}
      />
    </div>
  )
}

export function OccupancyChart({ labels, data }: { labels: string[]; data: number[] }) {
  const { theme } = useTheme()
  const light = theme === 'light'
  const grid = light ? 'rgba(14,165,233,0.1)' : 'rgba(56,189,248,0.08)'
  const text = light ? '#64748b' : '#94a3b8'

  return (
    <div className={cn('rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
      <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Weekly Occupancy</h3>
      <Bar
        data={{
          labels,
          datasets: [{
            label: 'Occupancy %',
            data,
            backgroundColor: 'rgba(14,165,233,0.6)',
            borderRadius: 6,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: text } },
            y: { max: 100, grid: { color: grid }, ticks: { color: text, callback: (v) => `${v}%` } },
          },
        }}
        height={220}
      />
    </div>
  )
}
