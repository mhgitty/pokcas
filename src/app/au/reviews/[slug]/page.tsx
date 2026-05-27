import { redirect } from 'next/navigation'
export default async function AuReviewsLegacy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/au/online-casino/review/${slug}/`)
}
