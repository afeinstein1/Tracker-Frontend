import "@/lib/sentry"
import * as Sentry from "@sentry/react-native"
import { Stack, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdBanner from "@/components/AdBanner"
import '@/css/global.css'

const PUBLIC_SEGMENTS = ['login', 'signup', 'landing', 'reset-password', 'privacy', 'terms', 'changelog']

export default Sentry.wrap(function RootLayout() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/reset-password')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading) return

    const inPublicGroup = PUBLIC_SEGMENTS.includes(segments[0] as string)
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'landing'

    if (!session && !inPublicGroup) {
      router.replace('/landing')
    } else if (session && inAuthGroup) {
      router.replace("/")
    }
  }, [session, loading, segments])

  if (loading) return null

  const inPublicGroup = PUBLIC_SEGMENTS.includes(segments[0] as string)
  const showAds = !!session && !inPublicGroup

return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)', paddingBottom: showAds ? 'var(--ad-banner-height)' : 0 }}>
      <Sentry.ErrorBoundary fallback={<p style={{ padding: '24px' }}>Something went wrong. Please refresh the page.</p>}>
        <Stack screenOptions={{ headerShown: false }} />
      </Sentry.ErrorBoundary>
      {showAds && <AdBanner />}
    </div>
  )
});
