import { useEffect } from 'react'
import { Platform } from 'react-native'

const ADSENSE_CLIENT_ID = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID
const ADSENSE_FOOTER_SLOT_ID = process.env.EXPO_PUBLIC_ADSENSE_FOOTER_SLOT_ID

const ADS_CONFIGURED = Platform.OS === 'web' && !!ADSENSE_CLIENT_ID && !!ADSENSE_FOOTER_SLOT_ID

// 50px ad + 4px top/bottom padding + 1px top border. Pages rendering AdBanner should reserve
// this much bottom padding so the fixed bar never covers the last bit of content.
export const AD_BANNER_HEIGHT = 59

// TODO: this banner is meant to hide for premium users (`!isPremium`), but is left always-on
// for now per explicit request while premium is still being built out - reinstate the
// isPremium check (see git history) once premium is fully implemented.
export default function AdBanner() {
  useEffect(() => {
    if (!ADS_CONFIGURED) return
    try {
      // @ts-ignore - injected by the adsbygoogle script tag in scripts/inject-meta.js
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    // Fixed to the viewport bottom like a persistent tab bar, so it stays visible on tall pages
    // instead of scrolling out of view with the rest of the content.
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 0',
        zIndex: 500,
      }}
    >
      {ADS_CONFIGURED ? (
        // Deliberately NOT using data-ad-format="auto" / data-full-width-responsive.
        // Those let Google's script pick any shape it wants (including tall rectangles) and it
        // resizes the <ins> after load, overriding any CSS height we give it. A fixed-size
        // request like this can only ever render at exactly 320x50 or not render at all.
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={ADSENSE_FOOTER_SLOT_ID}
        />
      ) : (
        <div
          style={{
            width: '320px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
          }}
        >
          Ad placeholder
        </div>
      )}
    </div>
  )
}
