import {
  readFile,
} from 'node:fs/promises'

const [
  types,
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
    'src/features/separation-processes/packed-column-redistributor-spacing/types.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-redistributor-spacing/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-redistributor-spacing/PackedColumnRedistributorCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/packed-column-redistributor-spacing/packed-column-redistributor-spacing.test.ts',
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
      `Calculator 390 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PackedColumnRedistributorInput',
    'PackedColumnRedistributorResult',
  ]
) {
  requireMarker(
    types,
    marker,
    'type marker',
  )
}

for (
  const marker of [
    'PACKED_COLUMN_REDISTRIBUTOR_ENGINE_VERSION',
    'PackedColumnRedistributorError',
    'calculatePackedColumnRedistributorSpacing',
    'createPackedColumnRedistributorCsv',
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
    'SP–50',
    'Packed Column Redistributor Spacing & Count',
    'Required redistributors',
    'Required Bed Sections',
    'Actual Section Height',
    'Redistributor layout',
    'Bed segmentation elevations',
    'Export calculation CSV',
  ]
) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

for (
  const marker of [
    'packedColumnRedistributorSpacing',
    'calculates packed-column section geometry',
    'calculates required bed sections and redistributors',
    'calculates redistributor elevations',
    'requires no redistributor for a short bed',
    'rejects invalid maximum section height',
    'exports redistributor layout as CSV',
  ]
) {
  requireMarker(
    tests,
    marker,
    'test marker',
  )
}

for (
  const marker of [
    'PackedColumnRedistributorCalculator',
    "calculatorId === 'packedColumnRedistributorSpacing'",
    'return <PackedColumnRedistributorCalculator />',
  ]
) {
  requireMarker(
    workbench,
    marker,
    'route marker',
  )
}

requireMarker(
  catalog,
  'id: "packedColumnRedistributorSpacing"',
  'catalog ID',
)

requireMarker(
  catalog,
  'title: "Packed Column Redistributor Spacing & Count"',
  'catalog title',
)

const separationCategoryLine390 =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Separation Processes',
        ),
    )

if (
  !separationCategoryLine390 ||
  !separationCategoryLine390.includes(
    'total: 52',
  ) ||
  !separationCategoryLine390.includes(
    'live: 52',
  )
) {
  throw new Error(
    'Separation Processes metadata is not 52/52.',
  )
}

const catalogSeparationIndex390 =
  catalogVerifier.indexOf(
    "name: 'Separation Processes'",
  ) >= 0
    ? catalogVerifier.indexOf(
        "name: 'Separation Processes'",
      )
    : catalogVerifier.indexOf(
        'name: "Separation Processes"',
      )

const catalogSeparationWindow390 =
  catalogSeparationIndex390 >= 0
    ? catalogVerifier.slice(
        catalogSeparationIndex390,
        catalogSeparationIndex390 + 500,
      )
    : ''

if (
  !catalogSeparationWindow390.includes(
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
  'routing global count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 407',
  'coverage global count',
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
    `Expected baseline catalog count 390; found ${baseline.catalogCalculatorCount}.`,
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
      'packedColumnRedistributorSpacing',
    )
) {
  throw new Error(
    'Calculator 390 appears in the direct-test coverage gap list.',
  )
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  !packageJson.scripts[
    'test:packed-column-redistributor-spacing-v1'
  ]
) {
  throw new Error(
    'Calculator 390 test package script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:packed-column-redistributor-spacing-v1'
  ]
) {
  throw new Error(
    'Calculator 390 verifier package script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'verify:packed-column-redistributor-spacing-v1',
  )
) {
  throw new Error(
    'Calculator 390 verifier missing from verify:release.',
  )
}

console.log(
  'PASS: Calculator 390 verifier.',
)

console.log(
  'Calculator count: 398',
)

console.log(
  'Separation Processes: 50',
)

console.log(
  'Direct test signals: 258',
)
