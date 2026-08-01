import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { loadTracker, saveColumnValues, saveTracker, saveTrackerValues, copyTracker, resetTrackerProgress } from "@/lib/trackerService"
import { supabase } from "@/lib/supabase"
import { TrackerView } from "@/renderer/TrackerRenderer"
import { Tracker } from "@/Types/field"
import AdBanner, { AD_BANNER_HEIGHT } from "@/components/AdBanner"

export default function TrackerPage() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>()
  const router = useRouter()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTracker()
  }, [id])

  async function fetchTracker() {
    try {
      setLoading(true)
      const [data, { data: { user } }] = await Promise.all([
        loadTracker(id),
        supabase.auth.getUser()
      ])
      const owner = data.owner_id === user?.id
      setTracker(owner ? data : resetTrackerProgress(data))
      setIsOwner(owner)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(updatedTracker: Tracker) {
    try {
      await saveTracker(updatedTracker)
      await saveTrackerValues(updatedTracker)
      await saveColumnValues(updatedTracker)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleCopy() {
    if (!tracker) return
    try {
      const copied = await copyTracker(tracker.id)
      router.replace(`/tracker/${copied.id}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!tracker) return <p>Tracker not found</p>

  return (
    <div style={{ paddingBottom: AD_BANNER_HEIGHT }}>
      <Stack.Screen options={{ headerShown: false }} />
      <button onClick={() => router.canGoBack() ? router.back() : router.push('/')} style={{ margin: '16px' }}>← Back</button>
      <TrackerView
        key={tracker.id}
        tracker={tracker}
        onSave={isOwner ? handleSave : undefined}
        readOnly={!isOwner}
        onCopy={isOwner ? undefined : handleCopy}
        autoOpenEdit={created === '1'}
      />
      <AdBanner />
    </div>
  )
}