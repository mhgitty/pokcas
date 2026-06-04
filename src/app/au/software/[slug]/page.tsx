import { permanentRedirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

// Permanently moved to /au/online-casino/software/[slug]/
export default async function AuSoftwareLegacyRedirect({ params }: Props) {
  const { slug } = await params
  permanentRedirect(`/au/online-casino/software/${slug}/`)
}
