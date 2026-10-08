import { permanentRedirect } from 'next/navigation'
export default async function CaReviewsLegacy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/uk/online-casino/review/${slug}/`)
}
