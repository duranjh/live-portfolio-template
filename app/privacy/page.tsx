import type { Metadata } from 'next'
import { getLegalBySlug } from '@/lib/content'
import { LegalPage } from '@/components/legal/legal-page'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return <LegalPage doc={getLegalBySlug('privacy')} title="Privacy Policy" slug="privacy" />
}
