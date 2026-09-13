import { Sidebar } from '@/components/layout/sidebar'
import { AppAccessGate } from '@/components/shared/app-access-gate'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#F8F9FB] text-slate-900 antialiased selection:bg-[#133359]/10 selection:text-[#133359]">
      {/* Sidebar + main content — clean institutional layout */}
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F8F9FB]">
          <div className="h-full overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <AppAccessGate>{children}</AppAccessGate>
          </div>
        </main>
      </div>
    </div>
  )
}
