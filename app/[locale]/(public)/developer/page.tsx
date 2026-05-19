import type { Metadata }    from 'next'
import DeveloperClient       from './DeveloperClient'

export const metadata: Metadata = {
  title:  'Developer — Mathura Vrindavan Travel',
  description: 'This platform was designed and developed by Teekam Singh — Full Stack Developer.',
  robots: { index: false, follow: false }, // don't index this page
}

export default function DeveloperPage() {
  return <DeveloperClient />
}