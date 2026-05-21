'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations }  from 'next-intl'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const t      = useTranslations('Register')
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error(t('toast.allRequired'))
      return
    }
    if (form.password.length < 6) {
      toast.error(t('toast.passwordLength'))
      return
    }
    if (form.password !== form.confirm) {
      toast.error(t('toast.passwordMatch'))
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
        toast.success(t('toast.accountCreated'))
        router.push('/login')
      } else {
        toast.error(data.error ?? t('toast.registrationFailed'))
      }
    } catch {
      toast.error(t('toast.networkError'))
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
            <p className="font-bold text-gray-900 dark:text-white text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              Mathura Vrindavan Dham Yatra
            </p>
            <p className="text-saffron-500 text-xs font-semibold tracking-widest uppercase">{t('createAccountSubtitle')}</p>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card rounded-3xl p-7 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('createAccountTitle')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              {t('fullNameLabel')} *
            </label>
            <input type="text" placeholder="Ram Sharma" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" autoComplete="name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                {t('emailLabel')} *
              </label>
              <input type="email" placeholder="your@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                {t('phoneLabel')} *
              </label>
              <input type="tel" placeholder="+91 98765 43210" required
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" autoComplete="tel" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              {t('passwordLabel')} *
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder={t('passwordPlaceholder')} required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
              {t('confirmPasswordLabel')} *
            </label>
            <input type="password" placeholder={t('confirmPasswordPlaceholder')} required
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input-field" autoComplete="new-password" />
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-red-500 mt-1">{t('passwordsMismatch')}</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 text-base mt-2"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('buttonCreating')}
              </>
            ) : (
              <><UserPlus size={18} /> {t('buttonCreate')}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('haveAccount')}{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#ff7d0f' }}>
              {t('signIn')}
            </Link>
          </p>
        </div>
      </motion.div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
        {t('termsNotice')}{' '}
        <Link href="/terms" className="underline">{t('termsLink')}</Link>
      </p>
    </div>
  )
}
