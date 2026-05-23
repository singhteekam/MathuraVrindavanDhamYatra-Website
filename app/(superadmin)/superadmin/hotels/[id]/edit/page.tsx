'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams }           from 'next/navigation'
import HotelForm, { type HotelFormData } from '../../HotelForm'

export default function EditHotelPage() {
  const { id }                    = useParams<{ id: string }>()
  const [data, setData]           = useState<Partial<HotelFormData> | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch(`/api/hotels/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return <p className="p-6 text-red-500">Hotel not found.</p>

  return <HotelForm pageTitle="Edit Hotel" id={id} initial={data} />
}
