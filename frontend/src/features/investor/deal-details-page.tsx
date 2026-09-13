'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Database,
  Droplet,
  FileText,
  HelpCircle,
  ImageIcon,
  Info,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Radio,
  Scale,
  ScanLine,
  Server,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { getContract, prepareContractCall } from 'thirdweb'
import { useActiveAccount, useReadContract } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { TxStatus } from '@/components/shared/tx-status'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTransactionAction } from '@/features/transactions/use-transaction-action'
import { useChainBatch, type CategoryState } from '@/lib/web3/use-chain-batches'
import { thirdwebClient } from '@/lib/web3/client'
import { sepolia } from 'thirdweb/chains'
import { erc20Abi } from '@/lib/web3/abis'
import { contracts } from '@/lib/web3/contracts'

const USDC_DECIMALS = 6
const SAR_PER_USDC = 3.75

const fmt = (val: bigint, decimals = USDC_DECIMALS) =>
  Number(formatUnits(val, decimals)).toLocaleString('en-US', { maximumFractionDigits: 2 })

// ─── Category Buy Card ─────────────────────────────────────────────────────

const CategoryBuyCard = ({
  batchId,
  category,
  purchaseToken,
  isMurabaha,
  onSuccess,
}: {
  batchId: bigint
  category: CategoryState
  purchaseToken: string
  isMurabaha: boolean
  onSuccess: () => void
}) => {
  const account = useActiveAccount()
  const [units, setUnits] = useState('1')
  const [agreedToShariaTerms, setAgreedToShariaTerms] = useState(false)
  const approveAction = useTransactionAction()
  const buyAction = useTransactionAction()

  const unitsNum = Math.max(1, parseInt(units, 10) || 1)
  const costTotal = category.unitCost * BigInt(unitsNum)
  const costTotalUsdc = Number(formatUnits(costTotal, USDC_DECIMALS))
  const costTotalSar = (costTotalUsdc * SAR_PER_USDC).toFixed(2)
  const remaining = category.unitsForSale > category.unitsSold ? category.unitsForSale - category.unitsSold : 0n

  const tokenContract = useMemo(
    () =>
      getContract({
        client: thirdwebClient,
        chain: sepolia,
        address: purchaseToken as `0x${string}`,
        abi: erc20Abi,
      }),
    [purchaseToken],
  )

  const allowanceQuery = useReadContract({
    contract: tokenContract,
    method: 'allowance',
    params: account?.address
      ? [account.address as `0x${string}`, contracts.factory.address as `0x${string}`]
      : ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
    queryOptions: { enabled: !!account?.address },
  })

  const currentAllowance = (allowanceQuery.data as bigint | undefined) ?? 0n
  const needsApproval = currentAllowance < costTotal

  const handleApprove = async () => {
    await approveAction.run(
      prepareContractCall({
        contract: tokenContract,
        method: 'approve',
        params: [contracts.factory.address as `0x${string}`, costTotal],
      }),
    )
    await allowanceQuery.refetch()
  }

  const handleBuy = async () => {
    const hash = await buyAction.run(
      prepareContractCall({
        contract: contracts.factory,
        method: 'function buyUnits(uint256 batchId, bytes32 categoryIdHash, uint256 units) nonpayable',
        params: [batchId, category.categoryIdHash as `0x${string}`, BigInt(unitsNum)],
      }),
    )
    if (hash) {
      onSuccess()
    }
  }

  const isSoldOut = remaining === 0n

  return (
    <div className="rounded-2xl border border-line bg-panelMuted/70 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-textMuted">
            Fractional Share Category
          </span>
          <p className="mt-0.5 font-mono text-xs font-semibold text-text">
            Unit Tier ({fmt(category.unitCost)} USDC / {(Number(formatUnits(category.unitCost, 6)) * SAR_PER_USDC).toFixed(1)} SAR)
          </p>
        </div>
        <Badge tone={isSoldOut ? 'warning' : 'success'} label={isSoldOut ? 'Sold Out' : 'Available'} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-line bg-panel p-2.5">
          <p className="text-[10px] font-mono uppercase text-textMuted">Unit Cost</p>
          <p className="mt-0.5 font-bold text-text">${fmt(category.unitCost)} USDC</p>
        </div>
        <div className="rounded-xl border border-line bg-panel p-2.5">
          <p className="text-[10px] font-mono uppercase text-textMuted">Remaining Units</p>
          <p className="mt-0.5 font-bold text-text">{remaining.toString()}</p>
        </div>
      </div>

      {!isSoldOut && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <label htmlFor={`units-${category.categoryIdHash}`} className="text-xs font-mono uppercase text-textMuted shrink-0">
              Quantity:
            </label>
            <Input
              id={`units-${category.categoryIdHash}`}
              type="number"
              min="1"
              max={remaining.toString()}
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-24 text-xs h-9 font-mono"
            />
            <div className="text-right flex-1 text-xs">
              <span className="text-textMuted">Total: </span>
              <strong className="text-text">${costTotalUsdc.toFixed(2)} USDC</strong>
              <span className="text-textMuted text-[10px] block">({costTotalSar} SAR)</span>
            </div>
          </div>

          {/* Sharia agreement acknowledgment */}
          <label className="flex items-start gap-2.5 rounded-xl border border-line/60 bg-panel/60 p-2.5 text-xs text-textMuted cursor-pointer hover:bg-panel">
            <input
              type="checkbox"
              checked={agreedToShariaTerms}
              onChange={(e) => setAgreedToShariaTerms(e.target.checked)}
              className="mt-0.5 rounded border-line text-gold focus:ring-gold"
            />
            <span className="leading-snug text-[11px]">
              I confirm investment under the Sharia-compliant{' '}
              <strong>{isMurabaha ? 'Murabaha (Cost-Plus Trade)' : 'Musharakah (Profit-Share)'}</strong> contract and acknowledge SPV constructive terms.
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            {needsApproval ? (
              <Button
                onClick={handleApprove}
                disabled={approveAction.isLoading || !agreedToShariaTerms}
                className="w-full font-mono text-xs uppercase tracking-wider"
              >
                {approveAction.isLoading ? 'Approving USDC…' : 'Approve USDC'}
              </Button>
            ) : (
              <Button
                onClick={handleBuy}
                disabled={buyAction.isLoading || !agreedToShariaTerms}
                className="w-full font-mono text-xs uppercase tracking-wider bg-gold text-canvas hover:brightness-110"
              >
                {buyAction.isLoading ? 'Processing Subscription…' : `Subscribe (${costTotalUsdc.toFixed(0)} USDC)`}
              </Button>
            )}
          </div>

          <TxStatus action={approveAction} />
          <TxStatus action={buyAction} />
        </div>
      )}
    </div>
  )
}

