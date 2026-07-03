import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'expo-router'
import { sendPasswordReset } from '@/lib/authService'
import { OAuthButtons } from '@/components/OAuthButtons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [forgotMode, setForgotMode] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleForgotPassword() {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await sendPasswordReset(email)
      setMessage('Check your email for a password reset link.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '90%', maxWidth: '400px', margin: '0 auto', paddingTop: '80px' }}>
      <h1>{forgotMode ? 'Reset Password' : 'Log In'}</h1>
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
        {!forgotMode && (
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
        )}
        {forgotMode ? (
          <>
            <button onClick={handleForgotPassword} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p><a onClick={() => { setForgotMode(false); setError(null); setMessage(null) }} style={{ cursor: 'pointer', color: 'blue' }}>← Back to Log In</a></p>
          </>
        ) : (
          <>
            <button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <p><a onClick={() => { setForgotMode(true); setError(null); setMessage(null) }} style={{ cursor: 'pointer', color: 'blue' }}>Forgot password?</a></p>
            <OAuthButtons />
            <p>Don't have an account? <a onClick={() => router.push('/signup')} style={{ cursor: 'pointer', color: 'blue' }}>Sign up</a></p>
          </>
        )}
      </div>
    </div>
  )
}