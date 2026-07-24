import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'src/features/mass-transfer/finite-volume-dialysis/engine.ts',
  'src/features/mass-transfer/msmpr-crystallizer-design/engine.ts',
  'src/features/mass-transfer/packed-column-hydraulics/engine.ts',
  'src/features/mass-transfer/relative-volatility-binary-vle/engine.ts',
  'tests/batch03/finite-volume-dialysis.test.ts',
  'tests/batch03/msmpr-crystallizer-design.test.ts',
  'tests/batch03/packed-column-hydraulics.test.ts',
  'tests/batch03/relative-volatility-binary-vle.test.ts',
]

for (const relativePath of required) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    console.error(`MISSING: ${relativePath}`)
    process.exit(1)
  }
}

const catalog = fs.readFileSync(
  path.join(root, 'src/data/calculators.ts'),
  'utf8',
)

const entries = [
  ...catalog.matchAll(
    /\{ id: "([^"]+)", title: "([^"]+)", category: "([^"]+)", available: (true|false) \}/g,
  ),
]

const live = entries.filter(
  (entry) => entry[4] === 'true',
).length

if (entries.length !== 380 || live !== 198) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${live} live`,
  )
  process.exit(1)
}

const requiredIds = [
  'finiteVolumeDialysis',
  'msmprCrystallizerDesign',
  'packedColumnHydraulics',
  'relativeVolatilityBinaryVLE',
]

for (const calculatorId of requiredIds) {
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
  !/name: "Mass Transfer", icon: "⠿", total: 45, live: 42/.test(
    categories,
  )
) {
  console.error(
    'Mass Transfer category count is not 42 / 45.',
  )
  process.exit(1)
}

console.log('Batch 03 verification PASS')
console.log('380 total / 198 live / 182 queued')
console.log('Mass Transfer: 42 live / 45 total')
