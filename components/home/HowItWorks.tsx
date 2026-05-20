'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import SectionHeader from '@/components/shared/SectionHeader'

const stepStyles = [
  { step: '01', emoji: '🗺️', titleKey: 'step1Title', descKey: 'step1Desc', color: '#fff8ed', accent: '#ff7d0f' },
  { step: '02', emoji: '📋', titleKey: 'step2Title', descKey: 'step2Desc', color: '#eef2ff', accent: '#4338ca' },
  { step: '03', emoji: '🚗', titleKey: 'step3Title', descKey: 'step3Desc', color: '#f0fdf4', accent: '#16a34a' },
  { step: '04', emoji: '🙏', titleKey: 'step4Title', descKey: 'step4Desc', color: '#fefce8', accent: '#d97706' },
]

export default function HowItWorks() {
  const t     = useTranslations('HowItWorks')
  const steps = stepStyles.map((s) => ({ ...s, title: t(s.titleKey), description: t(s.descKey) }))

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-saffron-50/30 dark:from-gray-950 dark:to-gray-900">
      <div className="container-custom">
        <SectionHeader
          subtitle={t('subtitle')}
          title={t('title')}
          description={t('description')}
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div
            className="absolute top-12 left-[12.5%] right-[12.5%] h-0.5 hidden lg:block"
            style={{
              background: 'linear-gradient(90deg, #ff7d0f, #4338ca, #16a34a, #d97706)',
              opacity: 0.2,
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative text-center"
            >
              {/* Step number bubble */}
              <div className="relative inline-block mb-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
                  style={{ background: step.color, border: `2px solid ${step.accent}20` }}
                >
                  <span className="text-4xl">{step.emoji}</span>
                </div>
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: step.accent }}
                >
                  {i + 1}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link href="/booking" className="btn-primary text-base px-10 py-4">
            {t('startBookingNow')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}