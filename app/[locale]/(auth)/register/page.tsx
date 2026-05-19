'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          phone:    form.phone.trim(),
          password: form.password,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success('Account created! Please sign in. 🙏')
        router.push('/login')
      } else {
        toast.error(data.error ?? 'Registration failed. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ff7d0f, #c74a06)' }}
          >
            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-hindi)' }}>ॐ</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              Mathura Vrindavan Dham Yatra
            </p>
            <p className="text-saffron-500 text-xs font-semibold tracking-widest uppercase">Create Account</p>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-3xl p-7 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Create Account
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Join us and start planning your spiritual journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Full Name *
            </label>
            <input type="text" placeholder="Ram Sharma" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" autoComplete="name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email *
              </label>
              <input type="email" placeholder="your@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Phone *
              </label>
              <input type="tel" placeholder="+91 98765 43210" required
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" autoComplete="tel" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Password *
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Confirm Password *
            </label>
            <input type="password" placeholder="Repeat password" required
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input-field" autoComplete="new-password" />
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 text-base mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#ff7d0f' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <p className="text-center text-xs text-gray-400 mt-5">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="underline">Terms of Service</Link>
      </p>
    </div>
  )
}