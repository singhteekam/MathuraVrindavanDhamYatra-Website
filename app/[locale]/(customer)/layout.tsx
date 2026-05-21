import Footer        from '@/components/layout/Footer'
import Navbar        from '@/components/layout/Navbar'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'My Account', template: '%s | MVTravel' },
  robots: { index: false, follow: false },
}

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale} />
      <WhatsAppButton />
    </>
  )
}
