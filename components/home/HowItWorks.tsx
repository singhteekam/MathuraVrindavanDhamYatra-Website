'use client'

import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import SectionHeader from '@/components/shared/SectionHeader'

const steps = [
  {
    step: '01',
    emoji: '🗺️',
    title: 'Choose Your Package',
    description:
      'Browse our curated tour packages — 1 day to 8 days. Filter by car type, duration, and budget. Everything is clearly priced, no hidden charges.',
    color: '#fff8ed',
    accent: '#ff7d0f',
  },
  {
    step: '02',
    emoji: '📋',
    title: 'Book & Confirm',
    description:
      'Fill in your travel details, select add-ons like hotel help or a local guide. Pay securely online or choose to pay on arrival.',
    color: '#eef2ff',
    accent: '#4338ca',
  },
  {
    step: '03',
    emoji: '🚗',
    title: 'Meet Your Driver',
    description:
      'Your verified, experienced driver arrives at your location on time with a clean, AC vehicle ready for your spiritual journey.',
    color: '#f0fdf4',
    accent: '#16a34a',
  },
  {
    step: '04',
    emoji: '🙏',
    title: 'Enjoy Your Darshan',
    description:
      'Immerse yourself in the divine energy of Braj Bhoomi. Our drivers know every temple, every shortcut, every aarti timing.',
    color: '#fefce8',
    accent: '#d97706',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(180deg, #f9fafb 0%, #fff8ed10 100%)',
      }}
    >
      <div className="container-custom">
        <SectionHeader
          subtitle="How It Works"
          title="Your Journey in 4 Simple Steps"
          description="We've made booking a Mathura Vrindavan tour as easy as possible so you can focus on what matters — your spiritual experience."
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

              <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
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
            Start Booking Now
          </Link>
        </motion.div>
      </div>
    </section>
  )
}