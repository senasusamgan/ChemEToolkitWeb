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
    'src/features/separation-processes/packed-column-liquid-distributor-irrigation/types.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-liquid-distributor-irrigation/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/packed-column-liquid-distributor-irrigation/PackedColumnLiquidDistributorCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/packed-column-liquid-distributor-irrigation/packed-column-liquid-distributor-irrigation.test.ts',
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
      `Calculator 388 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PackedColumnDistributorStatus',
    'PackedColumnLiquidDistributorInput',
    'PackedColumnLiquidDistributorScenario',
    'PackedColumnLiquidDistributorResult',
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
    'PACKED_COLUMN_LIQUID_DISTRIBUTOR_ENGINE_VERSION',
    'calculatePackedColumnDistributorScenario',
    'calculatePackedColumnLiquidDistributor',
    'createPackedColumnLiquidDistributorCsv',
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
    'Packed Column Liquid Distributor & Irrigation Density',
    'Liquid irrigation density',
    'Distributor Point Density',
    'Equivalent Square Pitch',
    'Minimum Distributor Point Count',
    'Liquid-distributor turndown',
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
    'packedColumnLiquidDistributorIrrigation',
    'calculates distributor coverage geometry',
    'calculates irrigation density liquid load and flow per distributor point',
    'calculates irrigation and distributor design minimums',
    'classifies liquid irrigation turndown scenarios',
    'rejects a noninteger distributor point count',
    'exports liquid distributor screening results as CSV',
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
    'PackedColumnLiquidDistributorCalculator',
    "calculatorId === 'packedColumnLiquidDistributorIrrigation'",
    'return <PackedColumnLiquidDistributorCalculator />',
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
  'id: "packedColumnLiquidDistributorIrrigation"',
  'catalog ID',
)

requireMarker(
  catalog,
  'title: "Packed Column Liquid Distributor & Irrigation Density"',
  'catalog title',
)

if (
  !/name:\s*"Separation Processes"[\s\S]*?total:\s*52\s*,\s*live:\s*52/.test(
    categories,
  )
) {
  throw new Error(
    'Calculator 388 category metadata is not 52/52.',
  )
}

if (
  !/name:\s*['"]Separation Processes['"]\s*,\s*count:\s*52\s*,/.test(
    catalogVerifier,
  )
) {
  throw new Error(
    'Calculator catalog verifier does not expect 52 Separation calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 403',
  'routing count contract',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 403',
  'coverage count contract',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  403
) {
  throw new Error(
    `Calculator 388 baseline catalog count is ${baseline.catalogCalculatorCount}; expected 388.`,
  )
}

if (
  baseline.directTestSignals !==
  263
) {
  throw new Error(
    `Calculator 388 expected 247 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline.calculatorIdsWithoutDirectTestSignal.includes(
    'packedColumnLiquidDistributorIrrigation',
  )
) {
  throw new Error(
    'Calculator 388 is incorrectly listed as lacking a direct test signal.',
  )
}

const packageJson =
  JSON.parse(
    packageSource,
  )

const testScript =
  packageJson.scripts[
    'test:packed-column-liquid-distributor-irrigation-v1'
  ]

const verifyScript =
  packageJson.scripts[
    'verify:packed-column-liquid-distributor-irrigation-v1'
  ]

if (
  !testScript ||
  !testScript.includes(
    'tests/packed-column-liquid-distributor-irrigation',
  )
) {
  throw new Error(
    'Calculator 388 package test script is missing.',
  )
}

if (
  !verifyScript ||
  !verifyScript.includes(
    'verify-packed-column-liquid-distributor-irrigation-v1.mjs',
  )
) {
  throw new Error(
    'Calculator 388 package verifier script is missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'verify:packed-column-liquid-distributor-irrigation-v1',
  )
) {
  throw new Error(
    'Calculator 388 verifier is not included in verify:release.',
  )
}

console.log(
  'PASS: Calculator 388 verifier.',
)
console.log(
  'Calculator count: 398',
)
console.log(
  'Separation Processes: 48',
)
console.log(
  'Direct test signals: 258',
)
