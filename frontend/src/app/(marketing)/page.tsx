'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  ScanLine,
  Landmark,
  Lock,
  Droplet,
  ShoppingBag,
  Car,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Scale,
  Building2,
  Cpu,
  BookOpen
} from 'lucide-react'
import { RubhLogo } from '@/components/branding/rubh-logo'

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook                                                 */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-fade-up')
          el.classList.remove('opacity-0', 'translate-y-8')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function RevealSection({
  children,
  className = '',
  delay = '',
}: {
  children: React.ReactNode
  className?: string
  delay?: string
}) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-8 ${delay} ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Content Data                                                       */
/* ------------------------------------------------------------------ */

const trustSignals = [
  { icon: Scale, label: 'AAOIFI Sharia-Certified Structures' },
  { icon: ScanLine, label: 'Chainlink CRE Hardware & POS Verification' },
  { icon: Landmark, label: 'Saudi CMA FinTech Lab & SAMA Sandbox' },
  { icon: ShieldCheck, label: 'Independent Orphan SPV Ring-Fencing' },
  { icon: Lock, label: 'Audited Smart Contracts on Ethereum L2' },
]

const pipelineDeals = [
  {
    id: '1',
    title: 'Tawrea Water-as-a-Service (WaaS) Facility',
    structure: 'musharakah' as const,
    structureLabel: 'Musharakah · Asset Equity',
    sector: 'Industrial Cleantech & Utilities',
    location: 'Dammam Industrial City, KSA',
    icon: Droplet,
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    targetYield: '18.2% APY',
    minTicket: '$10 / 37.5 SAR',
    tenor: '36 Months',
    oracleType: 'IoT Flow Telemetry',
  },
  {
    id: '2',
    title: 'Al-Nakhla Luxury Retail Inventory Restock',
    structure: 'murabaha' as const,
    structureLabel: 'Murabaha · Trade Finance',
    sector: 'Commercial Luxury Goods',
    location: 'Red Sea Mall, Jeddah, KSA',
    icon: ShoppingBag,
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    targetYield: '12.0% Markup',
    minTicket: '$10 / 37.5 SAR',
    tenor: '6 Months',
    oracleType: 'Square / Foodics POS Feed',
  },
  {
    id: '3',
    title: 'Riyadh EcoFleet Commercial EV Fleet Expansion',
    structure: 'musharakah' as const,
    structureLabel: 'Musharakah · Asset Equity',
    sector: 'Clean Urban Logistics',
    location: 'Riyadh Logistics Zone, KSA',
    icon: Car,
    image:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    targetYield: '16.5% APY',
    minTicket: '$10 / 37.5 SAR',
    tenor: '24 Months',
    oracleType: 'OBD-II IoT Telematics',
  },
  {
    id: '4',
    title: 'Artisan Specialty Roastery Working Capital',
    structure: 'murabaha' as const,
    structureLabel: 'Murabaha · Trade Finance',
    sector: 'Specialty Food & Beverage',
    location: 'Al Olaya, Riyadh, KSA',
    icon: Coffee,
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    targetYield: '11.5% Markup',
    minTicket: '$10 / 37.5 SAR',
    tenor: '9 Months',
    oracleType: 'POS Sell-Through Feed',
  },
]

