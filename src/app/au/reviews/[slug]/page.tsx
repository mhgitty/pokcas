import { permanentRedirect } from 'next/navigation'
export default async function AuReviewsLegacy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/au/online-casino/review/${slug}/`)
}
