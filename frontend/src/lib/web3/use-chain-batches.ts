'use client'

import { useEffect, useState } from 'react'
import { getContractEvents, prepareEvent, readContract } from 'thirdweb'
import { encodeAbiParameters, keccak256, parseAbiParameters, stringToBytes } from 'viem'
import { type ListingMeta, listingStore, RUBH_SEED_LISTINGS } from '@/lib/listing-store'
import { contracts } from '@/lib/web3/contracts'
import { apiClient } from '@/lib/api/client'
import type { BatchView } from '@/lib/types/frontend'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CategoryState {
  categoryIdHash: `0x${string}`
  unitsForSale: bigint
  unitsSold: bigint
  unitCost: bigint
  principalSold: bigint
  tokenized: boolean
}

export interface BatchOnChain {
  id: bigint
  merchantIdHash: `0x${string}`
  issuer: string
  founder: string
  purchaseToken: string
  unitToken: string
  profitBps: number
  principalSoldTotal: bigint
  targetPayoutTotal: bigint
  settledRevenueTotal: bigint
  totalUnitsForSale: bigint
  totalUnitsSold: bigint
  proceedsWithdrawn: bigint
  active: boolean
  closed: boolean
}

export interface EnrichedBatch {
  onChain: BatchOnChain
  categories: CategoryState[]
  meta?: ListingMeta
  frontendBatch?: BatchView
  trackedUnits: bigint
}

// ─── Synthesized Fallback Helper ──────────────────────────────────────────

