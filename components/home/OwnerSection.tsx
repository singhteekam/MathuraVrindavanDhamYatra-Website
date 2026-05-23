'use client'

import { motion }          from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image               from 'next/image'
import {
  Phone, Mail, MessageCircle, CheckCircle2,
  Instagram, Facebook, Youtube, Twitter, Star, Award,
} from 'lucide-react'
import type { OwnerProfileData } from '@/lib/fetchData'

interface Props {
  owner: OwnerProfileData
}

export default function OwnerSection({ owner }: Props) {
  const t = useTranslations('OwnerSection')

  const socials = [
    { key: 'instagram', icon: <Instagram size={18} />, url: owner.socialLinks.instagram, color: '#e1306c' },
    { key: 'facebook',  icon: <Facebook  size={18} />, url: owner.socialLinks.facebook,  color: '#1877f2' },
    { key: 'youtube',   icon: <Youtube   size={18} />, url: owner.socialLinks.youtube,   color: '#ff0000' },
    { key: 'twitter',   icon: <Twitter   size={18} />, url: owner.socialLinks.twitter,   color: '#1da1f2' },
  ].filter((s) => s.url)

  const achievements = (owner.achievements ?? []).filter(Boolean)

  return (
    <section className="py-20 overflow-hidden" style={{ background: '#fdfaf6' }}>
      <div className="container-custom">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="section-subtitle mb-3">✦ {t('subtitle')} ✦</p>
          <h2 className="section-title">{t('title')}</h2>
          <p className="mt-4 text-gray-500 leading-relaxed text-base max-w-xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">

          {/* ── Left: Photo + stats ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col items-center"
          >
            {/* Photo frame */}
            <div className="relative mb-6">
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-full opacity-20"
                style={{ background: 'conic-gradient(from 0deg, #ff7d0f, #f59e0b, #ff7d0f)' }} />
              <div className="absolute -inset-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #ff7d0f, #f59e0b)' }} />

              <div className="relative w-52 h-52 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                {owner.photo ? (
                  <Image
                    src={owner.photo}
                    alt={owner.name}
                    fill
                    className="object-cover"
                    sizes="208px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7d0f, #f59e0b)' }}>
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Experience badge */}
              {owner.experience > 0 && (
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg ring-2 ring-white"
                  style={{ background: 'linear-gradient(135deg, #ff7d0f, #f59e0b)' }}>
                  <span className="text-white font-black text-lg leading-none">{owner.experience}</span>
                  <span className="text-white text-[9px] font-semibold leading-tight">{t('yrs')}</span>
                </div>
              )}
            </div>

            {/* Name + title */}
            <h3 className="text-2xl font-black text-gray-900 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
              {owner.name}
            </h3>
            {owner.title && (
              <p className="text-sm font-semibold mt-1 text-center" style={{ color: '#ff7d0f' }}>
                {owner.title}
              </p>
            )}

            {/* Rating stars */}
            <div className="flex items-center gap-1 mt-3">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} fill="#f59e0b" className="text-amber-400" />
              ))}
            </div>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socials.map((s) => (
                  <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-md"
                    style={{ background: s.color }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            )}

            {/* Contact quick links */}
            <div className="flex flex-col gap-2 mt-5 w-full max-w-xs">
              {owner.phone && (
                <a href={`tel:${owner.phone}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <Phone size={15} />
                  {owner.phone}
                </a>
              )}
              {owner.whatsapp && (
                <a href={`https://wa.me/${owner.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <MessageCircle size={15} />
                  {t('whatsapp')}
                </a>
              )}
              {owner.email && (
                <a href={`mailto:${owner.email}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <Mail size={15} />
                  {owner.email}
                </a>
              )}
            </div>
          </motion.div>

          {/* ── Right: Bio + achievements ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            {/* Bio */}
            {owner.bio && (
              <p className="text-gray-600 leading-relaxed text-base mb-8 text-lg"
                style={{ borderLeft: '3px solid #ff7d0f', paddingLeft: '1rem' }}>
                {owner.bio}
              </p>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award size={18} style={{ color: '#ff7d0f' }} />
                  <h4 className="font-bold text-gray-900 text-base">{t('achievements')}</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {achievements.map((ach, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl"
                      style={{ background: '#fff7ed', border: '1px solid rgba(255,125,15,0.15)' }}
                    >
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#ff7d0f' }} />
                      <span className="text-sm text-gray-700 leading-snug">{ach}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: t('statHappy'),   value: '5000+' },
                { label: t('statYears'),   value: `${owner.experience}+` },
                { label: t('statRating'),  value: '4.9★'  },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl"
                  style={{ background: 'white', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p className="text-2xl font-black" style={{ color: '#ff7d0f' }}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
