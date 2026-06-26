import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { loadTracker, saveColumnValues, saveTracker, saveTrackerValues } from "@/lib/trackerService"
import { TrackerView } from "@/renderer/TrackerRenderer"
import { Tracker } from "@/Types/field"

export default function TrackerPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTracker()
  }, [id])

  async function fetchTracker() {
    try {
      setLoading(true)
      const data = await loadTracker(id)
      setTracker(data)
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

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!tracker) return <p>Tracker not found</p>

  return <TrackerView tracker={tracker} onSave={handleSave} />
}