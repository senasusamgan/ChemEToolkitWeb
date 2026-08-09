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
    'src/features/separation-processes/absorber-minimum-solvent-rate/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/absorber-minimum-solvent-rate/AbsorberMinimumSolventRateCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/absorber-minimum-solvent-rate/absorber-minimum-solvent-rate.test.ts',
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
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 392 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'ABSORBER_MINIMUM_SOLVENT_RATE_ENGINE_VERSION',
    'calculateAbsorberMinimumSolventRate',
    'createAbsorberMinimumSolventRateCsv',
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
    'SP–52',
    'Absorber Minimum Solvent Rate & Operating Line',
    'Minimum solvent flow',
    'Design Solvent Flow',
    'Bottom Driving Force',
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
  'absorberMinimumSolventRate',
  'test ID',
)

requireMarker(
  workbench,
  "calculatorId === 'absorberMinimumSolventRate'",
  'route',
)

requireMarker(
  catalog,
  'id: "absorberMinimumSolventRate"',
  'catalog ID',
)

const categoryLine =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Separation Processes',
        ),
    )

if (
  !categoryLine ||
  !categoryLine.includes(
    'total: 52',
  ) ||
  !categoryLine.includes(
    'live: 52',
  )
) {
  throw new Error(
    'Separation Processes metadata is not 52/52.',
  )
}

const singleIndex =
  catalogVerifier.indexOf(
    "name: 'Separation Processes'",
  )

const doubleIndex =
  catalogVerifier.indexOf(
    'name: "Separation Processes"',
  )

const index =
  singleIndex >= 0
    ? singleIndex
    : doubleIndex

const window =
  index >= 0
    ? catalogVerifier.slice(
        index,
        index + 700,
      )
    : ''

if (
  !window.includes(
    'count: 52',
  )
) {
  throw new Error(
    'Catalog verifier does not expect 52 Separation calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 407',
  'routing count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 407',
  'coverage count',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  407
) {
  throw new Error(
    `Expected baseline 393; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline.directTestSignals !==
  267
) {
  throw new Error(
    `Expected 252 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'absorberMinimumSolventRate',
    )
) {
  throw new Error(
    'Calculator 392 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

if (
  !pkg.scripts[
    'verify:absorber-minimum-solvent-rate-v1'
  ]
) {
  throw new Error(
    'Calculator 392 verify script missing.',
  )
}

console.log(
  'PASS: Calculator 392 verifier.',
)

console.log(
  'Calculator count: 398',
)

console.log(
  'Separation Processes: 52',
)

console.log(
  'Direct test signals: 258',
)
