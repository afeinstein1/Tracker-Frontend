import { useRouter } from "expo-router"

export default function Terms() {
  const router = useRouter()

  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Terms of Service</h1>
        <button onClick={() => router.back()} style={{ marginLeft: 'auto' }}>← Back</button>
      </div>

      <p style={{ color: 'var(--color-text-muted)' }}>Last updated: July 2026</p>

      <h2>1. Acceptance</h2>
      <p>By creating an account or using Tracker, you agree to these terms. If you don't agree, please don't use the app.</p>

      <h2>2. What Tracker is</h2>
      <p>
        Tracker lets you build custom progress trackers for games, goals, collections, and similar use cases, and optionally share them publicly for others to copy and use.
      </p>

      <h2>3. Your account</h2>
      <p>
        You're responsible for keeping your login credentials secure and for anything that happens under your account. Provide accurate information when signing up.
      </p>

      <h2>4. Your content</h2>
      <p>
        You own whatever you create in the app — tracker titles, notes, images, and structure. By marking a tracker "public," you grant other users permission to view it and make their own independent copy of it; you're not granting us or anyone else broader rights to your content beyond what's needed to operate the app.
      </p>

      <h2>5. Acceptable use</h2>
      <p>Don't use Tracker to upload illegal content, infringe on others' rights, harass other users, or attempt to disrupt or abuse the service (including its storage and image-upload limits).</p>

      <h2>6. Copies</h2>
      <p>
        When you copy a public tracker, you get your own independent version — your copy, your progress, your images. Changes the original owner makes afterward (including deleting their account or the original tracker) don't affect your copy.
      </p>

      <h2>7. Termination</h2>
      <p>
        You can delete your account at any time from Settings, which permanently removes your data. We may suspend or remove accounts that violate these terms.
      </p>

      <h2>8. No warranty</h2>
      <p>
        Tracker is provided "as is," without warranties of any kind. We do our best to keep the service reliable, but we don't guarantee it will always be available or error-free.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we aren't liable for any indirect, incidental, or consequential damages arising from your use of the app.
      </p>

      <h2>10. Changes</h2>
      <p>We may update these terms occasionally; the date at the top will reflect the latest revision.</p>

      <h2>11. Contact</h2>
      <p>Questions about these terms? Reach out at <strong>support@trackercreate.com</strong>.</p>
    </div>
  )
}
