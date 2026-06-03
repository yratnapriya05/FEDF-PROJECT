import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Activity, Download } from 'lucide-react'
import api from '@/lib/api'
import { RevenueChart, OccupancyChart } from '@/components/charts/DashboardCharts'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Admin() {
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string; role: string; status: string; lastLogin: string }>>([])
  const [audit, setAudit] = useState<Array<{ id: number; user: string; action: string; target: string; time: string }>>([])
  const [health, setHealth] = useState<Record<string, number | string> | null>(null)
  const [analytics, setAnalytics] = useState<{ revenueChart: { labels: string[]; data: number[] }; occupancyChart: { labels: string[]; data: number[] } } | null>(null)
  const [tab, setTab] = useState<'users' | 'audit' | 'analytics' | 'system'>('analytics')
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const light = theme === 'light'

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/audit'),
      api.get('/admin/health'),
      api.get('/admin/analytics'),
    ])
      .then(([u, a, h, an]) => {
        setUsers(u.data)
        setAudit(a.data)
        setHealth(h.data)
        setAnalytics(an.data)
      })
      .catch(() => toast.error('Admin access required'))
      .finally(() => setLoading(false))
  }, [])

  const exportReport = () => {
    const blob = new Blob([JSON.stringify({ users, audit, health, exported: new Date() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skypnr-report-${Date.now()}.json`
    a.click()
    toast.success('Report exported')
  }

  const tabs = [
    { id: 'analytics' as const, label: 'Analytics', icon: Activity },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'audit' as const, label: 'Audit Logs', icon: FileText },
    { id: 'system' as const, label: 'Monitoring', icon: Activity },
  ]

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>Admin Panel</h1>
          <p className="text-sm text-slate-500">User management, audit trails & system monitoring</p>
        </div>
        <Button variant="outline" onClick={exportReport}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id ? 'bg-sky-500 text-white' : light ? 'bg-white text-slate-600' : 'bg-white/5 text-slate-400'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-2">
          <RevenueChart labels={analytics.revenueChart.labels} data={analytics.revenueChart.data} />
          <OccupancyChart labels={analytics.occupancyChart.labels} data={analytics.occupancyChart.data} />
        </motion.div>
      )}

      {tab === 'users' && (
        <div className={cn('overflow-hidden rounded-2xl', light ? 'glass-light' : 'glass')}>
          <table className="w-full text-sm">
            <thead>
              <tr className={cn('border-b text-left text-xs', light ? 'border-sky-100' : 'border-white/10')}>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={cn('border-b', light ? 'border-sky-50' : 'border-white/5')}>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4 capitalize text-sky-400">{u.role}</td>
                  <td className="p-4"><span className="text-emerald-400">{u.status}</span></td>
                  <td className="p-4 text-xs text-slate-500">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className={cn('rounded-2xl p-4 space-y-2 max-h-[500px] overflow-y-auto', light ? 'glass-light' : 'glass')}>
          {audit.map((log) => (
            <div key={log.id} className={cn('flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm', light ? 'border-sky-100' : 'border-white/5')}>
              <span className="font-medium text-sky-400">{log.user}</span>
              <span>{log.action}</span>
              <span className="font-mono text-xs text-slate-500">{log.target}</span>
              <span className="text-xs text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'system' && health && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(health).map(([key, val]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={cn('rounded-2xl p-5 text-center', light ? 'glass-light' : 'glass')}
            >
              <p className="text-xs uppercase text-slate-500">{key}</p>
              <p className={cn('mt-2 text-2xl font-bold', light ? 'text-sky-900' : 'text-white')}>
                {typeof val === 'number' ? `${val}%` : val}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
