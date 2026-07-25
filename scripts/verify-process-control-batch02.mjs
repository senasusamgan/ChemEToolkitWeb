import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'feedforwardControl',
  'firstOrderFrequencyResponse',
  'gainScheduling',
  'integratingProcessResponse',
  'interactingTankSystem',
  'internalModelControlAnalysis',
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

if (
  entries.length !== 380 ||
  liveEntries.length !== 272
) {
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
    console.error(
      `Calculator is not live in Process Control: ${id}`,
    )
    process.exit(1)
  }
}

const processControlLive = liveEntries.filter(
  (entry) => entry[3] === 'Process Control',
).length

if (processControlLive !== 18) {
  console.error(
    `Process Control catalog count is ${processControlLive}, expected 18.`,
  )
  process.exit(1)
}

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
  Number(liveMatch[1]) !== 18
) {
  console.error(
    'Process Control category count is not 18 / 40.',
  )
  process.exit(1)
}

console.log(
  'Process Control Batch 02 verification PASS',
)
console.log(
  '380 total / 272 live / 108 queued',
)
console.log(
  'Process Control: 18 live / 40 total',
)
