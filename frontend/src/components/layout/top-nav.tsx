'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'
import { RubhLogo } from '@/components/branding/rubh-logo'

const WalletActionButton = dynamic(
  () => import('@/components/shared/wallet-action-button').then((module) => module.WalletActionButton),
  { ssr: false },
)

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggleMenu = (): void => {
    setMobileOpen((current) => !current)
  }

  const handleCloseMenu = (): void => {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <RubhLogo size="md" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/investor/marketplace"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#133359]"
          >
            Marketplace
          </Link>
          <Link
            href="/#structures"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#133359]"
          >
            Structures
          </Link>
          <Link
            href="/#verification"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#133359]"
          >
            Verification
          </Link>
          <Link
            href="/merchant"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#133359]"
          >
            SME Issuance
          </Link>
          <Link
            href="/compliance"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-[#133359]"
          >
            Sandbox
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <WalletActionButton labelDisconnected="Connect Wallet" variant="outline" showAddressWhenConnected={false} />
          <Link
            href="/investor/marketplace"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#133359] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#0E2542]"
          >
            Explore Deals <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex size-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          onClick={handleToggleMenu}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/investor/marketplace"
              onClick={handleCloseMenu}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Marketplace
            </Link>
            <Link
              href="/#structures"
              onClick={handleCloseMenu}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sharia Structures
            </Link>
            <Link
              href="/#verification"
              onClick={handleCloseMenu}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Verification
            </Link>
            <Link
              href="/merchant"
              onClick={handleCloseMenu}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              SME Issuance
            </Link>
            <Link
              href="/compliance"
              onClick={handleCloseMenu}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sandbox
            </Link>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <Link
                href="/investor/marketplace"
                onClick={handleCloseMenu}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#133359] px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                Explore Deals <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
