import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'

export default async function PublicLayout({
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