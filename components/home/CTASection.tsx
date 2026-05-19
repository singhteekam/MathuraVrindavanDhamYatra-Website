'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Phone, MessageCircle, Send, MapPin } from 'lucide-react'
import { siteConfig } from '@/config/site'
import toast from 'react-hot-toast'

export default function CTASection() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', message: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Please fill in your name and phone number.')
      return
    }
    setLoading(true)
    // Will connect to API route later
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Enquiry sent! We\'ll call you within 1 hour. 🙏')
    setForm({ name: '', phone: '', date: '', message: '' })
    setLoading(false)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-subtitle mb-3">✦ Contact Us ✦</p>
            <h2 className="section-title mb-5">
              Plan Your Perfect<br />
              <span style={{ color: '#ff7d0f' }}>Spiritual Journey</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Have questions? Want a custom itinerary? Our travel experts are
              available 7 days a week to help you plan the most memorable
              pilgrimage of your life.
            </p>

            <div className="space-y-5 mb-8">
              {[
                {
                  icon: <Phone size={20} />,
                  label: 'Call or WhatsApp',
                  value: siteConfig.phone,
                  href: `tel:${siteConfig.phone}`,
                  color: '#ff7d0f',
                  bg: '#fff8ed',
                },
                {
                  icon: <MessageCircle size={20} />,
                  label: 'WhatsApp Chat',
                  value: 'Chat with us instantly',
                  href: `https://wa.me/${siteConfig.whatsapp}`,
                  color: '#16a34a',
                  bg: '#f0fdf4',
                },
                {
                  icon: <MapPin size={20} />,
                  label: 'Our Location',
                  value: siteConfig.address,
                  href: '#',
                  color: '#4338ca',
                  bg: '#eef2ff',
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group"
                  style={{ background: item.bg }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: item.color, color: '#fff' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick links */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/packages" className="btn-primary text-sm py-3 px-6">
                View Packages
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=Namaste! I want to book a Mathura Vrindavan tour.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200"
                style={{
                  background: '#dcfce7',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                }}
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Right: Enquiry form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-3xl p-7 sm:p-9"
              style={{
                background: 'linear-gradient(135deg, #fff8ed, #fffbeb)',
                border: '1px solid #ffefd4',
                boxShadow: '0 8px 40px rgba(255,125,15,0.1)',
              }}
            >
              <h3
                className="text-xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Get a Free Tour Plan 🙏
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Fill the form and we&apos;ll call you within 1 hour
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Ram Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Planned Travel Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field bg-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Message / Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Number of people, preferred car, specific temples to visit..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Enquiry
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400">
                  🔒 Your details are safe with us. No spam, ever.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}