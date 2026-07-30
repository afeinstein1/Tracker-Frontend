// expo-router's `+html.tsx` customization only applies in "static" web output
// mode, not "single" (see app.json). Since "single" mode is required for the
// dynamic /tracker/[id] route to work with our Vercel rewrite config, this
// script patches the exported shell's <head> directly after build instead.
//
// It also writes a plain, dependency-free static page at /about.html — no
// JavaScript, no client-side routing — specifically for Google's OAuth
// consent screen "Application home page" field, since the app itself is a
// client-rendered SPA and Google's verification review does not reliably
// wait for JS to execute before evaluating a submitted homepage URL.
const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distDir, 'index.html')

let html = fs.readFileSync(indexPath, 'utf8')

const description =
  'Tracker Create lets you build custom progress trackers for video game completion checklists, personal goals, collections, and more. Add checkboxes, numbers, and dropdowns to track what matters to you, then share trackers publicly for others to copy.'

if (!html.includes('name="description"')) {
  html = html.replace(
    '<title>Tracker Create</title>',
    `<title>Tracker Create</title>\n    <meta name="description" content="${description}" />`
  )
  fs.writeFileSync(indexPath, html)
  console.log('Injected meta description into dist/index.html')
} else {
  console.log('Meta description already present, skipping')
}

const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tracker Create</title>
  <meta name="description" content="${description}" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #111; }
    h1 { margin-bottom: 4px; }
    h2 { margin-top: 32px; }
    a { color: #4f46e5; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <h1>Tracker Create</h1>
  <p><strong>Track anything.</strong></p>
  <p>
    Tracker Create is a web app for building custom progress trackers — for video game completion
    checklists, personal goals, collections, and more.
  </p>

  <h2>What you can do with Tracker Create</h2>
  <ul>
    <li>Build a tracker made of tabs, sections, and fields (checkboxes, numbers with a target value, or dropdown choices).</li>
    <li>Attach notes and images to individual fields for reference.</li>
    <li>Organize related fields into sections, and group sections into tabs.</li>
    <li>Lock a tab or section behind progress — for example, requiring 50% overall completion, or completion of another tab, before it unlocks.</li>
    <li>See your overall and per-tab progress on a live progress bar as you check things off.</li>
    <li>Make a tracker public so other users can find it and copy it as their own independent, editable version.</li>
  </ul>

  <h2>Signing in</h2>
  <p>
    You can create an account with an email and password, or sign in with Google. If you choose
    "Sign in with Google," we request your email address and basic profile information (name,
    profile picture) from Google. We use this solely to create and authenticate your account — to
    identify you when you log in and let you access your own trackers. We do not use this
    information for advertising, and we do not share it beyond what's needed to run the app (see
    our <a href="https://trackercreate.com/privacy">Privacy Policy</a> for the full list of service
    providers involved).
  </p>

  <p>
    <a href="https://trackercreate.com">Go to the app</a> ·
    <a href="https://trackercreate.com/privacy">Privacy Policy</a> ·
    <a href="https://trackercreate.com/terms">Terms of Service</a>
  </p>
</body>
</html>
`

fs.writeFileSync(path.join(distDir, 'about.html'), aboutHtml)
console.log('Wrote static dist/about.html')
