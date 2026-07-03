import { useState } from 'react'
import { useRouter } from 'expo-router'
import { changeEmail, changePassword, deleteAccount } from '@/lib/authService'

export default function Settings() {
  const router = useRouter()

  const [emailPassword, setEmailPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const [pwCurrentPassword, setPwCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [deletePassword, setDeletePassword] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleChangeEmail() {
    setLoading(true); setError(null); setMessage(null)
    try {
      await changeEmail(emailPassword, newEmail)
      setMessage('Check your new email address for a confirmation link.')
      setEmailPassword('')
      setNewEmail('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setLoading(true); setError(null); setMessage(null)
    try {
      await changePassword(pwCurrentPassword, newPassword)
      setMessage('Password updated.')
      setPwCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setLoading(true); setError(null)
    try {
      await deleteAccount(deletePassword)
      router.replace('/landing')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '90%', maxWidth: '500px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Settings</h1>
        <button onClick={() => router.push('/')} style={{ marginLeft: 'auto' }}>← My Trackers</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ border: '2px solid #ccc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h2 style={{ marginTop: 0 }}>Change Email</h2>
        <label>
          New Email
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
        </label>
        <label>
          Current Password
          <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
        </label>
        <button onClick={handleChangeEmail} disabled={loading || !newEmail || !emailPassword}>Update Email</button>
      </div>

      <div style={{ border: '2px solid #ccc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h2 style={{ marginTop: 0 }}>Change Password</h2>
        <label>
          Current Password
          <input type="password" value={pwCurrentPassword} onChange={e => setPwCurrentPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
        </label>
        <label>
          New Password
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
        </label>
        <label>
          Confirm New Password
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
        </label>
        <button onClick={handleChangePassword} disabled={loading || !pwCurrentPassword || !newPassword}>Update Password</button>
      </div>

      <div style={{ border: '2px solid var(--color-danger)', borderRadius: '12px', padding: '16px' }}>
        <h2 style={{ marginTop: 0, color: 'red' }}>Delete Account</h2>
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} style={{ color: 'red' }}>Delete My Account</button>
        ) : (
          <>
            <p>This permanently deletes your account and all your trackers. This cannot be undone.</p>
            <label>
              Current Password
              <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', marginBottom: '12px', padding: '8px' }} />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={loading || !deletePassword} style={{ color: 'red' }}>Confirm Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}