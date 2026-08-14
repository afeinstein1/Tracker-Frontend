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

// This script runs as its own `node` process after `expo export`, so it
// doesn't inherit the .env values Expo's CLI loads internally for the build
// step — load them the same way Expo does so EXPO_PUBLIC_* vars from .env
// are visible here too (e.g. for the AdSense client ID below).
require('@expo/env').load(path.join(__dirname, '..'))

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

// AdSense's auto ads script must be present in the document <head> for site
// verification and ad serving. Only injected when the client ID is set (i.e.
// once the AdSense application is approved) — set EXPO_PUBLIC_ADSENSE_CLIENT_ID
// in Vercel's project env vars to turn this on, nothing else to change here.
const adsenseClientId = process.env.EXPO_PUBLIC_ADSENSE_CLIENT_ID
const adsenseSlotId = process.env.EXPO_PUBLIC_ADSENSE_FOOTER_SLOT_ID
const adsenseEnabled = !!adsenseClientId && !!adsenseSlotId
if (adsenseClientId && !html.includes('pagead2.googlesyndication.com')) {
  html = fs.readFileSync(indexPath, 'utf8')
  const adsenseScript = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}" crossorigin="anonymous"></script>`
  html = html.replace('</head>', `    ${adsenseScript}\n  </head>`)
  fs.writeFileSync(indexPath, html)
  console.log('Injected AdSense script into dist/index.html')
} else if (!adsenseClientId) {
  console.log('EXPO_PUBLIC_ADSENSE_CLIENT_ID not set, skipping AdSense script injection')
}

// This page is also the one reliable place to put an ad unit for AdSense's
// own review crawler: it's static (no JS bundle, no auth check, no
// client-side redirect) so it's guaranteed to render — unlike index.tsx and
// tracker/[id].tsx, which sit behind an async auth check, or "/", which
// client-redirects unauthenticated visitors to /landing only after that
// check resolves. See the comment above about.html's origin for the same
// reasoning applied to Google's OAuth review crawler.
const adsenseHeadTag = adsenseEnabled
  ? `\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}" crossorigin="anonymous"></script>`
  : ''

const adsenseBodyMarkup = adsenseEnabled
  ? `
  <div style="width: 100%; display: flex; justify-content: center; padding: 16px 0; border-top: 1px solid #ccc; margin-top: 32px;">
    <ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="${adsenseClientId}" data-ad-slot="${adsenseSlotId}"></ins>
  </div>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
`
  : ''

const aboutHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tracker Create</title>
  <meta name="description" content="${description}" />${adsenseHeadTag}
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
${adsenseBodyMarkup}</body>
</html>
`

fs.writeFileSync(path.join(distDir, 'about.html'), aboutHtml)
console.log('Wrote static dist/about.html')
