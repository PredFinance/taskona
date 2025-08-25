import Header from "@/components/Header"
import Hero from "@/components/Hero"
import HowItWorks from "@/components/HowItWorks"
import EarningBreakdown from "@/components/EarningBreakdown"
import Testimonials from "@/components/Testimonials"
import CTA from "@/components/CTA"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <Hero />
      <HowItWorks />
      <EarningBreakdown />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
