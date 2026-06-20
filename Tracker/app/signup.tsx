import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'expo-router'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSignUp() {
    setLoading(true)
    setError(null)
    const { data: { session }, error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else if (!session) setMessage('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', paddingTop: '80px' }}>
      <h1>Sign Up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@address.com"
            style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px' }}
          />
        </label>
        <button onClick={handleSignUp} disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <p>Already have an account? <a onClick={() => router.push('/login')} style={{ cursor: 'pointer', color: 'blue' }}>Log in</a></p>
      </div>
    </div>
  )
}