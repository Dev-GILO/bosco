import Header from "@/app/components/header"
import HeroSection from "@/app/components/hero-section"
import MissionSection from "@/app/components/mission-section"
import CollectionsSection from "@/app/components/collections-section"
import TestimonialSection from "@/app/components/testimonial-section"
import CTASection from "@/app/components/cta-section"
import Footer from "@/app/components/footer"

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <MissionSection />
      <CollectionsSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </main>
  )
}
