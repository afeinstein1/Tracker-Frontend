import { useRouter } from "expo-router"

export default function Landing() {
  const router = useRouter()

  return (
    <div style={{ width: '90%', maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
      <h1>Track anything.</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
        Build custom progress trackers for games, goals, collections, and more.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => router.push('/login')}>Log In</button>
        <button onClick={() => router.push('/signup')}>Sign Up</button>
      </div>
    </div>
  )
}