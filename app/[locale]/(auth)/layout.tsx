import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  )
}