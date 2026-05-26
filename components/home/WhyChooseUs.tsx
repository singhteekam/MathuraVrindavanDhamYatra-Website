'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import SectionHeader from '@/components/shared/SectionHeader'

const featureEmojis = [
  { emoji: '🚗', titleKey: 'f1Title', descKey: 'f1Desc' },
  { emoji: '💰', titleKey: 'f2Title', descKey: 'f2Desc' },
  { emoji: '🗺️', titleKey: 'f3Title', descKey: 'f3Desc' },
  { emoji: '🏨', titleKey: 'f4Title', descKey: 'f4Desc' },
  { emoji: '📞', titleKey: 'f5Title', descKey: 'f5Desc' },
  { emoji: '🔒', titleKey: 'f6Title', descKey: 'f6Desc' },
  { emoji: '📿', titleKey: 'f7Title', descKey: 'f7Desc' },
  { emoji: '❌', titleKey: 'f8Title', descKey: 'f8Desc' },
]

export default function WhyChooseUs() {
  const t        = useTranslations('WhyChooseUs')
  const features = featureEmojis.map((f) => ({ ...f, title: t(f.titleKey), description: t(f.descKey) }))

  return (
    <section
      className="py-20"
      style={{ background: 'var(--bg-why-us)' }}
    >
      <div className="container-custom">
        {/* Force text white — this section is always on a dark background */}
        <style>{`.why-us .section-title { color: #fff !important; } .why-us .section-subtitle { color: #ff9b37 !important; } .why-us p { color: rgba(255,255,255,0.65) !important; }`}</style>
        <div className="why-us">
          <SectionHeader
            subtitle={t('subtitle')}
            title={t('title')}
            description={t('description')}
            className="mb-14"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group p-6 rounded-2xl transition-all duration-300 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,125,15,0.12)'
                e.currentTarget.style.border = '1px solid rgba(255,125,15,0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                style={{ background: 'rgba(255,125,15,0.15)' }}
              >
                {feature.emoji}
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}