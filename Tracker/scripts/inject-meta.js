// expo-router's `+html.tsx` customization only applies in "static" web output
// mode, not "single" (see app.json). Since "single" mode is required for the
// dynamic /tracker/[id] route to work with our Vercel rewrite config, this
// script patches the exported shell's <head> directly after build instead.
const fs = require('fs')
const path = require('path')

const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
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
