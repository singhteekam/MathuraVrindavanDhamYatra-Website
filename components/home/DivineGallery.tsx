'use client'

import { useRef, useState } from 'react'
import Image                from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link }             from '@/i18n/navigation'
import { ArrowRight }       from 'lucide-react'

const IMAGES = [
  {
    src:     'https://images.unsplash.com/photo-1641913625440-158406784a9f?auto=format&fit=crop&w=800&q=80',
    alt:     'Radha Krishna deity idols in a beautifully decorated temple sanctum',
    caption: 'राधे कृष्ण · Radha Krishna Deities',
  },
  {
    src:     'https://images.unsplash.com/photo-1641730259879-ad98e7db7bcb?auto=format&fit=crop&w=800&q=80',
    alt:     'Lord Krishna bronze statue playing the divine flute — Murlidhar',
    caption: 'मुरलीधर · Murlidhar — The Flute Bearer',
  },
  {
    src:     'https://images.unsplash.com/photo-1652448692527-c314ff7c14a9?auto=format&fit=crop&w=800&q=80',
    alt:     'Prem Mandir Vrindavan — majestic white marble temple illuminated at night',
    caption: 'प्रेम मंदिर · Prem Mandir, Vrindavan',
  },
]

function TiltCard({ src, alt, caption, index }: {
  src: string; alt: string; caption: string; index: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX       = useMotionValue(0)
  const mouseY       = useMotionValue(0)
  const rotateX      = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 18 })
  const rotateY      = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  { stiffness: 180, damping: 18 })
  const [imgError, setImgError] = useState(false)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.7 }}>
      <div ref={containerRef} style={{ perspective: '1100px' }}
        onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            border:     '2px solid rgba(255,215,0,0.35)',
            boxShadow:  '0 20px 50px rgba(0,0,0,0.55), 0 0 28px rgba(255,215,0,0.1)',
          }}
          className="relative rounded-2xl overflow-hidden cursor-pointer group">
          <div className="relative aspect-[4/3] bg-amber-950/40">
            {imgError ? (
              <div className="absolute inset-0 flex items-center justify-center text-6xl"
                style={{ background: 'linear-gradient(135deg, #2d1a0a, #1a0a2e)' }}>🪷</div>
            ) : (
              <Image src={src} alt={alt} fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)} />
            )}
          </div>
          <div className="px-3 py-2 text-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <p className="text-xs text-amber-200/70">{caption}</p>
          </div>
          {/* Hover gold shimmer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.09), transparent 60%)', transform: 'translateZ(2px)' }} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function DivineGallery() {
  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(165deg, #0d0520 0%, #1a0a2e 35%, #2d1400 65%, #180800 100%)' }}>

      {/* Divine radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffd700 0%, #ff7d0f 45%, transparent 70%)' }} />
        {[...Array(12)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width:      i % 3 === 0 ? 6 : 4,
              height:     i % 3 === 0 ? 6 : 4,
              left:       `${6 + i * 8}%`,
              top:        `${18 + (i % 5) * 14}%`,
              background: ['#ffd700', '#ff7d0f', '#c084fc', '#fbbf24'][i % 4],
              opacity:    0.45,
            }}
            animate={{ y: [0, -16, 0], opacity: [0.3, 0.65, 0.3] }}
            transition={{ duration: 3 + i * 0.35, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14">
          <motion.p
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 3.2, repeat: Infinity }}
            className="text-xs font-bold uppercase tracking-[0.4em] mb-4"
            style={{ color: '#ffd700' }}>
            ✦ पवित्र दर्शन · Divine Vision ✦
          </motion.p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: '#ffd700', textShadow: '0 0 50px rgba(255,215,0,0.4)' }}>
            राधे कृष्णा
          </h2>
          <p className="text-base text-amber-200/60">The eternal love story of Vrindavan</p>
        </motion.div>

        {/* 3D Tilt Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {IMAGES.map((p, i) => (
            <TiltCard key={i} {...p} index={i} />
          ))}
        </div>

        {/* Quote + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center">
          <p className="text-xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-serif)', color: '#ffd700', textShadow: '0 0 24px rgba(255,215,0,0.4)' }}>
            "कृष्णं वन्दे जगद्गुरुम्"
          </p>
          <p className="text-sm text-amber-200/50 italic mb-8">I bow to Krishna, teacher of the world</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.4))' }} />
            <span className="text-amber-600/60 text-lg">🪷</span>
            <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.4))' }} />
          </div>
          <Link href="/radhe-krishna"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-amber-400/20"
            style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700' }}>
            राधे कृष्ण की दिव्य कथा · Explore the Divine Story <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
