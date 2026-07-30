import { useRouter } from "expo-router"

export default function Privacy() {
  const router = useRouter()

  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Privacy Policy</h1>
        <button onClick={() => router.back()} style={{ marginLeft: 'auto' }}>← Back</button>
      </div>

      <p style={{ color: 'var(--color-text-muted)' }}>Last updated: July 2026</p>

      <p>
        This policy explains what information Tracker ("we", "us") collects when you use this app, how it's used, and the choices you have. It's written in plain language rather than dense legal text — if you have questions, reach out using the contact info at the bottom.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account information</strong>: your email address, and a password (which we never see in plain text — it's handled entirely by our authentication provider, Supabase). If you choose "Sign in with Google" instead, Google shares your email address and basic profile info (name, profile picture) with us. We request this data solely to create and authenticate your account — to identify you when you log in and let you access your own trackers. We do not use it for advertising, and we do not share it with anyone beyond the service providers listed below that are necessary to run the app.</li>
        <li><strong>Content you create</strong>: tracker titles, tabs, sections, fields, notes, and any images you upload.</li>
        <li><strong>Your progress</strong>: which checkboxes, numbers, and dropdowns you've filled in on any tracker, including public ones you haven't made your own copy of.</li>
      </ul>
      <p>We don't run ads, sell data, or use third-party analytics/tracking scripts.</p>

      <h2>How we use it</h2>
      <p>
        Solely to operate the app: authenticating you, saving and displaying your trackers, and letting you track progress. Your session is kept in your browser's local storage so you stay logged in between visits.
      </p>

      <h2>Public trackers</h2>
      <p>
        If you mark a tracker "public," its structure and content (including any notes or images attached to its fields) become visible to any other user who searches for or opens it, and they can make their own independent copy. Your personal progress on your own trackers is never shown to other users, whether the tracker is public or private.
      </p>

      <h2>Who we share data with</h2>
      <p>
        We use a small number of service providers to run the app, each of which processes data on our behalf under their own privacy/security commitments:
      </p>
      <ul>
        <li><strong>Supabase</strong> — database, authentication, and file storage</li>
        <li><strong>Google</strong> — optional sign-in</li>
        <li><strong>Vercel</strong> — web hosting</li>
      </ul>
      <p>We don't sell or share your data with anyone beyond what's needed to run the service through these providers.</p>

      <h2>Your data, your control</h2>
      <p>
        You can change your email or password, or permanently delete your account, at any time from Settings. Deleting your account removes your trackers, uploaded images, and progress data — this cannot be undone. If you've copied a tracker from someone else, your copy is entirely independent and unaffected if the original owner later deletes their account.
      </p>

      <h2>Children's privacy</h2>
      <p>This app isn't directed at children under 13, and we don't knowingly collect information from them.</p>

      <h2>Changes to this policy</h2>
      <p>If this policy changes meaningfully, we'll update the date at the top of this page.</p>

      <h2>Contact</h2>
      <p>Questions about this policy? Reach out at <strong>support@trackercreate.com</strong>.</p>
    </div>
  )
}
