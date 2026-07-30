import { useEffect } from 'react'
import { Platform } from 'react-native'

const ADSENSE_CLIENT_ID = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID
const ADSENSE_FOOTER_SLOT_ID = process.env.EXPO_PUBLIC_ADSENSE_FOOTER_SLOT_ID

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
    // Deliberately static/in-flow, not position: fixed. A fixed footer needs
    // its height matched by reserved space elsewhere in the page so it never
    // overlaps content — but Expo's web boilerplate pins body/#root to a
    // fixed 100vh box, so padding added anywhere to "reserve" space for a
    // fixed element gets absorbed into that box instead of extending real
    // scroll room. Rendering the ad as a normal block at the end of the page
    // sidesteps that entirely: it's just the last thing on the page, so it
    // can't overlap anything by construction.
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 0',
      }}
    >
      {/*
        Deliberately NOT using data-ad-format="auto" / data-full-width-responsive.
        Those let Google's script pick any shape it wants (including tall
        rectangles) and it resizes the <ins> after load, overriding any CSS
        height we give it. A fixed-size request like this can only ever render
        at exactly 320x50 or not render at all — it cannot grow past that.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_FOOTER_SLOT_ID}
      />
    </div>
  )
}
