import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const required = [
  'src/App.tsx',
  'src/App.css',
  'src/data/calculators.ts',
  'src/data/categories.ts',
  'public/legacy/index.html',
  'public/legacy/assets/page-B3PN5Psl.js',
]

for (const relativePath of required) {
  const fullPath = path.join(root, relativePath)

  if (!fs.existsSync(fullPath)) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const catalog = fs.readFileSync(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)

const total = (catalog.match(/available:/g) ?? []).length
const live = (catalog.match(/available: true/g) ?? []).length

if (total !== 380 || live !== 184) {
  console.error(`Catalog mismatch: ${total} total / ${live} live`)
  process.exit(1)
}

console.log('Migration bridge verification PASS')
console.log('380 total / 184 live / 196 queued')
