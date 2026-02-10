import HeroSection from '@/components/landing/HeroSection'
import FeatureGrid from '@/components/landing/FeatureGrid'
import StatsCounter from '@/components/landing/StatsCounter'
import TestimonialCarousel from '@/components/landing/TestimonialCarousel'
import CinematicFooter from '@/components/landing/CinematicFooter'
import WaveDivider from '@/components/illustrations/decorative/WaveDivider'

export default function Home() {
  return (
    <>
      <HeroSection />
      <WaveDivider />
      <FeatureGrid />
      <WaveDivider flip />
      <StatsCounter />
      <WaveDivider />
      <TestimonialCarousel />
      <WaveDivider flip />
      <CinematicFooter />
    </>
  )
}
