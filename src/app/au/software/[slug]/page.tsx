import { redirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

// Permanently moved to /au/online-casino/software/[slug]/
export default async function AuSoftwareLegacyRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/au/online-casino/software/${slug}/`)
}
