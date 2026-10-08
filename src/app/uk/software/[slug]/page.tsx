import { permanentRedirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

// Permanently moved to /uk/online-casino/software/[slug]/
export default async function CaSoftwareLegacyRedirect({ params }: Props) {
  const { slug } = await params
  permanentRedirect(`/uk/online-casino/software/${slug}/`)
}
