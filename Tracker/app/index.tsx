import { useEffect, useState } from "react"
import { supabase } from '../lib/supabase'
import { loadUserTrackers, createTracker, deleteTracker } from '../lib/trackerService'
import { Tracker } from "@/Types/field"
import { useFocusEffect } from "expo-router"
import { useCallback } from "react"
import { useRouter } from "expo-router"
import '@/css/global.css'

export default function Index() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()


  useFocusEffect(
    useCallback(() => {
      fetchTrackers()
    }, [])
  )

  async function fetchTrackers() {
    try {
      setLoading(true)
      const data = await loadUserTrackers()
      setTrackers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const tracker = await createTracker("New Tracker")
      router.push(`/tracker/${tracker.id}?created=1`)
    } catch (e: any) {
      setError(e.message)
    }
  }

const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

async function handleDelete() {
  if (!pendingDeleteId) return
  try {
    await deleteTracker(pendingDeleteId)
    setTrackers(prev => prev.filter(t => t.id !== pendingDeleteId))
    setPendingDeleteId(null)
  } catch (e: any) {
    setError(e.message)
  }
}

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div style={{ width: '90%', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        <h1>My Trackers</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleCreate}>+ New Tracker</button>
          <button onClick={() => router.push('/search')}>Find Trackers</button>
          <button onClick={() => router.push('/settings')}>Settings</button>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {trackers.length === 0 ? (
        <p>You don't have any trackers yet. Create one to get started!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trackers.map(tracker => (
            <div key={tracker.id} style={{
              border: '2px solid #ccc',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h2 style={{ margin: 0 }}>{tracker.title}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => router.push(`/tracker/${tracker.id}`)}>Open</button>
                <button onClick={() => setPendingDeleteId(tracker.id)} style={{ color: 'red' }}>Delete</button>

              </div>
            </div>
          ))}
        </div>
      )}
      {pendingDeleteId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-background)',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: 'var(--color-text)'
          }}>
            <h2 style={{ margin: 0 }}>Delete Tracker</h2>
            <p>This will delete the entire tracker and all its tabs, sections, and fields.</p>
            <p>Are you sure?</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPendingDeleteId(null)}>Go Back</button>
              <button onClick={handleDelete} style={{ color: 'red' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}