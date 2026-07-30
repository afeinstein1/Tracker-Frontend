import { useState, useEffect } from 'react'
import { loadPublicTrackers, copyTracker } from '@/lib/trackerService'
import { Tracker } from '@/Types/field'
import { useRouter } from 'expo-router'

export default function Search() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [filtered, setFiltered] = useState<Tracker[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPublicTrackers()
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      setFiltered(trackers)
    } else {
      setFiltered(trackers.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase())
      ))
    }
  }, [query, trackers])

  async function fetchPublicTrackers() {
    try {
      setLoading(true)
      const data = await loadPublicTrackers()
      setTrackers(data)
      setFiltered(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy(trackerId: string) {
    try {
      const copied = await copyTracker(trackerId)
      router.push(`/tracker/${copied.id}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div style={{ width: '90%', margin: '0 auto', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Find Trackers</h1>
        <button onClick={() => router.push('/')} style={{ marginLeft: 'auto' }}>My Trackers</button>
      </div>

      <input
        type="text"
        placeholder="Search trackers..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '16px', fontSize: '16px' }}
      />

      {filtered.length === 0 ? (
        <p>No trackers found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(tracker => (
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
              <button onClick={() => window.open(`/tracker/${tracker.id}`, '_blank')}>Preview</button>
                <button onClick={() => handleCopy(tracker.id)}>Copy to My Trackers</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}