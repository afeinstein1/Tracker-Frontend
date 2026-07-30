import { useEffect } from 'react'
import { Platform } from 'react-native'

const ADSENSE_CLIENT_ID = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID
const ADSENSE_FOOTER_SLOT_ID = process.env.EXPO_PUBLIC_ADSENSE_FOOTER_SLOT_ID

// Reserve space at the bottom of the page so the fixed banner never overlaps
// content. Responsive ads pick their own height based on container width
// (usually ~90px on desktop, ~50-100px on narrow mobile widths) so this is an
// estimate, not an enforced cap — the container below never clips the ad.
export const AD_BANNER_HEIGHT = 90

export default function AdBanner() {
  const enabled = Platform.OS === 'web' && !!ADSENSE_CLIENT_ID && !!ADSENSE_FOOTER_SLOT_ID

  useEffect(() => {
    if (!enabled) return
    try {
      // @ts-ignore - injected by the adsbygoogle script tag in scripts/inject-meta.js
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '728px' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_FOOTER_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
