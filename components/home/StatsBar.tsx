'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import CountUp from 'react-countup'

const statsData = [
  { value: 10, suffix: '+', labelKey: 'happyPilgrims',    emoji: '🙏' },
  { value: 50, suffix: '+', labelKey: 'sacredPlaces',     emoji: '🛕' },
  { value: 2,  suffix: '+', labelKey: 'monthsOfService',  emoji: '⭐' },
  { value: 5,  suffix: '+', labelKey: 'tourPackages',     emoji: '🚗' },
  { value: 95, suffix: '%', labelKey: 'satisfactionRate', emoji: '❤️' },
]

export default function StatsBar() {
  const t      = useTranslations('StatsBar')
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const stats  = statsData.map((s) => ({ ...s, label: t(s.labelKey) }))

  return (
    <section
      ref={ref}
      className="py-14"
      style={{
        background: 'var(--bg-stats)',
        boxShadow: 'var(--bg-stats-shadow)',
      }}
    >
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl mb-1">{stat.emoji}</p>
              <p className="text-3xl sm:text-4xl font-bold text-white">
                {inView ? (
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    delay={i * 0.1}
                    suffix={stat.suffix}
                  />
                ) : (
                  '0'
                )}
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}