import { ImageResponse } from 'next/og'
import { site } from '@/config/site'

export const alt = site.name
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default share image (1200×630). Pages with their own cover override this via metadata. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #0c0a22 0%, #1a1740 55%, #3a2f8f 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: '#8c86f2',
              transform: 'rotate(45deg)',
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.05, maxWidth: 940 }}>
            {site.tagline}
          </div>
          <div style={{ fontSize: 30, color: '#c9c6f0' }}>{site.bioShort}</div>
        </div>

        <div style={{ fontSize: 24, color: '#9d99c9' }}>
          {site.baseUrl.replace(/^https?:\/\//, '')}
        </div>
      </div>
    ),
    size,
  )
}
