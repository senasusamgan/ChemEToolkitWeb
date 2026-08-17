import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'faultTreeProbability',
  'sifAveragePFD',
  'proofTestIntervalCalculator',
  'riskReductionCostEffectiveness',
  'expectedMonetaryValueDecision',
  'lifecycleCostAnalysis',
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
  liveEntries.length !== 324
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
      'Process Safety & Economics' ||
    entry[4] !== 'true'
  ) {
    console.error(
      `Process Safety & Economics module is not live: ${id}`,
    )
    process.exit(1)
  }
}

const categoryLive =
  liveEntries.filter(
    (entry) =>
      entry[3] ===
      'Process Safety & Economics',
  ).length

if (categoryLive !== 36) {
  console.error(
    `Category live count is ${categoryLive}, expected 36.`,
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
    /\{[^{}]*name:\s*"Process Safety & Economics"[^{}]*\}/s,
  )

if (
  !block ||
  !/\blive:\s*36\b/.test(
    block[0],
  ) ||
  !/\btotal:\s*40\b/.test(
    block[0],
  )
) {
  console.error(
    'Process Safety & Economics category is not 36 / 40.',
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
  'Process Safety & Economics Batch 06 verification PASS',
)
console.log(
  '380 total / 324 live / 56 queued',
)
console.log(
  'Process Safety & Economics: 36 live / 40 total',
)
