import { NextRequest } from 'next/server'
import { handleGoRedirect } from '@/lib/goRedirect'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return handleGoRedirect(req, code, 'ca')
}
