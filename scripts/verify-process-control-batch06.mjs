import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'temperatureProcessDynamics',
  'transferFunctionBuilder',
  'valveCharacteristics',
  'zieglerNicholsUltimateGainTuning',
]

const catalog = fs.readFileSync(
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
      'Process Control' ||
    entry[4] !== 'true'
  ) {
    console.error(
      `Process Control module is not live: ${id}`,
    )
    process.exit(1)
  }
}

const processControlLive =
  liveEntries.filter(
    (entry) =>
      entry[3] ===
      'Process Control',
  ).length

if (processControlLive !== 40) {
  console.error(
    `Process Control live count is ${processControlLive}, expected 40.`,
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
    /\{[^{}]*name:\s*"Process Control"[^{}]*\}/s,
  )

if (
  !categoryBlock ||
  !/\blive:\s*40\b/.test(
    categoryBlock[0],
  ) ||
  !/\btotal:\s*40\b/.test(
    categoryBlock[0],
  )
) {
  console.error(
    'Process Control category is not 40 / 40.',
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
  'Process Control Batch 06 Final verification PASS',
)
console.log(
  '380 total / 294 live / 86 queued',
)
console.log(
  'Process Control: 40 live / 40 total — COMPLETE',
)
