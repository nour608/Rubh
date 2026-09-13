import { cn } from '@/lib/utils/cn'

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'signal'

interface BadgeProps {
  tone?: BadgeTone
  label: string
  className?: string
}

const toneMap: Record<BadgeTone, string> = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-red-800 border border-red-200',
  signal: 'bg-slate-100 text-[#133359] border border-slate-200',
}

export const Badge = ({ tone = 'default', label, className }: BadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', toneMap[tone], className)}>
    {label}
  </span>
)
