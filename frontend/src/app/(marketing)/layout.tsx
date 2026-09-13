import { TopNav } from '@/components/layout/top-nav'
import type { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB] text-slate-900">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
