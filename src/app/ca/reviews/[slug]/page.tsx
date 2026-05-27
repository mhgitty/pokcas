import { redirect } from 'next/navigation'
export default async function CaReviewsLegacy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/ca/online-casino/review/${slug}/`)
}
