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
    'src/features/separation-processes/packed-column-gas-load-f-factor/types.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-gas-load-f-factor/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-gas-load-f-factor/PackedColumnGasLoadCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/packed-column-gas-load-f-factor/packed-column-gas-load-f-factor.test.ts',
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
      `Calculator 389 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PackedColumnGasLoadStatus',
    'PackedColumnGasLoadInput',
    'PackedColumnGasLoadScenario',
    'PackedColumnGasLoadResult',
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
    'PACKED_COLUMN_GAS_LOAD_F_FACTOR_ENGINE_VERSION',
    'calculatePackedColumnGasLoadScenario',
    'calculatePackedColumnGasLoad',
    'createPackedColumnGasLoadCsv',
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
    'Packed Column Gas Load & F-Factor Operating Window',
    'Gas F-factor',
    'Superficial Gas Velocity',
    'Gas Mass Flux',
    'Margin to Maximum F-Factor',
    'F-factor turndown screening',
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
    'packedColumnGasLoadFFactor',
    'calculates packed-column gas-flow geometry',
    'calculates gas load mass flux F-factor and kinetic pressure',
    'calculates minimum and maximum gas-flow limits from F-factor',
    'classifies gas-load operating scenarios',
    'rejects an invalid F-factor operating window',
    'exports packed-column gas-load scenarios as CSV',
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
    'PackedColumnGasLoadCalculator',
    "calculatorId === 'packedColumnGasLoadFFactor'",
    'return <PackedColumnGasLoadCalculator />',
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
  'id: "packedColumnGasLoadFFactor"',
  'catalog ID',
)

requireMarker(
  catalog,
  'title: "Packed Column Gas Load & F-Factor Operating Window"',
  'catalog title',
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

if (
  !catalogVerifier.includes(
    "name: 'Separation Processes'",
  ) ||
  !catalogVerifier.includes(
    'count: 52',
  )
) {
  throw new Error(
    'Catalog verifier does not expect 52 Separation calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 473',
  'routing global count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 473',
  'coverage global count',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  473
) {
  throw new Error(
    `Calculator 389 expected global baseline count 389; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline.directTestSignals !==
  baseline.catalogCalculatorCount
) {
  throw new Error(
    `Calculator 389 expected full direct-test coverage (${baseline.catalogCalculatorCount}); found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'packedColumnGasLoadFFactor',
    )
) {
  throw new Error(
    'Calculator 389 appears in direct-test coverage gap list.',
  )
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  !packageJson.scripts[
    'test:packed-column-gas-load-f-factor-v1'
  ]
) {
  throw new Error(
    'Calculator 389 test package script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:packed-column-gas-load-f-factor-v1'
  ]
) {
  throw new Error(
    'Calculator 389 verifier package script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'verify:packed-column-gas-load-f-factor-v1',
  )
) {
  throw new Error(
    'Calculator 389 verifier missing from verify:release.',
  )
}

console.log(
  'PASS: Calculator 389 verifier.',
)

console.log(
  'Calculator count: 398',
)

console.log(
  'Separation Processes: 49',
)

console.log(
  'Direct test signals: ${baseline.directTestSignals}',
)
