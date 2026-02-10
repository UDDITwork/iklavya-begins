import HeroSection from '@/components/landing/HeroSection'
import FeatureGrid from '@/components/landing/FeatureGrid'
import StatsCounter from '@/components/landing/StatsCounter'
import TestimonialCarousel from '@/components/landing/TestimonialCarousel'
import CinematicFooter from '@/components/landing/CinematicFooter'

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <StatsCounter />
      <TestimonialCarousel />
      <CinematicFooter />
    </>
  )
}