export default function LandingPage() {
  const [selectedStructure, setSelectedStructure] = useState<'all' | 'murabaha' | 'musharakah'>('all')

  const filteredDeals =
    selectedStructure === 'all'
      ? pipelineDeals
      : pipelineDeals.filter((d) => d.structure === selectedStructure)

  return (
    <div className="bg-[#F8F9FB] text-slate-900 selection:bg-[#133359]/10 selection:text-[#133359]">
      {/* ───────────────── HERO SECTION ───────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#133359]/5 to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-up">
            {/* Minimalist Trust Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 backdrop-blur-md px-3.5 py-1 text-xs text-slate-600 shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">
                Chainlink CRE · Sharia-Certified RWA
              </span>
            </div>

            {/* Authoritative Main Headline */}
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 text-slate-900 drop-shadow-sm">
              Institutional Sharia{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#133359] to-blue-800">
                Real-World Assets.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mb-10 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Rubh transforms physical fast-moving inventory and capital equipment into fractional, yield-bearing digital assets starting from <strong className="text-slate-900">$10 (~37.5 SAR)</strong>. By replacing static PDFs with <strong>Chainlink CRE tamper-proof POS and IoT verification</strong>, investors see exact operational performance.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
              <Link
                href="/investor/marketplace"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#133359] px-6 py-3.5 font-semibold text-sm text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore Marketplace 
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/docs"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-sm text-slate-800 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
              >
                <BookOpen className="size-4 text-slate-500 group-hover:text-slate-700 transition-colors" />
                Read the Docs
              </Link>
            </div>

            {/* Harmonious KPI Metric Strip */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-slate-200/40 text-left relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Financing Deficit</p>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">SAR 250B+</p>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Minimum Ticket</p>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">$10</p>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Structures</p>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">Trade/Equity</p>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Verification</p>
                <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">Chainlink</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── TRUST SIGNALS BAR ───────────────── */}
      <section className="border-y border-slate-200 bg-white py-4 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs sm:text-sm text-slate-600 animate-fade-in">
            {trustSignals.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2 group cursor-default">
                  <Icon className="size-4 text-[#133359] shrink-0 transition-transform group-hover:scale-110" />
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── DOCS QUICK LINKS ───────────────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mx-auto max-w-3xl text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#133359] mb-2 block">
              Learn More
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
              How Rubh Works
            </h2>
          </RevealSection>

          <div className="grid gap-6 md:grid-cols-3">
            <RevealSection delay="delay-[100ms]">
              <Link href="/docs" className="group block h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#133359] mb-5 border border-slate-100 transition-transform group-hover:scale-110">
                  <Building2 className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900 group-hover:text-[#133359] transition-colors">The Problem</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Why traditional lending and legacy debt-crowdfunding fail SMEs and investors alike.
                </p>
                <span className="text-xs font-bold text-[#133359] flex items-center gap-1">Read more <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </RevealSection>

            <RevealSection delay="delay-[200ms]">
              <Link href="/docs/structures" className="group block h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#133359] mb-5 border border-slate-100 transition-transform group-hover:scale-110">
                  <Landmark className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900 group-hover:text-[#133359] transition-colors">Financing Structures</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Explore our Sharia-compliant Dual-Structure Architecture: Murabaha and Musharakah.
                </p>
                <span className="text-xs font-bold text-[#133359] flex items-center gap-1">Read more <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </RevealSection>

            <RevealSection delay="delay-[300ms]">
              <Link href="/docs/regulatory" className="group block h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#133359] mb-5 border border-slate-100 transition-transform group-hover:scale-110">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900 group-hover:text-[#133359] transition-colors">Regulatory Framework</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Independent Orphan SPVs, Sandbox Execution, and our vision for a commercial Neobank.
                </p>
                <span className="text-xs font-bold text-[#133359] flex items-center gap-1">Read more <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURED LIVE OPPORTUNITIES ───────────────── */}
      <section className="py-20 md:py-24 bg-slate-50/50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#133359] mb-2 block">
                Active Pipeline
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Featured Investment Offerings
              </h2>
              <p className="text-slate-600 text-sm mt-2 max-w-xl">
                Explore audited real-world business assets with minimum tickets starting from $10 (~37.5 SAR).
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStructure('all')}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                  selectedStructure === 'all'
                    ? 'bg-[#133359] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                All Instruments ({pipelineDeals.length})
              </button>
              <button
                onClick={() => setSelectedStructure('murabaha')}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                  selectedStructure === 'murabaha'
                    ? 'bg-[#133359] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                Murabaha (Trade)
              </button>
              <button
                onClick={() => setSelectedStructure('musharakah')}
                className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                  selectedStructure === 'musharakah'
                    ? 'bg-[#133359] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                Musharakah (Equity)
              </button>
            </div>
          </RevealSection>

          {/* Deal Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDeals.map((deal, idx) => {
              const isMurabaha = deal.structure === 'murabaha'
              const delay = `delay-[${idx * 100}ms]`

              return (
                <RevealSection key={deal.id} delay={delay}>
                  <div
                    className="group flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div>
                      {/* Card Image Banner */}
                      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100 mb-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Structure Pill */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide shadow-sm backdrop-blur-sm ${
                              isMurabaha
                                ? 'bg-white/90 text-[#133359] border border-white/20'
                                : 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/20'
                            }`}
                          >
                            {deal.structureLabel}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-3 left-3 text-xs text-white font-medium drop-shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          {deal.location}
                        </div>
                      </div>

                      {/* Card Body */}
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        {deal.sector}
                      </p>
                      <h3 className="font-heading text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#133359] transition-colors mb-4">
                        {deal.title}
                      </h3>

                      {/* Yield and Min Ticket */}
                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100 mb-4 group-hover:border-[#133359]/10 transition-colors">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target Return</p>
                          <p className="text-base font-black text-emerald-700 mt-0.5">{deal.targetYield}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Min Ticket</p>
                          <p className="text-base font-black text-slate-900 mt-0.5">{deal.minTicket}</p>
                        </div>
                      </div>

                      {/* Oracle Feed Tag */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mb-5">
                        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                          <ScanLine className="size-3.5 text-[#133359]" />
                          {deal.oracleType}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          CRE Verified
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link href={`/investor/deal/${deal.id}`} className="block">
                      <button className="w-full rounded-xl bg-slate-50 text-[#133359] border border-slate-200 hover:border-[#133359] hover:bg-[#133359] hover:text-white font-bold text-xs py-3 shadow-sm transition-all duration-300 text-center flex items-center justify-center gap-2">
                        Inspect Deal <ArrowRight className="size-3.5" />
                      </button>
                    </Link>
                  </div>
                </RevealSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <RubhLogo size="md" />
            <div className="flex flex-wrap gap-6 text-xs font-medium text-slate-600">
              <Link href="/investor/marketplace" className="hover:text-[#133359] transition-colors">
                Marketplace
              </Link>
              <Link href="/docs/structures" className="hover:text-[#133359] transition-colors">
                Financing Structures
              </Link>
              <Link href="/merchant" className="hover:text-[#133359] transition-colors">
                SME Issuance
              </Link>
              <Link href="/docs" className="hover:text-[#133359] transition-colors">
                Documentation
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 Rubh Institutional RWA Platform. All rights reserved.</p>
            <p className="text-center md:text-right max-w-xl">
              Rubh is a financial technology infrastructure platform. Financing instruments operate under Saudi CMA FinTech Lab and SAMA Sandbox experimental frameworks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
