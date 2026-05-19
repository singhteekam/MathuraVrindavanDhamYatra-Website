import HotelsClient from "./HotelsClient";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels page — Mathura Vrindavan Dham Yatra',
  description:
    'Find the best hotels in Mathura and Vrindavan. Compare prices and book your stay with us.',
}

export default function HotelsPage() {
  return <HotelsClient />
}