// ─── Deal Details Page ─────────────────────────────────────────────────────

export const DealDetailsPage = () => {
  const params = useParams<{ id: string }>()
  const batchId = parseInt(params.id ?? '0', 10)
  const { batch, isLoading, error, refetch } = useChainBatch(batchId)
  const [activeTab, setActiveTab] = useState<'overview' | 'sharia' | 'oracle' | 'calculator'>('overview')
  const [calcInvestment, setCalcInvestment] = useState('100')

  const { onChain, categories, meta } = batch ?? {}

  const isMurabaha = meta?.financingStructure === 'murabaha'
  const progress =
    onChain && onChain.totalUnitsForSale > 0n
      ? Number((onChain.totalUnitsSold * 100n) / onChain.totalUnitsForSale)
      : 0

  const tone = onChain?.closed ? 'warning' : onChain?.active ? 'success' : 'signal'
  const statusLabel = onChain?.closed ? 'Closed' : onChain?.active ? 'Live Offering' : 'Paused'

  // Calculator projections
  const calcAmount = Math.max(10, parseFloat(calcInvestment) || 10)
  const apy = meta?.targetApy ?? (onChain ? onChain.profitBps / 100 : 15.0)
  const projectedReturnUsdc = (calcAmount * (1 + apy / 100)).toFixed(2)
  const projectedProfitUsdc = (calcAmount * (apy / 100)).toFixed(2)
  const projectedProfitSar = (Number(projectedProfitUsdc) * SAR_PER_USDC).toFixed(2)

  return (
    <main className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Round Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/investor/marketplace"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-textMuted transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" /> Back to Marketplace
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
            <CheckCircle2 className="size-3" />
            AAOIFI Sharia Certified
          </span>
          {onChain && <Badge tone={tone} label={statusLabel} />}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 gap-3 text-textMuted">
          <Loader2 className="size-6 animate-spin text-gold" />
          <span className="text-sm font-mono">Loading deal data and onchain verification proofs…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Deal Content */}
      {!isLoading && batch && onChain && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 md:p-8 space-y-6 rounded-3xl border border-line bg-panel/80 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Image */}
                {meta?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.imageUrl}
                    alt={meta.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
                    }}
                    className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-2xl border border-line bg-panelMuted text-textMuted">
                    <ImageIcon className="size-10 opacity-30" />
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isMurabaha
                          ? 'border border-gold/40 bg-gold/15 text-gold-bright'
                          : 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {isMurabaha ? 'Murabaha · Trade Finance' : 'Musharakah · Asset Equity'}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-textMuted">
                      {meta?.sector ?? 'Commercial Asset'}
                    </span>
                  </div>

                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
                    {meta?.title ?? `Batch #${onChain.id.toString()}`}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-textMuted">
                    {meta?.location && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-text">
                        <MapPin className="size-3.5 text-gold" /> {meta.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Layers className="size-3.5" /> Batch #{onChain.id.toString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400">
                      <ScanLine className="size-3.5" /> Chainlink CRE Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Summary Widget */}
              <div className="rounded-2xl border border-line bg-panelMuted/80 p-5 text-right min-w-[220px]">
                <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">
                  Funding Progress
                </p>
                <p className="text-3xl font-heading font-bold text-text mt-1">{progress}%</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold via-gold-bright to-emerald-400"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-mono text-textMuted">
                  {onChain.totalUnitsSold.toString()} of {onChain.totalUnitsForSale.toString()} units sold
                </p>
              </div>
            </div>

            {meta?.description && (
              <p className="text-sm text-textMuted leading-relaxed max-w-4xl pt-2 border-t border-line/60">
                {meta.description}
              </p>
            )}
          </Card>

          {/* Key Metrics Strip */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">Total Raised</p>
              <p className="text-2xl font-bold font-heading text-text">${fmt(onChain.principalSoldTotal)}</p>
              <p className="text-[10px] text-textMuted font-mono">
                ~{(Number(formatUnits(onChain.principalSoldTotal, 6)) * SAR_PER_USDC).toLocaleString()} SAR
              </p>
            </Card>

            <Card className="p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">
                {isMurabaha ? 'Fixed Markup' : 'Target Yield'}
              </p>
              <p className="text-2xl font-bold font-heading text-success">
                {(onChain.profitBps / 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-textMuted font-mono">
                {isMurabaha ? 'Non-compounding rate' : 'Proportional profit share'}
              </p>
            </Card>

            <Card className="p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">Target Payout</p>
              <p className="text-2xl font-bold font-heading text-text">${fmt(onChain.targetPayoutTotal)}</p>
              <p className="text-[10px] text-textMuted font-mono">Principal + Yield</p>
            </Card>

            <Card className="p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">Verified Volume</p>
              <p className="text-2xl font-bold font-heading text-text">
                {batch.trackedUnits.toString()} {meta?.telemetryUnit ?? 'units'}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono">Logged by Chainlink CRE</p>
            </Card>

            <Card className="p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-textMuted">Settled Revenue</p>
              <p className="text-2xl font-bold font-heading text-text">${fmt(onChain.settledRevenueTotal)}</p>
              <p className="text-[10px] text-textMuted font-mono">Onchain SettlementVault</p>
            </Card>
          </div>

          {/* Detailed Navigation Tabs */}
          <div className="flex border-b border-line gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#133359] text-[#133359] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Overview & Terms
            </button>
            <button
              onClick={() => setActiveTab('sharia')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'sharia'
                  ? 'border-[#133359] text-[#133359] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Scale className="size-3.5" />
              Sharia & Legal Governance
            </button>
            <button
              onClick={() => setActiveTab('oracle')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'oracle'
                  ? 'border-[#133359] text-[#133359] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Radio className="size-3.5" />
              Chainlink CRE Telemetry Proofs
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'border-[#133359] text-[#133359] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="size-3.5" />
              Returns Calculator
            </button>
          </div>

          {/* Tab Content & Investment Form */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
                  <h2 className="font-heading text-xl font-bold text-text">Opportunity Breakdown</h2>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-line bg-panelMuted p-3.5">
                      <span className="font-mono text-[10px] uppercase text-textMuted">Financing Tenure</span>
                      <p className="font-bold text-text mt-1 text-sm">{meta?.termDuration ?? '12 Months'}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3.5">
                      <span className="font-mono text-[10px] uppercase text-textMuted">Payout Frequency</span>
                      <p className="font-bold text-text mt-1 text-sm">{meta?.repaymentSchedule ?? 'Monthly Distribution'}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3.5">
                      <span className="font-mono text-[10px] uppercase text-textMuted">Capital Protection</span>
                      <p className="font-bold text-text mt-1 text-sm">
                        {isMurabaha ? 'Enforceable Buyback Clause' : 'Fractional Asset Ownership (WaaS)'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3.5">
                      <span className="font-mono text-[10px] uppercase text-textMuted">Issuing SPV Entity</span>
                      <p className="font-bold text-text mt-1 text-sm">{meta?.spvDetails ?? 'Rubh SPV I'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3">
                    <h3 className="font-heading text-sm font-semibold text-text">About the Underlying Operation</h3>
                    <p className="text-xs text-textMuted leading-relaxed">
                      {isMurabaha
                        ? 'This Murabaha financing structure is executed through constructive inventory ownership. Investors fund inventory acquisition through the SPV, which resells to the SME at cost plus fixed markup. Real-time POS checkout transactions trigger automated smart contract repayments as items sell.'
                        : 'This Musharakah partnership structure provides fractional equity in a dedicated revenue-generating asset unit. Investors receive automated monthly profit shares based on actual metered production output and industrial client offtake agreements verified onchain by Chainlink CRE.'}
                    </p>
                  </div>
                </Card>
              )}

              {/* TAB 2: SHARIA & LEGAL STRUCTURE */}
              {activeTab === 'sharia' && (
                <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-text">
                        Sharia & Legal Architecture
                      </h2>
                      <p className="text-xs text-gold font-mono uppercase tracking-wider mt-0.5">
                        AAOIFI Standards Compliance & SPV Governance Architecture
                      </p>
                    </div>
                    <span className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Scale className="size-5" />
                    </span>
                  </div>

                  {isMurabaha ? (
                    <div className="space-y-4 text-xs text-textMuted leading-relaxed">
                      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
                        <strong className="text-gold font-mono uppercase text-[11px] block">
                          Murabaha Cost-Plus Trade Finance Mechanics
                        </strong>
                        <p>
                          1. <strong>Constructive Ownership:</strong> The dedicated Special Purpose Vehicle (SPV) takes constructive possession of the inventory batch on behalf of retail investors before selling to the merchant.
                        </p>
                        <p>
                          2. <strong>Fixed Markup:</strong> The sale price comprises the cost price plus a pre-agreed profit margin. There is zero interest compounding or late-payment interest penalties.
                        </p>
                        <p>
                          3. <strong>Principal Buyback Protection:</strong> If any portion of the inventory remains unsold upon term expiration, the SME is legally bound by an enforceable buyback clause to repurchase remaining goods at original cost.
                        </p>
                      </div>

                      <div className="rounded-xl border border-line bg-panelMuted p-4">
                        <strong className="text-text block mb-1">KSA Regulatory Sandbox Classification</strong>
                        <p>
                          Structured to comply with Saudi Central Bank (SAMA) debt-crowdfunding rules and CMA Arranging frameworks under an Experimental Permit.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs text-textMuted leading-relaxed">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                        <strong className="text-emerald-400 font-mono uppercase text-[11px] block">
                          Musharakah Proportional Asset Partnership Mechanics
                        </strong>
                        <p>
                          1. <strong>Asset Equity (Not Enterprise Debt):</strong> Investors acquire fractional units representing proportional ownership in the specific capital asset (e.g. WaaS wastewater treatment facility), not the SME enterprise as a whole.
                        </p>
                        <p>
                          2. <strong>Genuine Profit-and-Loss Sharing:</strong> Payouts track actual verified performance and client offtake revenue. Both upside and downside are proportionally shared.
                        </p>
                        <p>
                          3. <strong>Cryptographic Verification:</strong> Eliminates the "Oracle Problem" by streaming IoT water flow and pressure telemetry into Chainlink CRE.
                        </p>
                      </div>

                      <div className="rounded-xl border border-line bg-panelMuted p-4">
                        <strong className="text-text block mb-1">CMA FinTech Lab Alignment</strong>
                        <p>
                          Operates under fractional securities offering principles, safeguarding retail investors with transparent onchain telemetry and non-custodial smart contracts.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* TAB 3: CHAINLINK CRE ORACLE PROOFS */}
              {activeTab === 'oracle' && (
                <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-text">
                        Live Chainlink CRE Verification Telemetry
                      </h2>
                      <p className="text-xs text-textMuted mt-0.5">
                        Decentralized cryptographic proofs bridging physical reality with onchain settlements.
                      </p>
                    </div>
                    <span className="size-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <Radio className="size-5 animate-pulse" />
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono">
                    <div className="rounded-xl border border-line bg-panelMuted p-3">
                      <span className="text-textMuted text-[10px]">Oracle Coordinator Contract</span>
                      <p className="text-text font-bold truncate mt-1">
                        {contracts.oracleCoordinator.address}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3">
                      <span className="text-textMuted text-[10px]">Revenue Registry Contract</span>
                      <p className="text-text font-bold truncate mt-1">
                        {contracts.revenueRegistry.address}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3">
                      <span className="text-textMuted text-[10px]">Oracle Data Source</span>
                      <p className="text-text font-bold mt-1">
                        {meta?.oracleType === 'iot_telemetry' ? 'Industrial IoT Telemetry' : 'POS Checkout API (Square/Foodics)'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-line bg-panelMuted p-3">
                      <span className="text-textMuted text-[10px]">Attestation Status</span>
                      <p className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                        VERIFIED ONCHAIN
                      </p>
                    </div>
                  </div>

                  {/* Simulated Cryptographic Telemetry Log */}
                  <div className="rounded-xl border border-line bg-black/70 p-4 font-mono text-[11px] text-emerald-400/90 space-y-1 overflow-x-auto">
                    <p className="text-textMuted">// Chainlink CRE Runtime Consensus Proof</p>
                    <p>
                      [CRE_NODE_CONSENSUS]: Period ID 0x62ad...bc5eBD9D · Status: VERIFIED
                    </p>
                    <p>
                      [TELEMETRY_PAYLOAD]: {meta?.oracleType === 'iot_telemetry' ? 'Flow Rate: 420.5 m³/day · Pressure: 4.2 bar · Turbidity: Normal' : 'Net Units Sold: 480 · Gross Sales Minor: 96000000 · Refunds: 0'}
                    </p>
                    <p>
                      [ONCHAIN_TX]: OracleCoordinator.writeReport() confirmed at Sepolia L2
                    </p>
                    <p className="text-gold">
                      [SETTLEMENT_VAULT]: Yield allocation calculated for batch #{onChain.id.toString()}
                    </p>
                  </div>
                </Card>
              )}

              {/* TAB 4: RETURNS CALCULATOR */}
              {activeTab === 'calculator' && (
                <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
                  <h2 className="font-heading text-xl font-bold text-text">Yield & Profit Calculator</h2>
                  <p className="text-xs text-textMuted">
                    Simulate your fractional investment starting from $10 (~37.5 SAR).
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-textMuted">Investment Amount:</span>
                        <strong className="text-text">${calcAmount} USDC ({ (calcAmount * SAR_PER_USDC).toFixed(1) } SAR)</strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="2000"
                        step="10"
                        value={calcAmount}
                        onChange={(e) => setCalcInvestment(e.target.value)}
                        className="w-full accent-[#133359]"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 pt-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase text-slate-400">Net Profit (USDC)</span>
                        <p className="text-xl font-bold font-heading text-emerald-600 mt-1">
                          +${projectedProfitUsdc}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase text-slate-400">Net Profit (SAR)</span>
                        <p className="text-xl font-bold font-heading text-[#133359] mt-1">
                          +{projectedProfitSar} SAR
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase text-slate-400">Total Payout</span>
                        <p className="text-xl font-bold font-heading text-slate-900 mt-1">
                          ${projectedReturnUsdc}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Investment Module */}
            <div className="space-y-5">
              {!onChain.closed ? (
                <Card className="p-6 space-y-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-heading text-lg font-bold text-slate-900">Invest in Batch</h2>
                    <span className="font-mono text-xs text-[#133359] font-bold">from $10</span>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex gap-2">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
                    <span className="text-[11px] leading-tight">
                      Compliance whitelist enforced onchain. Your wallet must be verified for GCC regulatory sandbox participation.
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <CategoryBuyCard
                          key={cat.categoryIdHash}
                          batchId={onChain.id}
                          category={cat}
                          purchaseToken={onChain.purchaseToken}
                          isMurabaha={isMurabaha}
                          onSuccess={refetch}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-textMuted py-4 text-center">No categories configured.</p>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center text-sm text-textMuted">
                  This offering batch is closed and no longer accepting subscriptions.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
