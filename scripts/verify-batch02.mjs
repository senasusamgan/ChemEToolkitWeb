import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'src/features/mass-transfer/distillation-operating-lines/engine.ts',
  'src/features/mass-transfer/mccabe-thiele-method/engine.ts',
  'src/features/mass-transfer/humidification-psychrometrics/engine.ts',
  'src/features/mass-transfer/ion-exchange-bed-sizing/engine.ts',
  'tests/batch02/distillation-operating-lines.test.ts',
  'tests/batch02/mccabe-thiele-method.test.ts',
  'tests/batch02/humidification-psychrometrics.test.ts',
  'tests/batch02/ion-exchange-bed-sizing.test.ts',
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
const live = entries.filter((entry) => entry[4] === 'true').length

if (entries.length !== 380 || live !== 194) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${live} live`,
  )
  process.exit(1)
}

const requiredIds = [
  'distillationOperatingLines',
  'mcCabeThieleMethod',
  'humidificationPsychrometrics',
  'ionExchangeBedSizing',
]

for (const calculatorId of requiredIds) {
  const pattern = new RegExp(
    `id: "${calculatorId}".*available: true`,
  )

  if (!pattern.test(catalog)) {
    console.error(`Calculator is not live: ${calculatorId}`)
    process.exit(1)
  }
}

const categories = fs.readFileSync(
  path.join(root, 'src/data/categories.ts'),
  'utf8',
)

if (
  !/name: "Mass Transfer", icon: "⠿", total: 45, live: 38/.test(
    categories,
  )
) {
  console.error('Mass Transfer category count is not 38 / 45.')
  process.exit(1)
}

console.log('Batch 02 verification PASS')
console.log('380 total / 194 live / 186 queued')
console.log('Mass Transfer: 38 live / 45 total')