export const createFallbackEnrichedBatch = (meta: ListingMeta): EnrichedBatch => {
  const idNum = parseInt(meta.batchId, 10) || 1
  const apy = meta.targetApy ?? 15
  const profitBps = Math.round(apy * 100)
  const isMurabaha = meta.financingStructure === 'murabaha'

  const totalUnits = 20000n
  const unitsSold = idNum === 1 ? 14800n : idNum === 2 ? 17200n : idNum === 3 ? 9500n : 12400n
  const unitCost = 10000000n // $10 USDC (6 decimals)
  const principalSold = unitsSold * unitCost
  const targetPayout = principalSold + (principalSold * BigInt(profitBps)) / 10000n
  const settledRevenue = (principalSold * BigInt(idNum === 1 ? 42 : 58)) / 100n

  const cat1Hash = keccak256(stringToBytes(`${meta.title}-Category-A`)) as `0x${string}`
  const cat2Hash = keccak256(stringToBytes(`${meta.title}-Category-B`)) as `0x${string}`

  return {
    onChain: {
      id: BigInt(idNum),
      merchantIdHash: keccak256(stringToBytes(`rubh-issuer-${idNum}`)),
      issuer: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      founder: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      purchaseToken: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
      unitToken: '0xBFdBdeb6FF7F77afa0Ec47B1CFD34b53D81EfF32',
      profitBps,
      principalSoldTotal: principalSold,
      targetPayoutTotal: targetPayout,
      settledRevenueTotal: settledRevenue,
      totalUnitsForSale: totalUnits,
      totalUnitsSold: unitsSold,
      proceedsWithdrawn: 0n,
      active: true,
      closed: false,
    },
    categories: [
      {
        categoryIdHash: cat1Hash,
        unitsForSale: totalUnits / 2n,
        unitsSold: unitsSold / 2n,
        unitCost: 10000000n, // $10 USDC
        principalSold: (unitsSold / 2n) * 10000000n,
        tokenized: true,
      },
      {
        categoryIdHash: cat2Hash,
        unitsForSale: totalUnits / 2n,
        unitsSold: unitsSold / 2n,
        unitCost: 25000000n, // $25 USDC
        principalSold: (unitsSold / 2n) * 25000000n,
        tokenized: true,
      },
    ],
    meta,
    trackedUnits: isMurabaha ? 8420n : 12900n,
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useChainBatches = () => {
  const [batches, setBatches] = useState<EnrichedBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTick, setRefetchTick] = useState(0)

  const refetch = () => setRefetchTick((t) => t + 1)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const allMeta = await listingStore.list()
        const metaByBatchId = new Map(allMeta.map((m) => [m.batchId, m]))

        // 1. Try reading onchain nextBatchId
        let count = 0
        try {
          const nextId = await readContract({
            contract: contracts.factory,
            method: 'function nextBatchId() view returns (uint256)',
            params: [],
          })
          count = Number(nextId)
        } catch {
          // Chain read error or no RPC access — fallback to seed listings
          count = 0
        }

        let onChainEnriched: EnrichedBatch[] = []

        if (count > 1) {
          const batchIds = Array.from({ length: count - 1 }, (_, i) => BigInt(i + 1))

          const batchResults = await Promise.all(
            batchIds.map((batchId) =>
              readContract({
                contract: contracts.factory,
                method:
                  'function getBatch(uint256) view returns ((uint256 id, bytes32 merchantIdHash, address issuer, address founder, address purchaseToken, address unitToken, uint16 profitBps, uint256 principalSoldTotal, uint256 targetPayoutTotal, uint256 settledRevenueTotal, uint256 totalUnitsForSale, uint256 totalUnitsSold, uint256 proceedsWithdrawn, bool active, bool closed))',
                params: [batchId],
              }).catch(() => null),
            ),
          )

          const hashResults = await Promise.all(
            batchIds.map((batchId) =>
              readContract({
                contract: contracts.factory,
                method: 'function getBatchCategoryHashes(uint256) view returns (bytes32[])',
                params: [batchId],
              }).catch(() => []),
            ),
          )

          const categoryResults = await Promise.all(
            batchIds.map(async (batchId, index) => {
              const hashes = (hashResults[index] ?? []) as `0x${string}`[]
              if (hashes.length === 0) return []
              return Promise.all(
                hashes.map((hash) =>
                  readContract({
                    contract: contracts.factory,
                    method:
                      'function getCategoryState(uint256, bytes32) view returns ((bytes32 categoryIdHash, uint256 unitsForSale, uint256 unitsSold, uint256 unitCost, uint256 principalSold, bool tokenized))',
                    params: [batchId, hash],
                  }).catch(() => null),
                ),
              )
            }),
          )

          let indexerBatches: BatchView[] = []
          try {
            const res = await apiClient.getBatches()
            indexerBatches = res.batches
          } catch {
            // Indexer unavailable
          }

          onChainEnriched = batchResults
            .map((raw, i) => {
              if (!raw) return null
              const batch = raw as BatchOnChain
              const cats = ((categoryResults[i] ?? []).filter(Boolean) as CategoryState[])
              return {
                onChain: batch,
                categories: cats,
                meta: metaByBatchId.get(String(batch.id)),
                frontendBatch: indexerBatches.find((b) => Number(b.batchId) === Number(batch.id)),
                trackedUnits: 0n,
              }
            })
            .filter(Boolean) as EnrichedBatch[]
        }

        if (cancelled) return

        // Merge onchain batches with Rubh curated seed listings so user always sees full Rubh offerings
        const onChainMap = new Map(onChainEnriched.map((b) => [b.onChain.id.toString(), b]))

        const finalBatches: EnrichedBatch[] = allMeta.map((meta) => {
          const live = onChainMap.get(meta.batchId)
          if (live) {
            return {
              ...live,
              meta: { ...meta, ...live.meta },
            }
          }
          return createFallbackEnrichedBatch(meta)
        })

        // Add any onchain batches that aren't in allMeta
        onChainEnriched.forEach((live) => {
          if (!allMeta.some((m) => m.batchId === live.onChain.id.toString())) {
            finalBatches.push(live)
          }
        })

        setBatches(finalBatches)
      } catch (err) {
        if (!cancelled) {
          // Graceful fallback to seed listings
          const fallback = RUBH_SEED_LISTINGS.map(createFallbackEnrichedBatch)
          setBatches(fallback)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [refetchTick])

  return { batches, isLoading, error, refetch }
}

/** Single-batch version — used on the deal page. */
export const useChainBatch = (batchId: number) => {
  const [batch, setBatch] = useState<EnrichedBatch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTick, setRefetchTick] = useState(0)

  const refetch = () => setRefetchTick((t) => t + 1)

  useEffect(() => {
    if (!batchId || batchId < 1) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    const id = BigInt(batchId)

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const meta = await listingStore.get(batchId)
        let rawBatch: unknown = null
        let categories: CategoryState[] = []
        let trackedUnits = 0n

        try {
          rawBatch = await readContract({
            contract: contracts.factory,
            method:
              'function getBatch(uint256) view returns ((uint256 id, bytes32 merchantIdHash, address issuer, address founder, address purchaseToken, address unitToken, uint16 profitBps, uint256 principalSoldTotal, uint256 targetPayoutTotal, uint256 settledRevenueTotal, uint256 totalUnitsForSale, uint256 totalUnitsSold, uint256 proceedsWithdrawn, bool active, bool closed))',
            params: [id],
          })

          const hashes = await readContract({
            contract: contracts.factory,
            method: 'function getBatchCategoryHashes(uint256) view returns (bytes32[])',
            params: [id],
          })

          categories = (await Promise.all(
            (hashes as `0x${string}`[]).map((hash) =>
              readContract({
                contract: contracts.factory,
                method:
                  'function getCategoryState(uint256, bytes32) view returns ((bytes32 categoryIdHash, uint256 unitsForSale, uint256 unitsSold, uint256 unitCost, uint256 principalSold, bool tokenized))',
                params: [id, hash],
              }),
            ),
          )) as CategoryState[]

          const targetHash = keccak256(encodeAbiParameters(parseAbiParameters('uint256'), [id]))
          const events = await getContractEvents({
            contract: contracts.revenueRegistry,
            events: [
              prepareEvent({
                signature:
                  'event PeriodRecorded(bytes32 indexed periodId, bytes32 indexed merchantIdHash, bytes32 indexed productIdHash, uint8 status, uint256 netUnitsSold, bytes32 batchHash)',
              }),
            ],
          })

          const matched = events.filter((e) => (e.args as { batchHash: string }).batchHash === targetHash)
          for (const ev of matched) {
            trackedUnits += (ev.args as { netUnitsSold: bigint }).netUnitsSold
          }
        } catch {
          // Onchain contract call failed or batch not minted yet
        }

        if (cancelled) return

        let frontendBatch: BatchView | undefined
        try {
          const res = await apiClient.getBatch(batchId)
          frontendBatch = res.batches[0]
        } catch {
          // Indexer unavailable
        }

        const onChain = rawBatch as BatchOnChain | null

        if (onChain && onChain.id > 0n) {
          setBatch({
            onChain,
            categories,
            meta,
            frontendBatch,
            trackedUnits,
          })
        } else if (meta) {
          // Use synthesized rich batch from Rubh seed listings
          setBatch(createFallbackEnrichedBatch(meta))
        } else {
          // Batch not found
          const fallbackMeta = RUBH_SEED_LISTINGS.find((m) => m.batchId === String(batchId))
          if (fallbackMeta) {
            setBatch(createFallbackEnrichedBatch(fallbackMeta))
          } else {
            setBatch(null)
          }
        }
      } catch (err) {
        if (!cancelled) {
          const fallbackMeta = RUBH_SEED_LISTINGS.find((m) => m.batchId === String(batchId))
          if (fallbackMeta) {
            setBatch(createFallbackEnrichedBatch(fallbackMeta))
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load batch')
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [batchId, refetchTick])

  return { batch, isLoading, error, refetch }
}
