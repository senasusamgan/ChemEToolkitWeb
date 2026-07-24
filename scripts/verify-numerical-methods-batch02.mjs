import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const ids = [
  'crankNicolsonHeatEquation',
  'cubicHermiteInterpolation',
  'curveFitting',
  'gaussNewtonNonlinearRegression',
  'gradientDescentOptimization',
  'highOrderFiniteDifference',
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

if (entries.length !== 380 || live !== 242) {
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
  !/name:\s*"Numerical Methods"[^{}]*total:\s*40[^{}]*live:\s*22/s.test(
    categories,
  )
) {
  console.error(
    'Numerical Methods count is not 22 / 40.',
  )
  process.exit(1)
}

console.log('Numerical Methods Batch 02 verification PASS')
console.log('380 total / 242 live / 138 queued')
console.log('Numerical Methods: 22 live / 40 total')
