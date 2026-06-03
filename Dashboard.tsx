import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  Plane,
  Percent,
  XCircle,
  Clock,
  DollarSign,
  Radio,
} from 'lucide-react'
import api from '@/lib/api'
import { StatCard } from '@/components/StatCard'
import { RevenueChart, OccupancyChart } from '@/components/charts/DashboardCharts'
import { RouteMap } from '@/components/RouteMap'
import { SeatHeatmap } from '@/components/Heatmap'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTheme } from '@/context/ThemeContext'
import { cn, formatCurrency } from '@/lib/utils'

type DashboardData = {
  stats: {
    totalReservations: number
    todayFlights: number
    occupancyRate: number
    cancelledBookings: number
    delayedFlights: number
    revenue: number
    revenueChange: number
  }
  revenueChart: { labels: string[]; data: number[] }
  occupancyChart: { labels: string[]; data: number[] }
  flights: Array<{ id: string; route: string; dep: string; status: string; occupancy: number }>
  bookings: Array<{ pnr: string; passenger: string; route: string; status: string; time: string }>
  heatmap: Array<{ row: number; col: number; value: number }>
  routes: Array<{ from: string; to: string; volume: number }>
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [live, setLive] = useState<typeof data extends null ? never : DashboardData['bookings']>([])
  const { theme } = useTheme()
  const light = theme === 'light'

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data))
    const interval = setInterval(() => {
      api.get('/bookings/live').then((r) => setLive(r.data))
    }, 8000)
    api.get('/bookings/live').then((r) => setLive(r.data))
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  const { stats } = data
  const feed = live.length ? live : data.bookings

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn('text-2xl font-bold tracking-tight', light ? 'text-sky-900' : 'text-white')}
          >
            Operations Dashboard
          </motion.h1>
          <p className={cn('text-sm', light ? 'text-slate-500' : 'text-slate-400')}>
            Real-time airline control center · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
          <span className="pulse-live h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">LIVE</span>
          <Radio className="h-3 w-3 text-emerald-400" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Reservations" value={stats.totalReservations} icon={CalendarCheck} delay={0} />
        <StatCard title="Today's Flights" value={stats.todayFlights} icon={Plane} delay={0.05} />
        <StatCard title="Occupancy Rate" value={stats.occupancyRate} suffix="%" decimals={1} icon={Percent} delay={0.1} />
        <StatCard title="Cancelled" value={stats.cancelledBookings} icon={XCircle} delay={0.15} />
        <StatCard title="Delayed Flights" value={stats.delayedFlights} icon={Clock} delay={0.2} />
        <StatCard
          title="Revenue"
          value={stats.revenue}
          prefix="$"
          change={`+${stats.revenueChange}% vs last month`}
          icon={DollarSign}
          delay={0.25}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart labels={data.revenueChart.labels} data={data.revenueChart.data} />
        <OccupancyChart labels={data.occupancyChart.labels} data={data.occupancyChart.data} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={cn('lg:col-span-2 rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
          <h3 className={cn('mb-4 text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Today's Flight Board</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn('border-b text-left text-xs', light ? 'border-sky-100 text-slate-500' : 'border-sky-500/10 text-slate-500')}>
                  <th className="pb-3 pr-4">Flight</th>
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Departure</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Load</th>
                </tr>
              </thead>
              <tbody>
                {data.flights.map((f) => (
                  <tr key={f.id} className={cn('border-b', light ? 'border-sky-50' : 'border-white/5')}>
                    <td className={cn('py-3 font-mono font-semibold', light ? 'text-sky-700' : 'text-sky-300')}>{f.id}</td>
                    <td className="py-3">{f.route}</td>
                    <td className="py-3 font-mono text-xs">{f.dep}</td>
                    <td className="py-3"><Badge status={f.status} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-1.5 flex-1 max-w-[80px] rounded-full', light ? 'bg-sky-100' : 'bg-sky-900')}>
                          <div className="h-full rounded-full bg-sky-400" style={{ width: `${f.occupancy}%` }} />
                        </div>
                        <span className="text-xs">{f.occupancy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cn('rounded-2xl p-5', light ? 'glass-light' : 'glass')}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className={cn('text-sm font-semibold', light ? 'text-sky-900' : 'text-white')}>Live Bookings</h3>
            <span className="pulse-live h-2 w-2 rounded-full bg-sky-400" />
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {feed.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No bookings yet. Register passengers under Passengers.
              </p>
            )}
            {feed.map((b, i) => (
              <motion.div
                key={`${b.pnr}-${i}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn('rounded-lg border p-3', light ? 'border-sky-100 bg-white/50' : 'border-white/5 bg-white/5')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">{b.pnr}</span>
                  <Badge status={b.status} />
                </div>
                <p className={cn('mt-1 text-sm font-medium', light ? 'text-slate-800' : 'text-white')}>{b.passenger}</p>
                <p className="text-xs text-slate-500">{b.route} · {b.time}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RouteMap routes={data.routes} />
        <SeatHeatmap data={data.heatmap} />
      </div>

      <p className={cn('text-center text-xs', light ? 'text-slate-400' : 'text-slate-600')}>
        Revenue MTD: {formatCurrency(stats.revenue)} · System operational
      </p>
    </div>
  )
}
