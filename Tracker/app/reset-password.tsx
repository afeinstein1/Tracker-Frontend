import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit() {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', paddingTop: '80px' }}>
        <h1>Password Updated</h1>
        <p>Your password has been changed.</p>
        <button onClick={() => router.replace('/')}>Continue</button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', paddingTop: '80px' }}>
        <h1>Reset Password</h1>
        <p>This link is invalid or has expired. Request a new one from the login page.</p>
        <button onClick={() => router.replace('/login')}>Back to Log In</button>
      </div>
    )
  }

  return (
    <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', paddingTop: '80px' }}>
      <h1>Set a New Password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>
          New Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }} />
        </label>
        <label>
          Confirm Password
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }} />
        </label>
        <button onClick={handleSubmit} disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
      </div>
    </div>
  )
}