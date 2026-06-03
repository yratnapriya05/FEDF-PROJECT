import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  Confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Waitlisted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  'On Time': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Delayed: 'bg-red-500/20 text-red-400 border-red-500/30',
  Boarding: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  Departed: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
}

export function Badge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        className
      )}
    >
      {status}
    </span>
  )
}
