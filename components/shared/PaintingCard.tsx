'use client'

import { useState } from 'react'
import Image        from 'next/image'

interface Props {
  src:       string
  alt:       string
  caption:   string
  className?: string
}

export default function PaintingCard({ src, alt, caption, className = '' }: Props) {
  const [error, setError] = useState(false)

  return (
    <div className={`rounded-2xl overflow-hidden shadow-xl group ${className}`}
      style={{ border: '2px solid rgba(255,215,0,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.08)' }}>
      <div className="relative aspect-[4/3] bg-amber-950/40">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2d1a0a, #1a0a2e)' }}>
            <span className="text-5xl">🪷</span>
            <p className="text-xs text-amber-200/50 text-center px-4">{alt}</p>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setError(true)}
          />
        )}
      </div>
      <div className="px-3 py-2 text-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
        <p className="text-xs text-amber-200/70 leading-snug">{caption}</p>
      </div>
    </div>
  )
}
