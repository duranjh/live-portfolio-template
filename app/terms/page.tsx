import type { Metadata } from 'next'
import { getLegalBySlug } from '@/lib/content'
import { LegalPage } from '@/components/legal/legal-page'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return <LegalPage doc={getLegalBySlug('terms')} title="Terms of Service" slug="terms" />
}
