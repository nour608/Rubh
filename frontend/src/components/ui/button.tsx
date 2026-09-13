import React, { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'cc' | 'cc-outline'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-[#133359] text-white hover:bg-[#0E2542] shadow-sm disabled:opacity-50',
  secondary:
    'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm disabled:text-slate-400 disabled:opacity-60',
  outline:
    'bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm disabled:opacity-50',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:opacity-50',
  cc:
    'bg-[#133359] text-white hover:bg-[#0E2542] shadow-sm',
  'cc-outline':
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133359]/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
        variantMap[variant],
        className,
      )}
      {...props}
    />
  )
})
