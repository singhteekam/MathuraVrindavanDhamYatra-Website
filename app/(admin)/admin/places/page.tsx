'use client'

import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function AdminPlacesDenied() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 pt-20 lg:pt-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
          <ShieldCheck size={28} className="text-indigo-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Superadmin Only</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Managing sacred places is restricted to the Superadmin.
          Please sign in with your Superadmin credentials to access this section.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/superadmin/places"
            className="btn-primary justify-center">
            <ShieldCheck size={16} /> Go to Superadmin → Places
          </Link>
          <Link href="/admin"
            className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={14} /> Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}