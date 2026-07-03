import { Stack, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" 
import '@/css/global.css'

const PUBLIC_SEGMENTS = ['login', 'signup', 'landing', 'reset-password']

export default function RootLayout() {
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

return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <Stack screenOptions={{ headerShown: false }} />
    </div>
  )
}