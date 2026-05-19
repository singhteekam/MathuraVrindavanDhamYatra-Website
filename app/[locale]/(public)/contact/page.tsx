import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us — Mathura Vrindavan Dham Yatra',
  description:
    'Get in touch with Mathura Vrindavan Dham Yatra. Call, WhatsApp, or fill our enquiry form. We reply within 1 hour.',
}

export default function ContactPage() {
  return <ContactClient />
}