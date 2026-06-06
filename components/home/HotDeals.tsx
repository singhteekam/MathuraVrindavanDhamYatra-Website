'use client'

import { useState, useEffect } from 'react'
import { motion }    from 'framer-motion'
import { Link }      from '@/i18n/navigation'
import { ArrowRight, Clock } from 'lucide-react'
import PackageCard   from '@/components/shared/PackageCard'
import type { PackageSummary } from '@/lib/fetchData'

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setText('Ended'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (h >= 24) {
        const d = Math.floor(h / 24)
        setText(`${d}d ${h % 24}h ${String(m).padStart(2, '0')}m`)
      } else {
        setText(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      }
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return <span className="tabular-nums">{text}</span>
}

export default function HotDeals({ packages }: { packages: PackageSummary[] }) {
  if (packages.length === 0) return null

  const earliest = packages
    .filter((p) => p.discountEndsAt)
    .sort((a, b) => new Date(a.discountEndsAt!).getTime() - new Date(b.discountEndsAt!).getTime())[0]

  return (
    <section className="py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a0000 0%, #2d0500 45%, #1f0a00 100%)' }}>

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-40 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #ef4444, transparent)' }} />

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="text-2xl select-none">🔥</motion.span>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                Limited Time Offers
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}>
              Hot Deals
            </h2>
            <p className="text-sm text-gray-400">
              Exclusive discounts — grab yours before the offer expires!
            </p>
          </div>

          {earliest?.discountEndsAt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0 text-center px-6 py-4 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400 mb-1 flex items-center justify-center gap-1">
                <Clock size={10} /> Best offer ends in
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                <CountdownTimer endsAt={earliest.discountEndsAt} />
              </p>
            </motion.div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}>
              <PackageCard {...pkg} />
            </motion.div>
          ))}
        </div>

        {packages.length >= 3 && (
          <div className="text-center mt-8">
            <Link href="/packages"
              className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              View All Packages <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
