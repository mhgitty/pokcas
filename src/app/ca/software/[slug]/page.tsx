import { redirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

// Permanently moved to /ca/online-casino/software/[slug]/
export default async function CaSoftwareLegacyRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/ca/online-casino/software/${slug}/`)
}
