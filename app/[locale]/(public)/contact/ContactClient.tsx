'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, Mail, MapPin, Clock, Send,
  MessageCircle, Instagram, Facebook, Youtube,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { siteConfig } from '@/config/site'

const CONTACT_ITEMS = [
  {
    icon: <Phone size={22} />,
    label: 'Call or WhatsApp',
    value: siteConfig.phone,
    sub: 'Available 7 days, 7 AM – 10 PM',
    href: `tel:${siteConfig.phone}`,
    color: '#ff7d0f',
    bg: '#fff8ed',
  },
  {
    icon: <MessageCircle size={22} />,
    label: 'WhatsApp Chat',
    value: 'Chat with us instantly',
    sub: 'We reply within 15 minutes',
    href: `https://wa.me/${siteConfig.whatsapp}`,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    icon: <Mail size={22} />,
    label: 'Email Us',
    value: siteConfig.email,
    sub: 'We reply within 4 hours',
    href: `mailto:${siteConfig.email}`,
    color: '#4338ca',
    bg: '#eef2ff',
  },
  {
    icon: <MapPin size={22} />,
    label: 'Our Office',
    value: 'Mathura, Uttar Pradesh',
    sub: 'India — 281001',
    href: 'https://maps.google.com/?q=Mathura,UP,India',
    color: '#db2777',
    bg: '#fdf2f8',
  },
]

const QUICK_FAQS = [
  {
    q: 'How do I book a tour?',
    a: 'You can book on our website, call us, or WhatsApp. We confirm within 1 hour.',
  },
  {
    q: 'Do you provide hotel assistance?',
    a: 'Yes, we help find and book hotels in Mathura and Vrindavan — free of charge.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Free cancellation up to 24 hours before the trip. After that, 20% fee applies.',
  },
  {
    q: 'Do you operate on festival days?',
    a: 'Yes, we operate 365 days a year. Book festival trips well in advance.',
  },
]

export default function ContactClient() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', date: '', passengers: '', message: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [openFaq,  setOpenFaq]  = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please enter your name and phone number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.name.trim(),
          phone:      form.phone.trim(),
          email:      form.email.trim()      || undefined,
          message:    form.message.trim()    || `Enquiry from ${form.name}`,
          tourDate:   form.date              || undefined,
          passengers: form.passengers        || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send message. Please try again.')
        return
      }

      toast.success("Message sent! We'll call you within 1 hour. Jai Shri Krishna 🙏")
      setForm({ name: '', phone: '', email: '', date: '', passengers: '', message: '' })

    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please call or WhatsApp us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div
        className="py-16 md:py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1e1b4b 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ff7d0f, transparent)' }} />
        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-saffron-400 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            ✦ Get In Touch ✦
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            We&apos;re Here to Help You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-xl mx-auto text-base"
          >
            Have questions about your pilgrimage? Need a custom itinerary? Our team is
            available 7 days a week to plan your perfect Mathura Vrindavan journey.
          </motion.p>
        </div>
      </div>

      <div className="container-custom py-14">

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {CONTACT_ITEMS.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card card-hover p-6 block"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: item.bg, color: item.color }}
              >
                {item.icon}
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
              <p className="font-bold text-gray-900 text-sm mb-1">{item.value}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </motion.a>
          ))}
        </div>

        {/* Form + FAQ */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Enquiry form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Send Us a Message
            </h2>
            <p className="text-gray-500 text-sm mb-7">
              Fill the form and we&apos;ll get back within 1 hour with a tailored tour plan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name *
                  </label>
                  <input type="text" placeholder="Ram Sharma" required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Phone / WhatsApp *
                  </label>
                  <input type="tel" placeholder="+91 98765 43210" required
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Travel Date
                  </label>
                  <input type="date" min={new Date().toISOString().split('T')[0]}
                    value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Number of People
                  </label>
                  <select value={form.passengers}
                    onChange={(e) => setForm({ ...form, passengers: e.target.value })}
                    className="input-field">
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Message / Requirements
                </label>
                <textarea rows={4}
                  placeholder="Duration, specific temples, hotel help needed, budget..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-base"
                style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <><Send size={18} /> Send Message</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                🔒 Your details are safe. We never share or spam.
              </p>
            </form>
          </motion.div>

          {/* Right: hours + FAQ + social */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Hours */}
            <div className="card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center">
                  <Clock size={18} className="text-saffron-600" />
                </div>
                <h3 className="font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-3">
                {[
                  { day: 'Monday – Friday', time: '7:00 AM – 10:00 PM' },
                  { day: 'Saturday',        time: '6:00 AM – 10:00 PM' },
                  { day: 'Sunday',          time: '6:00 AM – 9:00 PM'  },
                  { day: 'All Festivals',   time: 'Extended hours'      },
                ].map((item) => (
                  <div key={item.day}
                    className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                    style={{ background: '#f9fafb' }}>
                    <span className="text-sm font-medium text-gray-700">{item.day}</span>
                    <span className="text-sm font-semibold text-saffron-600">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="text-xs text-green-700 font-semibold">
                  ✓ WhatsApp available 24/7 for urgent queries
                </p>
              </div>
            </div>

            {/* Mini FAQ */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                Quick Answers
              </h3>
              <div className="space-y-3">
                {QUICK_FAQS.map((faq, i) => (
                  <div key={i} className="card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
                      <span className="text-saffron-500 font-bold flex-shrink-0 text-lg leading-none">
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4"
                        style={{ borderTop: '1px solid #f3f4f6' }}
                      >
                        <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
              <a href="/faq" className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                style={{ color: '#ff7d0f' }}>
                View all FAQs →
              </a>
            </div>

            {/* Social */}
            <div className="card p-6 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook size={18} />,  href: siteConfig.social.facebook,  label: 'Facebook',  color: '#1877f2', bg: '#e7f0ff' },
                  { icon: <Instagram size={18} />, href: siteConfig.social.instagram, label: 'Instagram', color: '#e1306c', bg: '#fff0f5' },
                  { icon: <Youtube size={18} />,   href: siteConfig.social.youtube,   label: 'YouTube',   color: '#ff0000', bg: '#fff0f0' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl font-semibold text-xs transition-all hover:scale-105"
                    style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}