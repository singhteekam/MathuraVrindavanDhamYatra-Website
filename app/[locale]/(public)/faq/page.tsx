
import type { Metadata } from 'next'
import FaqClient from './FaqClient'


export const metadata: Metadata = {
  title: 'Faq page — Mathura Vrindavan Dham Yatra',
  description:
    'Get in touch with Mathura Vrindavan Dham Yatra. Call, WhatsApp, or fill our enquiry form. We reply within 1 hour.',
}

export default function FAQPage() {
  return <FaqClient />
}