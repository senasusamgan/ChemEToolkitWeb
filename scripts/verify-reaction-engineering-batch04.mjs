import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ids = [
  'equilibriumConversion',
  'fCurveGenerator',
  'heatExchangeBatchReactor',
  'heatExchangeCSTR',
  'heatExchangePFR',
  'immobilizedEnzymeReactor',
]

const catalog = fs.readFileSync(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)
const entries = [...catalog.matchAll(
  /\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g,
)]
const live = entries.filter((entry) => entry[4] === 'true')

if (entries.length !== 380 || live.length !== 352) {
  console.error(`Catalog mismatch: ${entries.length} total / ${live.length} live`)
  process.exit(1)
}
for (const id of ids) {
  const entry = entries.find((candidate) => candidate[1] === id)
  if (!entry || entry[3] !== 'Reaction Engineering' || entry[4] !== 'true') {
    console.error(`Reaction Engineering module is not live: ${id}`)
    process.exit(1)
  }
}
if (live.filter((entry) => entry[3] === 'Reaction Engineering').length !== 34) {
  console.error('Reaction Engineering live count is not 34.')
  process.exit(1)
}

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)
const block = categories.match(
  /\{[^{}]*name:\s*"Reaction Engineering"[^{}]*\}/s,
)
if (
  !block ||
  !/\blive:\s*34\b/.test(block[0]) ||
  !/\btotal:\s*62\b/.test(block[0])
) {
  console.error('Reaction Engineering category is not 34 / 62.')
  process.exit(1)
}

const workbench = fs.readFileSync(
  path.join(root, 'scripts/calculator-routing-contract-v1.txt'),
  'utf8',
)
for (const id of ids) {
  if (!workbench.includes(`calculatorId === '${id}'`)) {
    console.error(`Workbench route is missing: ${id}`)
    process.exit(1)
  }
}

console.log('Reaction Engineering Batch 04 verification PASS')
console.log('380 total / 352 live / 28 queued')
console.log('Reaction Engineering: 34 live / 62 total')
