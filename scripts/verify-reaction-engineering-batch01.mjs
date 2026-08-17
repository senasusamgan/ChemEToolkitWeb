import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'adiabaticBatchReactor',
  'adiabaticCSTR',
  'adiabaticPFR',
  'autocatalyticBatchReactor',
  'axialDispersionRTD',
  'bypassFractionEstimator',
]

const catalog =
  fs.readFileSync(
    path.join(
      root,
      'src/data/calculators.ts',
    ),
    'utf8',
  )

const entries = [
  ...catalog.matchAll(
    /\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g,
  ),
]

const liveEntries =
  entries.filter(
    (entry) =>
      entry[4] === 'true',
  )

if (
  entries.length !== 380 ||
  liveEntries.length !== 334
) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${liveEntries.length} live`,
  )
  process.exit(1)
}

for (const id of ids) {
  const entry =
    entries.find(
      (candidate) =>
        candidate[1] === id,
    )

  if (
    !entry ||
    entry[3] !==
      'Reaction Engineering' ||
    entry[4] !== 'true'
  ) {
    console.error(
      `Reaction Engineering module is not live: ${id}`,
    )
    process.exit(1)
  }
}

const categoryLive =
  liveEntries.filter(
    (entry) =>
      entry[3] ===
      'Reaction Engineering',
  ).length

if (categoryLive !== 16) {
  console.error(
    `Reaction Engineering live count is ${categoryLive}, expected 16.`,
  )
  process.exit(1)
}

const categories =
  fs.readFileSync(
    path.join(
      root,
      'src/data/categories.ts',
    ),
    'utf8',
  )

const block =
  categories.match(
    /\{[^{}]*name:\s*"Reaction Engineering"[^{}]*\}/s,
  )

if (
  !block ||
  !/\blive:\s*16\b/.test(
    block[0],
  ) ||
  !/\btotal:\s*62\b/.test(
    block[0],
  )
) {
  console.error(
    'Reaction Engineering category is not 16 / 62.',
  )
  process.exit(1)
}

const workbench =
  fs.readFileSync(
    path.join(
      root,
      'scripts/calculator-routing-contract-v1.txt',
    ),
    'utf8',
  )

for (const id of ids) {
  if (
    !workbench.includes(
      `calculatorId === '${id}'`,
    )
  ) {
    console.error(
      `Workbench route is missing: ${id}`,
    )
    process.exit(1)
  }
}

console.log(
  'Reaction Engineering Batch 01 verification PASS',
)
console.log(
  '380 total / 334 live / 46 queued',
)
console.log(
  'Reaction Engineering: 16 live / 62 total',
)
