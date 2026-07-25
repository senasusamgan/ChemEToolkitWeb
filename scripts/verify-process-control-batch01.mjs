import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ids = [
  'blockDiagramAlgebra',
  'cascadeControl',
  'closedLoopFeedbackAnalysis',
  'cohenCoonTuning',
  'processControlStrategyComparison',
  'cubicRouthHurwitzStability',
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

if (entries.length !== 380 || liveEntries.length !== 266) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${liveEntries.length} live`,
  )
  process.exit(1)
}

for (const id of ids) {
  const entry = entries.find(
    (candidate) => candidate[1] === id,
  )

  if (!entry) {
    console.error(`Catalog entry is missing: ${id}`)
    process.exit(1)
  }

  if (
    entry[3] !== 'Process Control' ||
    entry[4] !== 'true'
  ) {
    console.error(
      `Calculator is not live in Process Control: ${id}`,
    )
    process.exit(1)
  }
}

const processControlLive = liveEntries.filter(
  (entry) => entry[3] === 'Process Control',
).length

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)

const categoryBlock = categories.match(
  /\{[^{}]*name:\s*"Process Control"[^{}]*\}/s,
)

if (!categoryBlock) {
  console.error(
    'Process Control category record was not found.',
  )
  process.exit(1)
}

const liveMatch =
  categoryBlock[0].match(/\blive:\s*(\d+)/)
const totalMatch =
  categoryBlock[0].match(/\btotal:\s*(\d+)/)

if (
  !liveMatch ||
  !totalMatch ||
  Number(totalMatch[1]) !== 40 ||
  Number(liveMatch[1]) !== processControlLive
) {
  console.error(
    'Process Control category count does not match the catalog.',
  )
  process.exit(1)
}

console.log('Process Control Batch 01 verification PASS')
console.log('380 total / 266 live / 114 queued')
console.log(
  `Process Control: ${processControlLive} live / 40 total`,
)
