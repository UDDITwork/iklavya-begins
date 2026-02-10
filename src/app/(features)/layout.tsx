import CinematicFooter from '@/components/landing/CinematicFooter'

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <CinematicFooter />
    </>
  )
}
