import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type CardVariant = 'dark' | 'light'

interface CardProps {
  className?: string
  children: ReactNode
  variant?: CardVariant
}

const variantStyles: Record<CardVariant, string> = {
  dark: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
  light: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
}

export const Card = ({ className, children, variant = 'dark' }: CardProps) => (
  <section className={cn(variantStyles[variant], className)}>{children}</section>
)
