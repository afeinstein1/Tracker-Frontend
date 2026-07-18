import { useState } from 'react'
import { useRouter } from 'expo-router'
import { changeEmail, changePassword, deleteAccount } from '@/lib/authService'

export default function Settings() {
  const router = useRouter()

  const [emailPassword, setEmailPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  const [pwCurrentPassword, setPwCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [deletePassword, setDeletePassword] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)

  async function handleChangeEmail() {
    setLoading(true); setEmailError(null); setEmailMessage(null)
    try {
      await changeEmail(emailPassword, newEmail)
      setEmailMessage('Check your new email address for a confirmation link.')
      setEmailPassword('')
      setNewEmail('')
    } catch (e: any) {
      setEmailError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setLoading(true); setPasswordError(null); setPasswordMessage(null)
    try {
      await changePassword(pwCurrentPassword, newPassword)
      setPasswordMessage('Password updated.')
      setPwCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setPasswordError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setLoading(true); setDeleteError(null)
    try {
      await deleteAccount(deletePassword)
      router.replace('/landing')
    } catch (e: any) {
      setDeleteError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '90%', maxWidth: '500px', margin: '0 auto', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Settings</h1>
        <button onClick={() => router.push('/')} style={{ marginLeft: 'auto' }}>← My Trackers</button>
      </div>

      <div style={{ border: '2px solid #ccc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <h2 style={{ marginTop: 0 }}>Change Email</h2>
        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
        {emailMessage && <p style={{ color: 'green' }}>{emailMessage}</p>}
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
        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        {passwordMessage && <p style={{ color: 'green' }}>{passwordMessage}</p>}
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
        {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}
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

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '14px' }}>
        <a onClick={() => router.push('/privacy')} style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Privacy Policy</a>
        <a onClick={() => router.push('/terms')} style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Terms of Service</a>
      </div>
    </div>
  )
}