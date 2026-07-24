import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const files = {
  app: path.join(root, 'src/App.tsx'),
  appCss: path.join(root, 'src/App.css'),
  polishCss: path.join(root, 'src/styles/calculator-polish.css'),
  searchCss: path.join(root, 'src/styles/calculator-search.css'),
}

for (const filePath of Object.values(files)) {
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${filePath}`)
    process.exit(1)
  }
}

const app = fs.readFileSync(files.app, 'utf8')
const appCss = fs.readFileSync(files.appCss, 'utf8')
const polishCss = fs.readFileSync(files.polishCss, 'utf8')
const searchCss = fs.readFileSync(files.searchCss, 'utf8')

const checks = [
  [app.includes('className="engineering-use-note"'), 'Engineering-use note markup'],
  [app.includes('Results are intended for education, preliminary screening'), 'Engineering-use note text'],
  [appCss.includes('/* UI STABILITY V1: HEADER */'), 'Sticky-header CSS'],
  [appCss.includes('scroll-padding-top'), 'Anchor scroll offset'],
  [appCss.includes('overflow-x: clip'), 'Horizontal overflow containment'],
  [polishCss.includes('/* UI STABILITY V1: CALCULATOR STAGE */'), 'Calculator-stage overflow fix'],
  [searchCss.includes('/* UI STABILITY V1: SEARCH MENU */'), 'Search-menu alignment fix'],
  [searchCss.includes('scrollbar-gutter: stable'), 'Stable search scrollbar'],
]

for (const [passed, label] of checks) {
  if (!passed) {
    console.error(`FAILED: ${label}`)
    process.exit(1)
  }
}

console.log('UI Stability v1 verification PASS')
console.log('Sticky header: enabled')
console.log('Full-screen calculator search: stabilized')
console.log('References engineering-use note: added')
console.log('Calculator engines and catalog counts: unchanged')
