import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ids = [
  'mimoDecouplingControl',
  'adaptiveControl',
  'ratioControl',
  'secondOrderFrequencyResponse',
  'smithPredictor',
  'splitRangeControl',
]

const catalog = fs.readFileSync(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)

const entries = [
  ...catalog.matchAll(
    /\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g,
  ),
]

const liveEntries = entries.filter(
  (entry) => entry[4] === 'true',
)

if (entries.length !== 380 || liveEntries.length !== 290) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${liveEntries.length} live`,
  )
  process.exit(1)
}

for (const id of ids) {
  const entry = entries.find(
    (candidate) => candidate[1] === id,
  )
  if (
    !entry ||
    entry[3] !== 'Process Control' ||
    entry[4] !== 'true'
  ) {
    console.error(`Process Control module is not live: ${id}`)
    process.exit(1)
  }
}

const processControlLive = liveEntries.filter(
  (entry) => entry[3] === 'Process Control',
).length

if (processControlLive !== 36) {
  console.error(
    `Process Control live count is ${processControlLive}, expected 36.`,
  )
  process.exit(1)
}

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)

const block = categories.match(
  /\{[^{}]*name:\s*"Process Control"[^{}]*\}/s,
)

if (
  !block ||
  !/\blive:\s*36\b/.test(block[0]) ||
  !/\btotal:\s*40\b/.test(block[0])
) {
  console.error('Process Control category is not 36 / 40.')
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

console.log('Process Control Batch 05 verification PASS')
console.log('380 total / 290 live / 90 queued')
console.log('Process Control: 36 live / 40 total')
