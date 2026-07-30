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
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--ad-banner-height)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        // Belt-and-suspenders: the explicit height above is what tells Google's
        // responsive algorithm what size to serve in the first place, so this
        // should rarely trigger — but while a new ad unit is still calibrating,
        // it can occasionally still reserve more than asked for. Since this
        // wrapper sits fixed over page content, an oversized-but-empty
        // reservation would otherwise block clicks underneath it — so only the
        // actual ad (which sets its own pointerEvents) is clickable.
        pointerEvents: 'none',
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
        style={{ display: 'inline-block', width: '320px', height: '50px', pointerEvents: 'auto' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_FOOTER_SLOT_ID}
      />
    </div>
  )
}
