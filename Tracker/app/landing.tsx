import { useRouter } from "expo-router"
import AdBanner, { AD_BANNER_HEIGHT } from "@/components/AdBanner"

export default function Landing() {
  const router = useRouter()

  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: '0 auto', paddingTop: '60px', paddingBottom: AD_BANNER_HEIGHT, textAlign: 'center' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Tracker Create</h1>
      <p style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Track anything.</p>
      <p style={{ fontSize: '17px', color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
        Tracker Create lets you build custom progress trackers for video game completion checklists, personal goals, collections, and more. Add checkboxes, numbers, and dropdowns to track exactly what matters to you, attach notes and images for reference, and organize everything into tabs and sections. Share a tracker publicly so others can copy it and track their own progress.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '48px' }}>
        <button onClick={() => router.push('/login')}>Log In</button>
        <button onClick={() => router.push('/signup')}>Sign Up</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '14px' }}>
        <a onClick={() => router.push('/changelog')} style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Changelog</a>
        <a onClick={() => router.push('/privacy')} style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Privacy Policy</a>
        <a onClick={() => router.push('/terms')} style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>Terms of Service</a>
      </div>
      <AdBanner />
    </div>
  )
}
