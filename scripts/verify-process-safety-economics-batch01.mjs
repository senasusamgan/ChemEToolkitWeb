import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'equipmentCostScaling',
  'costIndexEscalation',
  'emergencyVentilationDilution',
  'annualizedLossExpectancy',
  'liquidLeakRateScreening',
  'paybackAndROIAnalysis',
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
  liveEntries.length !== 294
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
      `Expected live Process Safety & Economics module: ${id}`,
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

if (categoryLive !== 6) {
  console.error(
    `Process Safety & Economics live count is ${categoryLive}, expected 6.`,
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

const categoryBlock =
  categories.match(
    /\{[^{}]*name:\s*"Process Safety & Economics"[^{}]*\}/s,
  )

if (
  !categoryBlock ||
  !/\blive:\s*6\b/.test(
    categoryBlock[0],
  ) ||
  !/\btotal:\s*40\b/.test(
    categoryBlock[0],
  )
) {
  console.error(
    'Process Safety & Economics category is not 6 / 40.',
  )
  process.exit(1)
}

const workbench =
  fs.readFileSync(
    path.join(
      root,
      'src/components/CalculatorWorkbench.tsx',
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
  'Process Safety & Economics Batch 01 native migration PASS',
)
console.log(
  '380 total / 294 live / 86 queued',
)
console.log(
  'Process Safety & Economics: 6 live / 40 total',
)
