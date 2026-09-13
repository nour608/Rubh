// Backend-persisted listing metadata store with Rubh Sharia dual-structure support.
// On-chain data (units, cost, status) comes from the contract.
// Holds enriched metadata: title, description, image, sector, location,
// financing structure (Murabaha vs Musharakah), and Chainlink CRE verification mode.

import { env } from '@/lib/env'
import { getWalletApiAuthHeaders, type WalletAuthAccount } from '@/lib/api/wallet-auth'

export type FinancingStructure = 'murabaha' | 'musharakah'
export type OracleType = 'pos_square' | 'iot_telemetry' | 'erp'

export interface ListingMeta {
  batchId: string // on-chain batchId as string (e.g. "1")
  title: string
  description: string
  imageUrl: string
  sector: string
  location: string
  financingStructure?: FinancingStructure
  shariaCompliant?: boolean
  oracleType?: OracleType
  targetApy?: number
  termDuration?: string
  repaymentSchedule?: string
  buybackClause?: boolean
  telemetryUnit?: string
  spvDetails?: string
  minTicketUsdc?: number
}

export const RUBH_SEED_LISTINGS: ListingMeta[] = [
  {
    batchId: '1',
    title: 'Tawrea Water-as-a-Service (WaaS) Facility',
    description:
      'Fractional proportional equity in a Build-Own-Operate (BOO) industrial wastewater treatment station in Dammam 2nd Industrial City. The facility treats and recycles high-salinity industrial effluent under a 10-year offtake contract. IoT flow meters and water quality telemetry are connected directly onchain via Chainlink CRE.',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    sector: 'Industrial Cleantech & Utilities',
    location: 'Dammam Industrial City, KSA',
    financingStructure: 'musharakah',
    shariaCompliant: true,
    oracleType: 'iot_telemetry',
    targetApy: 18.2,
    termDuration: '36 Months',
    repaymentSchedule: 'Monthly Profit Share',
    buybackClause: false,
    telemetryUnit: 'm³ treated/day',
    spvDetails: 'Rubh SPV I (Orphan Entity / Arranger Status)',
    minTicketUsdc: 10,
  },
  {
    batchId: '2',
    title: 'Al-Nakhla Luxury Retail Seasonal Restock',
    description:
      'A dedicated SPV takes constructive ownership of a premium seasonal collection imported for Jeddah peak retail season, then resells it to the SME at a fixed 12.0% markup. Chainlink CRE verifies sell-through directly from the merchant POS system with automated repayment. Includes a legally enforced buyback clause protecting investor principal.',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    sector: 'Fashion & Luxury Retail',
    location: 'Tahliya Street, Jeddah, KSA',
    financingStructure: 'murabaha',
    shariaCompliant: true,
    oracleType: 'pos_square',
    targetApy: 12.0,
    termDuration: '6 Months',
    repaymentSchedule: 'Daily POS Sell-Through',
    buybackClause: true,
    telemetryUnit: 'Units Sold / POS',
    spvDetails: 'Rubh Murabaha SPV II (Constructive Title)',
    minTicketUsdc: 10,
  },
  {
    batchId: '3',
    title: 'Riyadh EcoFleet Commercial EV Expansion',
    description:
      'Fractional profit-share in 40 commercial electric vehicles operating across Riyadh airport and corporate transfer routes. Telematics IoT hardware verifies vehicle utilization, battery health, and daily gross fare revenues onchain via Chainlink CRE.',
    imageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    sector: 'Mobility & Cleantech',
    location: 'Riyadh, KSA',
    financingStructure: 'musharakah',
    shariaCompliant: true,
    oracleType: 'iot_telemetry',
    targetApy: 16.5,
    termDuration: '24 Months',
    repaymentSchedule: 'Weekly Yield Distribution',
    buybackClause: false,
    telemetryUnit: 'Km & Fare Revenues',
    spvDetails: 'Rubh SPV III (Asset Equity)',
    minTicketUsdc: 10,
  },
  {
    batchId: '4',
    title: 'Artisan Specialty Roastery Q3 Green Coffee Inventory',
    description:
      'Cost-plus trade finance for specialty single-origin Ethiopian and Colombian green coffee beans. Inventory turnover tracked directly through Foodics POS to onchain smart contracts with guaranteed buyback protection at term end.',
    imageUrl:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop',
    sector: 'Specialty F&B',
    location: 'Al-Olaya, Riyadh, KSA',
    financingStructure: 'murabaha',
    shariaCompliant: true,
    oracleType: 'pos_square',
    targetApy: 11.5,
    termDuration: '90 Days',
    repaymentSchedule: 'Bi-Weekly Sell-Through',
    buybackClause: true,
    telemetryUnit: 'Kg Roasted & Sold',
    spvDetails: 'Rubh Murabaha SPV I',
    minTicketUsdc: 10,
  },
]

const base = () => env.NEXT_PUBLIC_BACKEND_BASE_URL

// ─── Read helpers (public, no auth) ────────────────────────────────────────

export const listingStore = {
  /** Get metadata for a single batch, or seed fallback if not found. */
  async get(batchId: string | number): Promise<ListingMeta | undefined> {
    const idStr = String(batchId)
    const seed = RUBH_SEED_LISTINGS.find((m) => m.batchId === idStr)
    try {
      const res = await fetch(`${base()}/listings/${batchId}`, { cache: 'no-store' })
      if (!res.ok) return seed
      const data = (await res.json()) as ListingMeta
      return { ...seed, ...data }
    } catch {
      return seed
    }
  },

  /** List all listings' metadata merged with Rubh seed listings. */
  async list(): Promise<ListingMeta[]> {
    try {
      const res = await fetch(`${base()}/listings`, { cache: 'no-store' })
      if (!res.ok) return RUBH_SEED_LISTINGS
      const data = (await res.json()) as { listings: ListingMeta[] }
      const backendListings = data.listings ?? []

      // Merge backend items with seed defaults
      const mergedMap = new Map<string, ListingMeta>()
      RUBH_SEED_LISTINGS.forEach((item) => mergedMap.set(item.batchId, item))
      backendListings.forEach((item) => {
        const existing = mergedMap.get(item.batchId)
        mergedMap.set(item.batchId, existing ? { ...existing, ...item } : item)
      })

      return Array.from(mergedMap.values())
    } catch {
      return RUBH_SEED_LISTINGS
    }
  },

  /** Upsert metadata — requires admin wallet auth. Called from admin dashboard. */
  async set(meta: ListingMeta, account: WalletAuthAccount): Promise<ListingMeta> {
    const authHeaders = await getWalletApiAuthHeaders(account, base())
    const res = await fetch(`${base()}/listings/${meta.batchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        title: meta.title,
        description: meta.description,
        imageUrl: meta.imageUrl,
        sector: meta.sector,
        location: meta.location,
        financingStructure: meta.financingStructure,
        shariaCompliant: meta.shariaCompliant,
        oracleType: meta.oracleType,
        targetApy: meta.targetApy,
        termDuration: meta.termDuration,
        repaymentSchedule: meta.repaymentSchedule,
        buybackClause: meta.buybackClause,
        telemetryUnit: meta.telemetryUnit,
        spvDetails: meta.spvDetails,
      }),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(err.message ?? `Failed to save listing (${res.status})`)
    }
    return res.json() as Promise<ListingMeta>
  },
}
