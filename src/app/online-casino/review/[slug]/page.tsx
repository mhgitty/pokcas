import { redirect } from 'next/navigation'
export default async function OnlineCasinoReviewSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/review/${slug}/`)
}
