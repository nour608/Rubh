'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  Filter,
  ImageIcon,
  LogOut,
  MapPin,
  ScanLine,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react'
import { clearWalletAuthSession } from '@/lib/api/wallet-auth'
import { formatShortHash } from '@/lib/utils/format'
import { WalletActionButton } from '@/components/shared/wallet-action-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChainBatches, type EnrichedBatch } from '@/lib/web3/use-chain-batches'

// ─── Constants ─────────────────────────────────────────────────────────────

const SAR_PER_USDC = 3.75

// ─── Batch Card (Harmonious Swiss Institutional Design) ─────────────────────

interface BatchCardProps {
  batch: EnrichedBatch
  currency: 'USDC' | 'SAR'
}

const BatchCard = ({ batch, currency }: BatchCardProps) => {
  const { onChain, categories, meta } = batch
  const id = onChain.id.toString()

  const progress =
    onChain.totalUnitsForSale > 0n
      ? Number((onChain.totalUnitsSold * 100n) / onChain.totalUnitsForSale)
      : 0

  const minUnitCost =
    categories.length > 0
      ? categories.reduce((min, c) => (c.unitCost < min ? c.unitCost : min), categories[0].unitCost)
      : 10000000n // default $10

  const minCostUsdcNum = Number(formatUnits(minUnitCost, 6))
  const minTicketDisplay =
    currency === 'SAR'
      ? `${(minCostUsdcNum * SAR_PER_USDC).toFixed(1)} SAR`
      : `$${minCostUsdcNum.toFixed(0)}`

  const isMurabaha = meta?.financingStructure === 'murabaha'
  const returnRate = (onChain.profitBps / 100).toFixed(1)

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div>
        {/* Image Banner */}
        <div className="relative h-44 w-full overflow-hidden rounded-lg bg-slate-100 mb-4">
          {meta?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.imageUrl}
              alt={meta.title ?? `Batch #${id}`}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
              }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <ImageIcon className="size-10 opacity-30" />
            </div>
          )}

          {/* Top Left: Structure Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm ${
                isMurabaha
                  ? 'bg-white text-[#133359] border border-slate-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span className={`size-1.5 rounded-full ${isMurabaha ? 'bg-[#133359]' : 'bg-emerald-600'}`} />
              {isMurabaha ? 'Murabaha · Trade' : 'Musharakah · Equity'}
            </span>
          </div>

          {/* Top Right: Status Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200 shadow-sm">
              {onChain.closed ? 'Closed' : onChain.active ? 'Active Round' : 'Paused'}
            </span>
          </div>

          {/* Bottom Overlay: Location */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-md">
            <span className="inline-flex items-center gap-1 font-medium text-[11px]">
              <MapPin className="size-3.5" />
              {meta?.location ?? 'Saudi Arabia / GCC'}
            </span>
            <span className="font-mono text-[10px] opacity-90">ID #{id}</span>
          </div>
        </div>

        {/* Header Content */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {meta?.sector ?? 'Tokenized Real-World Asset'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              AAOIFI Certified
            </span>
          </div>

          <h3 className="font-heading text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#133359] transition-colors">
            {meta?.title ?? `Batch #${id}`}
          </h3>

          {meta?.description && (
            <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
              {meta.description}
            </p>
          )}
        </div>

        {/* Financial Metric Callouts */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {isMurabaha ? 'Fixed Markup' : 'Target APY'}
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold font-heading text-emerald-700">
                {returnRate}%
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {isMurabaha ? 'Markup' : 'APY'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Min Ticket
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold font-heading text-slate-900">
                {minTicketDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Oracle Verification Pill */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <ScanLine className="size-3.5 text-[#133359]" />
            {meta?.oracleType === 'iot_telemetry' ? 'IoT Flow Telemetry' : 'POS Checkout Stream'}
          </span>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Chainlink CRE
          </span>
        </div>
      </div>

      {/* Footer: Subscription Progress & Action */}
      <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Subscription Progress</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#133359] transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <Link href={`/investor/deal/${id}`} className="block">
          <Button className="w-full bg-[#133359] hover:bg-[#0E2542] text-white font-medium text-xs py-2.5">
            Inspect Deal & Invest →
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Marketplace Main Component ───────────────────────────────────────────

const STATUS_FILTERS = ['ALL', 'LIVE', 'PAUSED', 'CLOSED'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]
type StructureFilter = 'ALL' | 'MURABAHA' | 'MUSHARAKAH'

export const InvestorMarketplace = () => {
  const { batches, isLoading, error } = useChainBatches()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [structureFilter, setStructureFilter] = useState<StructureFilter>('ALL')
  const [currency, setCurrency] = useState<'USDC' | 'SAR'>('USDC')
  const [search, setSearch] = useState('')
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    if (!wallet) return
    clearWalletAuthSession()
    disconnect(wallet)
  }

  // Filtered batches
  const filtered = useMemo(() => {
    return batches.filter((b) => {
      // Status filter
      if (statusFilter === 'LIVE' && (!b.onChain.active || b.onChain.closed)) return false
      if (statusFilter === 'PAUSED' && (b.onChain.active || b.onChain.closed)) return false
      if (statusFilter === 'CLOSED' && !b.onChain.closed) return false

      // Structure filter
      if (structureFilter === 'MURABAHA' && b.meta?.financingStructure !== 'murabaha') return false
      if (structureFilter === 'MUSHARAKAH' && b.meta?.financingStructure !== 'musharakah') return false

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase()
        const titleMatch = b.meta?.title?.toLowerCase().includes(q)
        const descMatch = b.meta?.description?.toLowerCase().includes(q)
        const sectorMatch = b.meta?.sector?.toLowerCase().includes(q)
        const idMatch = b.onChain.id.toString() === q
        if (!titleMatch && !descMatch && !sectorMatch && !idMatch) return false
      }

      return true
    })
  }, [batches, statusFilter, structureFilter, search])

  return (
    <main className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#133359]">
              Institutional Marketplace
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">
              AAOIFI Sharia-Certified
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Real-World Assets
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Invest in fractional, Sharia-certified commercial and industrial assets starting from $10 (~37.5 SAR). Verified onchain by Chainlink CRE.
          </p>
        </div>

        {/* Currency Switcher & Wallet Status */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Currency Toggle */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setCurrency('USDC')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                currency === 'USDC'
                  ? 'bg-[#133359] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USDC ($)
            </button>
            <button
              onClick={() => setCurrency('SAR')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                currency === 'SAR'
                  ? 'bg-[#133359] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SAR (Saudi Riyal)
            </button>
          </div>

          {account?.address ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="font-mono">{formatShortHash(account.address)}</span>
              <button
                onClick={handleDisconnect}
                className="ml-1 text-slate-400 hover:text-slate-700"
                title="Disconnect"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <WalletActionButton labelDisconnected="Connect Wallet" variant="outline" />
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Sharia Structure Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStructureFilter('ALL')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              structureFilter === 'ALL'
                ? 'bg-[#133359] text-white shadow-sm font-semibold'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            All Instruments
          </button>
          <button
            onClick={() => setStructureFilter('MURABAHA')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              structureFilter === 'MURABAHA'
                ? 'bg-[#133359] text-white shadow-sm font-semibold'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            Murabaha (Cost-Plus Trade Finance)
          </button>
          <button
            onClick={() => setStructureFilter('MUSHARAKAH')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              structureFilter === 'MUSHARAKAH'
                ? 'bg-[#133359] text-white shadow-sm font-semibold'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            Musharakah (Asset Revenue-Share / Equity)
          </button>
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, asset, sector..."
              className="pl-9 text-xs h-9 bg-white border-slate-200 rounded-lg"
            />
          </div>

          {/* Status Pills */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-88 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load batches: {error}
        </div>
      )}

      {/* Offerings Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((batch) => (
            <BatchCard key={batch.onChain.id.toString()} batch={batch} currency={currency} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Filter className="size-6 opacity-40" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">No matching opportunities</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search query, Sharia structure, or status filters.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-lg"
            onClick={() => {
              setSearch('')
              setStatusFilter('ALL')
              setStructureFilter('ALL')
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </main>
  )
}
