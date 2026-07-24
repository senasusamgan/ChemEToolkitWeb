import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'src/features/mass-transfer/single-stage-leaching-recovery/engine.ts',
  'src/features/mass-transfer/single-stage-liquid-liquid-extraction/engine.ts',
  'src/features/mass-transfer/ultrafiltration-concentration-polarization/engine.ts',
  'tests/batch04/single-stage-leaching-recovery.test.ts',
  'tests/batch04/single-stage-liquid-liquid-extraction.test.ts',
  'tests/batch04/ultrafiltration-concentration-polarization.test.ts',
]

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const catalogPath = path.join(
  root,
  'src/data/calculators.ts',
)
const catalog = fs.readFileSync(catalogPath, 'utf8')

const entries = [
  ...catalog.matchAll(
    /\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g,
  ),
]

const liveCount = entries.filter(
  (entry) => entry[4] === 'true',
).length

if (entries.length !== 380 || liveCount !== 201) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${liveCount} live`,
  )
  process.exit(1)
}

for (const calculatorId of [
  'singleStageLeachingRecovery',
  'singleStageLiquidLiquidExtraction',
  'ultrafiltrationConcentrationPolarization',
]) {
  const pattern = new RegExp(
    `id: "${calculatorId}".*available: true`,
  )

  if (!pattern.test(catalog)) {
    console.error(
      `Calculator is not live: ${calculatorId}`,
    )
    process.exit(1)
  }
}

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)

if (
  !/name: "Mass Transfer", icon: "⠿", total: 45, live: 45/.test(
    categories,
  )
) {
  console.error(
    'Mass Transfer category count is not 45 / 45.',
  )
  process.exit(1)
}

console.log('Batch 04 verification PASS')
console.log('380 total / 201 live / 179 queued')
console.log(
  'Mass Transfer: 45 live / 45 total — COMPLETE',
)
