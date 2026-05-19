import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "My Account", template: "%s | MVTravel" },
  robots: { index: false, follow: false },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </>
    </>
  );
}
