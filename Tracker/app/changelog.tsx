import { useRouter } from "expo-router"

type Release = {
  date: string
  items: string[]
}

const releases: Release[] = [
  {
    date: "July 2026",
    items: [
      "Mobile-friendly layout — trackers, popups, and forms now scale to fit smaller screens instead of requiring a wide browser window.",
      "Sign in with Google.",
      "Account settings: change your email or password, or permanently delete your account.",
      "Forgot password flow with email reset links.",
      "Privacy Policy and Terms of Service.",
      "Tracker Create is now live at trackercreate.com.",
    ],
  },
]

export default function Changelog() {
  const router = useRouter()

  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Changelog</h1>
        <button onClick={() => router.back()} style={{ marginLeft: 'auto' }}>← Back</button>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
        What's new in Tracker Create, newest first.
      </p>

      {releases.map((release, index) => (
        <div key={index} style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px' }}>{release.date}</h2>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.7 }}>
            {release.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
