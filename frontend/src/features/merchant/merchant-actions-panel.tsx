'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { prepareContractCall } from 'thirdweb'
import { useActiveAccount } from 'thirdweb/react'
import { keccak256, stringToBytes, isAddress } from 'viem'
import { CheckCircle2, Cpu, Database, Droplet, Radio, Scale, ScanLine, ShoppingBag, Sparkles } from 'lucide-react'
import { CapabilityGate } from '@/components/shared/capability-gate'
import { TxStatus } from '@/components/shared/tx-status'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTransactionAction } from '@/features/transactions/use-transaction-action'
import { useCapabilities } from '@/hooks/use-capabilities'
import { contracts } from '@/lib/web3/contracts'

const merchantId = 'rubh-sme-ksa'

const isWholePositive = (value: string): boolean => /^\d+$/.test(value) && value !== '0'

export const MerchantActionsPanel = () => {
  const account = useActiveAccount()
  const address = account?.address
  const { capabilities, isConnected } = useCapabilities()

  // Sharia structure selection
  const [financingStructure, setFinancingStructure] = useState<'murabaha' | 'musharakah'>('murabaha')
  const [oracleType, setOracleType] = useState<'pos' | 'iot'>('pos')

  // Form fields
  const [createTokenName, setCreateTokenName] = useState('Rubh Unit Token')
  const [createTokenSymbol, setCreateTokenSymbol] = useState('RUT')
  const [createPurchaseToken, setCreatePurchaseToken] = useState('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238') // Sepolia USDC
  const [createUnitCostMinor, setCreateUnitCostMinor] = useState('10000000') // $10 USDC
  const [createUnitPayoutMinor, setCreateUnitPayoutMinor] = useState('11200000') // $11.20 (12% return)
  const [createUnitsForSale, setCreateUnitsForSale] = useState('2000') // 2000 units = $20,000 target
  const [createProductId, setCreateProductId] = useState('Retail-Inventory-Restock')

  // Quick preset templates
  const applyPreset = (type: 'waas' | 'retail' | 'fleet' | 'coffee') => {
    if (type === 'waas') {
      setFinancingStructure('musharakah')
      setOracleType('iot')
      setCreateProductId('WaaS-Industrial-Water-Station')
      setCreateTokenName('Rubh WaaS Station Unit')
      setCreateTokenSymbol('RUT-WAAS')
      setCreateUnitCostMinor('10000000') // $10
      setCreateUnitPayoutMinor('11820000') // 18.2% APY
      setCreateUnitsForSale('40000') // $400k facility
    } else if (type === 'retail') {
      setFinancingStructure('murabaha')
      setOracleType('pos')
      setCreateProductId('Luxury-Apparel-Seasonal-Restock')
      setCreateTokenName('Rubh Apparel Murabaha Unit')
      setCreateTokenSymbol('RUT-APR')
      setCreateUnitCostMinor('10000000') // $10
      setCreateUnitPayoutMinor('11200000') // 12% markup
      setCreateUnitsForSale('20000') // $200k restock
    } else if (type === 'fleet') {
      setFinancingStructure('musharakah')
      setOracleType('iot')
      setCreateProductId('Riyadh-EV-Fleet-Units')
      setCreateTokenName('Rubh EcoFleet Share')
      setCreateTokenSymbol('RUT-EV')
      setCreateUnitCostMinor('25000000') // $25
      setCreateUnitPayoutMinor('29125000') // 16.5% yield
      setCreateUnitsForSale('20000') // $500k fleet
    } else if (type === 'coffee') {
      setFinancingStructure('murabaha')
      setOracleType('pos')
      setCreateProductId('Specialty-Green-Coffee-Batch')
      setCreateTokenName('Rubh Roastery Unit')
      setCreateTokenSymbol('RUT-ROAST')
      setCreateUnitCostMinor('10000000') // $10
      setCreateUnitPayoutMinor('11150000') // 11.5% markup
      setCreateUnitsForSale('12000') // $120k consignment
    }
  }

  const [fundBatchId, setFundBatchId] = useState('1')
  const [fundAmountMinor, setFundAmountMinor] = useState('100000000')

  const [withdrawBatchId, setWithdrawBatchId] = useState('1')
  const [withdrawAmountMinor, setWithdrawAmountMinor] = useState('1000000')
  const [withdrawTo, setWithdrawTo] = useState('')

  const createAction = useTransactionAction()
  const fundAction = useTransactionAction()
  const withdrawAction = useTransactionAction()

  const canTransact = capabilities.canUseMerchant && isConnected && Boolean(address)

  const createInvalid =
    !isAddress(createPurchaseToken as `0x${string}`) ||
    !isWholePositive(createUnitCostMinor) ||
    !isWholePositive(createUnitPayoutMinor) ||
    !isWholePositive(createUnitsForSale)

  const fundInvalid = !isWholePositive(fundBatchId) || !isWholePositive(fundAmountMinor)
  const withdrawInvalid =
    !isWholePositive(withdrawBatchId) || !isWholePositive(withdrawAmountMinor) || !isAddress(withdrawTo)

  const handleCreateBatch = async (): Promise<void> => {
    if (!address || createInvalid) {
      return
    }

    const hash = await createAction.run(
      prepareContractCall({
        contract: contracts.factory,
        method:
          'function createBatch(bytes32 merchantIdHash, bytes32 productIdHash, address purchaseToken, uint256 unitCostMinor, uint256 unitPayoutMinor, uint256 unitsForSale, string tokenName, string tokenSymbol, address merchantTreasury, address complianceTreasury)',
        params: [
          keccak256(stringToBytes(merchantId)),
          keccak256(stringToBytes(createProductId)),
          createPurchaseToken as `0x${string}`,
          BigInt(createUnitCostMinor),
          BigInt(createUnitPayoutMinor),
          BigInt(createUnitsForSale),
          createTokenName,
          createTokenSymbol,
          address,
          address,
        ],
      }),
    )

    if (hash) {
      toast.success('Rubh financing batch successfully created onchain!')
    }
  }

  const handleFundBatch = async (): Promise<void> => {
    if (fundInvalid) {
      return
    }

    const hash = await fundAction.run(
      prepareContractCall({
        contract: contracts.settlementVault,
        method: 'function fundBatch(uint256 batchId, uint256 amountMinor)',
        params: [BigInt(fundBatchId), BigInt(fundAmountMinor)],
      }),
    )

    if (hash) {
      toast.success('Fund batch transaction submitted')
    }
  }

  const handleWithdraw = async (): Promise<void> => {
    if (withdrawInvalid) {
      return
    }

    const hash = await withdrawAction.run(
      prepareContractCall({
        contract: contracts.settlementVault,
        method: 'function withdrawProceeds(uint256 batchId, uint256 amountMinor, address to)',
        params: [BigInt(withdrawBatchId), BigInt(withdrawAmountMinor), withdrawTo as `0x${string}`],
      }),
    )

    if (hash) {
      toast.success('Withdraw proceeds submitted')
    }
  }

  return (
    <CapabilityGate capability="canUseMerchant" title="SME Financing & Issuance Portal">
      <div className="space-y-6">
        {/* Header with Rubh framing */}
        <div className="border-b border-line pb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-gold font-bold">
            SME CAPITAL ISSUANCE ENGINE
          </span>
          <h2 className="font-heading text-2xl font-bold text-text mt-1">
            Issue Sharia-Compliant RWA Financing
          </h2>
          <p className="text-xs text-textMuted mt-1">
            Tokenize physical fast-moving inventory (Murabaha) or capital equipment (Musharakah) with automated Chainlink CRE settlement.
          </p>
        </div>

        {/* Preset Templates */}
        <Card className="p-4 space-y-3 rounded-2xl border border-line bg-panel/60">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
              Quick Deal Presets (GCC Templates)
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => applyPreset('waas')}
              className="rounded-xl border border-line bg-panelMuted p-3 text-left hover:border-emerald-500/60 transition-all text-xs space-y-1"
            >
              <span className="font-bold text-emerald-400 block font-heading">
                WaaS Water Station
              </span>
              <span className="text-[10px] text-textMuted block font-mono">
                Musharakah · 18.2% APY · IoT Telemetry
              </span>
            </button>
            <button
              onClick={() => applyPreset('retail')}
              className="rounded-xl border border-line bg-panelMuted p-3 text-left hover:border-gold/60 transition-all text-xs space-y-1"
            >
              <span className="font-bold text-gold block font-heading">
                Retail Apparel Restock
              </span>
              <span className="text-[10px] text-textMuted block font-mono">
                Murabaha · 12.0% Markup · POS Feed
              </span>
            </button>
            <button
              onClick={() => applyPreset('fleet')}
              className="rounded-xl border border-line bg-panelMuted p-3 text-left hover:border-emerald-500/60 transition-all text-xs space-y-1"
            >
              <span className="font-bold text-emerald-400 block font-heading">
                Riyadh EcoFleet Mobility
              </span>
              <span className="text-[10px] text-textMuted block font-mono">
                Musharakah · 16.5% Yield · Telematics
              </span>
            </button>
            <button
              onClick={() => applyPreset('coffee')}
              className="rounded-xl border border-line bg-panelMuted p-3 text-left hover:border-gold/60 transition-all text-xs space-y-1"
            >
              <span className="font-bold text-gold block font-heading">
                Specialty Roastery Coffee
              </span>
              <span className="text-[10px] text-textMuted block font-mono">
                Murabaha · 11.5% Markup · POS Feed
              </span>
            </button>
          </div>
        </Card>

        {/* Step 1: Sharia Structure & Oracle Source */}
        <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-gold" />
            <h3 className="font-heading text-lg font-bold text-text">
              1. Select Financing Structure & Oracle Source
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setFinancingStructure('murabaha')
                setOracleType('pos')
              }}
              className={`rounded-2xl border p-4 text-left transition-all space-y-2 ${
                financingStructure === 'murabaha'
                  ? 'border-[#133359] bg-[#133359]/5 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-[#133359]">
                  Model A · Murabaha
                </span>
                <span className="text-[10px] font-medium text-slate-500">Trade Finance</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900">Murabaha (Cost-Plus Trade)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated SPV constructive inventory purchase with pre-agreed markup and contractually enforceable buyback clause at term end. Verified via POS (Square/Foodics).
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setFinancingStructure('musharakah')
                setOracleType('iot')
              }}
              className={`rounded-2xl border p-4 text-left transition-all space-y-2 ${
                financingStructure === 'musharakah'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-emerald-700">
                  Model B · Musharakah
                </span>
                <span className="text-[10px] font-medium text-slate-500">Asset Equity</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900">Musharakah (Asset Revenue-Share)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fractional proportional partnership in a revenue-generating capital asset (WaaS water stations, vehicle fleets). Verified via Chainlink CRE IoT telemetry.
              </p>
            </button>
          </div>
        </Card>

        {/* Step 2: Contract Parameters & Issuance */}
        <Card className="p-6 space-y-5 rounded-2xl border border-line bg-panel/75">
          <div className="flex items-center gap-2">
            <ScanLine className="size-5 text-emerald-400" />
            <h3 className="font-heading text-lg font-bold text-text">
              2. Onchain Token & Financial Parameters
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Product Identifier
              <Input
                value={createProductId}
                onChange={(e) => setCreateProductId(e.target.value)}
                className="text-xs h-9"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Token Name
              <Input
                value={createTokenName}
                onChange={(e) => setCreateTokenName(e.target.value)}
                className="text-xs h-9"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Token Symbol (e.g. RUT)
              <Input
                value={createTokenSymbol}
                onChange={(e) => setCreateTokenSymbol(e.target.value)}
                className="text-xs h-9 font-bold text-gold"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Settlement Currency (ERC-20 Address)
              <Input
                value={createPurchaseToken}
                onChange={(e) => setCreatePurchaseToken(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Unit Cost Minor ($10 = 10000000 USDC)
              <Input
                value={createUnitCostMinor}
                onChange={(e) => setCreateUnitCostMinor(e.target.value)}
                className="text-xs h-9"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Unit Target Payout Minor
              <Input
                value={createUnitPayoutMinor}
                onChange={(e) => setCreateUnitPayoutMinor(e.target.value)}
                className="text-xs h-9"
              />
            </label>

            <label className="space-y-1.5 text-xs text-textMuted font-mono">
              Total Units For Sale
              <Input
                value={createUnitsForSale}
                onChange={(e) => setCreateUnitsForSale(e.target.value)}
                className="text-xs h-9"
              />
            </label>
          </div>

          <Button
            onClick={handleCreateBatch}
            disabled={!canTransact || createInvalid || createAction.isLoading}
            className="w-full font-mono text-xs uppercase tracking-wider bg-gold text-canvas hover:brightness-110"
          >
            {createAction.isLoading ? 'Submitting Batch Onchain…' : 'Deploy Rubh Batch & Mint Units'}
          </Button>

          <TxStatus action={createAction} />
        </Card>

        {/* Step 3: Vault Settlement Operations */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-5 space-y-4 rounded-2xl border border-line bg-panel/75">
            <h4 className="font-heading font-bold text-text text-sm">Pre-Fund Settlement Vault</h4>
            <p className="text-xs text-textMuted">
              Deposit revenue liquidity to facilitate automated payout distributions to fractional investors.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-mono text-textMuted">
                Batch ID
                <Input
                  value={fundBatchId}
                  onChange={(e) => setFundBatchId(e.target.value)}
                  className="text-xs h-9 mt-1"
                />
              </label>
              <label className="block text-xs font-mono text-textMuted">
                Amount Minor (USDC 6 decimals)
                <Input
                  value={fundAmountMinor}
                  onChange={(e) => setFundAmountMinor(e.target.value)}
                  className="text-xs h-9 mt-1"
                />
              </label>
              <Button
                onClick={handleFundBatch}
                disabled={!canTransact || fundInvalid || fundAction.isLoading}
                variant="secondary"
                className="w-full text-xs font-mono uppercase"
              >
                {fundAction.isLoading ? 'Funding…' : 'Fund Batch'}
              </Button>
            </div>
            <TxStatus action={fundAction} />
          </Card>

          <Card className="p-5 space-y-4 rounded-2xl border border-line bg-panel/75">
            <h4 className="font-heading font-bold text-text text-sm">Withdraw Capital Proceeds</h4>
            <p className="text-xs text-textMuted">
              SME withdrawal of raised investor capital for approved inventory purchase or CAPEX deployment.
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-mono text-textMuted">
                Batch ID
                <Input
                  value={withdrawBatchId}
                  onChange={(e) => setWithdrawBatchId(e.target.value)}
                  className="text-xs h-9 mt-1"
                />
              </label>
              <label className="block text-xs font-mono text-textMuted">
                Amount Minor
                <Input
                  value={withdrawAmountMinor}
                  onChange={(e) => setWithdrawAmountMinor(e.target.value)}
                  className="text-xs h-9 mt-1"
                />
              </label>
              <label className="block text-xs font-mono text-textMuted">
                Recipient Wallet
                <Input
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  placeholder="0x..."
                  className="text-xs h-9 mt-1"
                />
              </label>
              <Button
                onClick={handleWithdraw}
                disabled={!canTransact || withdrawInvalid || withdrawAction.isLoading}
                variant="secondary"
                className="w-full text-xs font-mono uppercase"
              >
                {withdrawAction.isLoading ? 'Withdrawing…' : 'Withdraw Proceeds'}
              </Button>
            </div>
            <TxStatus action={withdrawAction} />
          </Card>
        </div>
      </div>
    </CapabilityGate>
  )
}
