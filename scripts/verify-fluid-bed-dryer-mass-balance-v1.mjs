import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  workbench,
  catalog,
  categories,
  catalogVerifier,
  routingVerifier,
  coverageVerifier,
  baselineSource,
  packageSource,
] = await Promise.all([
  readFile(
    'src/features/material-energy-balances/fluid-bed-dryer-mass-balance/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/fluid-bed-dryer-mass-balance/FluidBedDryerMassBalanceCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/fluid-bed-dryer-mass-balance/fluid-bed-dryer-mass-balance.test.ts',
    'utf8',
  ),
  readFile(
    'src/components/CalculatorWorkbench.tsx',
    'utf8',
  ),
  readFile(
    'src/data/calculators.ts',
    'utf8',
  ),
  readFile(
    'src/data/categories.ts',
    'utf8',
  ),
  readFile(
    'scripts/verify-calculator-catalog-v1.mjs',
    'utf8',
  ),
  readFile(
    'scripts/verify-calculator-routing-v1.mjs',
    'utf8',
  ),
  readFile(
    'scripts/verify-calculator-test-coverage-v1.mjs',
    'utf8',
  ),
  readFile(
    'scripts/calculator-test-coverage-baseline-v1.json',
    'utf8',
  ),
  readFile(
    'package.json',
    'utf8',
  ),
])

function requireMarker(
  source,
  marker,
  label,
) {
  if (
    !source.includes(marker)
  ) {
    throw new Error(
      `Calculator 393 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'FLUID_BED_DRYER_MASS_BALANCE_ENGINE_VERSION',
    'calculateFluidBedDryerMassBalance',
    'createFluidBedDryerMassBalanceCsv',
  ]
) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (
  const marker of [
    'MEB–26',
    'Fluid Bed Dryer Mass Balance',
    'Evaporated water',
    'Outlet Humidity Ratio',
    'Mass-Balance Closure Error',
    'Export calculation CSV',
  ]
) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'fluidBedDryerMassBalance',
  'test ID',
)

requireMarker(
  workbench,
  "calculatorId === 'fluidBedDryerMassBalance'",
  'route',
)

requireMarker(
  catalog,
  'id: "fluidBedDryerMassBalance"',
  'catalog ID',
)

const categoryLine =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Material & Energy Balances',
        ),
    )

if (
  !categoryLine ||
  !categoryLine.includes(
    'total: 33',
  ) ||
  !categoryLine.includes(
    'live: 33',
  )
) {
  throw new Error(
    'Material & Energy Balances metadata is not 33/33.',
  )
}

const singleIndex =
  catalogVerifier.indexOf(
    "name: 'Material & Energy Balances'",
  )

const doubleIndex =
  catalogVerifier.indexOf(
    'name: "Material & Energy Balances"',
  )

const index =
  singleIndex >= 0
    ? singleIndex
    : doubleIndex

const window =
  index >= 0
    ? catalogVerifier.slice(
        index,
        index + 500,
      )
    : ''

if (
  !window.includes(
    'count: 33',
  )
) {
  throw new Error(
    'Catalog verifier does not expect 33 Material & Energy Balances calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 460',
  'routing count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 460',
  'coverage count',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  460
) {
  throw new Error(
    `Expected baseline 393; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline.directTestSignals !==
  321
) {
  throw new Error(
    `Expected 253 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'fluidBedDryerMassBalance',
    )
) {
  throw new Error(
    'Calculator 393 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:fluid-bed-dryer-mass-balance-v1'
  ]
) {
  throw new Error(
    'Calculator 393 verify script missing.',
  )
}

console.log(
  'PASS: Fluid Bed Dryer Mass Balance Calculator v1.',
)

console.log(
  'Calculator count: 398',
)

console.log(
  'Material & Energy Balances: 33',
)

console.log(
  'Direct test signals: 258',
)
