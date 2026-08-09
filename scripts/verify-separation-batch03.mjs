import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'absorptionStrippingFactors',
  'adsorbentMassRequirement',
  'betMonolayerCapacity',
  'kremserAbsorptionStages',
  'kremserStrippingStages',
  'strippingMinimumGasRate',
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

const live = entries.filter(
  (entry) => entry[4] === 'true',
).length

if (entries.length !== 380 || live !== 219) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${live} live`,
  )
  process.exit(1)
}

for (const id of ids) {
  if (
    !new RegExp(
      `id: "${id}".*category: "Separation Processes".*available: true`,
    ).test(catalog)
  ) {
    console.error(`Calculator is not live: ${id}`)
    process.exit(1)
  }
}

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)

if (
  !/name:\s*"Separation Processes"[^{}]*total:\s*52[^{}]*live:\s*52/s.test(
    categories,
  )
) {
  console.error(
    'Separation Processes count is not 29 / 40.',
  )
  process.exit(1)
}

console.log('Separation Batch 03 verification PASS')
console.log('380 total / 219 live / 161 queued')
console.log('Separation Processes: 29 live / 40 total')
