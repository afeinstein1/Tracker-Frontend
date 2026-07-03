import { useState } from 'react'
import { signInWithProvider } from '@/lib/authService'

export function OAuthButtons() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await signInWithProvider('google')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
      </div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Redirecting...' : 'Continue with Google'}
      </button>
    </div>
  )
}