import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'inversePowerMethodEigenvalue',
  'laplaceEquationFiniteDifference',
  'levenbergMarquardtRegression',
  'luDecompositionSolver',
  'methodOfLinesPDESolver',
  'monteCarloIntegration',
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

if (entries.length !== 380 || live !== 248) {
  console.error(
    `Catalog mismatch: ${entries.length} total / ${live} live`,
  )
  process.exit(1)
}

for (const id of ids) {
  if (
    !new RegExp(
      `id: "${id}".*category: "Numerical Methods".*available: true`,
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
  !/name:\s*"Numerical Methods"[^{}]*total:\s*40[^{}]*live:\s*28/s.test(
    categories,
  )
) {
  console.error(
    'Numerical Methods count is not 28 / 40.',
  )
  process.exit(1)
}

console.log('Numerical Methods Batch 03 verification PASS')
console.log('380 total / 248 live / 132 queued')
console.log('Numerical Methods: 28 live / 40 total')
