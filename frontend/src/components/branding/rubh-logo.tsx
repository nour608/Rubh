'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface RubhLogoProps {
  className?: string
  variant?: 'wordmark' | 'mark' | 'full'
  size?: 'sm' | 'md' | 'lg'
}

export const RubhLogo = ({
  className,
  variant = 'wordmark',
  size = 'md',
}: RubhLogoProps) => {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8'

  if (variant === 'mark') {
    return (
      <div className={cn('inline-flex items-center select-none', className)}>
        {/* Architectural Monogram 'R' in Official Navy #133359 */}
        <svg
          viewBox="0 0 36 36"
          className={cn('shrink-0', heightClass, className)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="36" height="36" rx="8" fill="#133359" />
          <path
            d="M11 9V27M11 9H19C22.3137 9 25 11.6863 25 15C25 18.3137 22.3137 21 19 21H11M18 21L25 27"
            stroke="#FFFFFF"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="10" r="2.2" fill="#10B981" />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Official Rubh Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rubh-logo-transparent.png"
        alt="Rubh Institutional RWA"
        className={cn('w-auto object-contain', heightClass)}
      />
    </div>
  )
}

// Named alias for backwards compatibility
export const rubhLogo = RubhLogo
