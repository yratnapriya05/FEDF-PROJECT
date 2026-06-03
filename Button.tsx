import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

const variants = {
  default: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25',
  outline: 'border border-sky-500/30 text-sky-300 hover:bg-sky-500/10',
  ghost: 'text-sky-300 hover:bg-white/5',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }
>(({ className, variant = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50',
      variants[variant],
      className
    )}
    {...props}
  />
))
Button.displayName = 'Button'
