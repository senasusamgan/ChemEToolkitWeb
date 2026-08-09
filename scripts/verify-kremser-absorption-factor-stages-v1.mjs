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
    'src/features/separation-processes/kremser-absorption-factor-stages/types.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/kremser-absorption-factor-stages/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/separation-processes/kremser-absorption-factor-stages/KremserAbsorptionCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/kremser-absorption-factor-stages/kremser-absorption-factor-stages.test.ts',
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
      `Calculator 391 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'KremserAbsorptionInput',
    'KremserAbsorptionRegime',
    'KremserAbsorptionResult',
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
    'KREMSER_ABSORPTION_ENGINE_VERSION',
    'KremserAbsorptionError',
    'calculateKremserAbsorption',
    'createKremserAbsorptionCsv',
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
    'SP–51',
    'Kremser Absorption Factor & Ideal Stages',
    'Required ideal stages',
    'Exact Ideal Stage Requirement',
    'Predicted Outlet Mole Fraction',
    'Kremser stage screening',
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
    'kremserAbsorptionFactorStages',
    'calculates Kremser continuous and integer ideal-stage requirement',
    'predicts outlet composition after integer stage rounding',
    'uses the unity absorption-factor limit',
    'rejects an unattainable target when absorption factor is below unity',
    'exports Kremser absorption results as CSV',
  ]
) {
  requireMarker(
    tests,
    marker,
    'test marker',
  )
}

requireMarker(
  workbench,
  "calculatorId === 'kremserAbsorptionFactorStages'",
  'route marker',
)

requireMarker(
  workbench,
  'return <KremserAbsorptionCalculator />',
  'route component',
)

requireMarker(
  catalog,
  'id: "kremserAbsorptionFactorStages"',
  'catalog ID',
)

const separationLine391 =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Separation Processes',
        ),
    )

if (
  !separationLine391 ||
  !separationLine391.includes(
    'total: 52',
  ) ||
  !separationLine391.includes(
    'live: 52',
  )
) {
  throw new Error(
    'Separation Processes metadata is not 52/52.',
  )
}

const singleQuoteIndex391 =
  catalogVerifier.indexOf(
    "name: 'Separation Processes'",
  )

const doubleQuoteIndex391 =
  catalogVerifier.indexOf(
    'name: "Separation Processes"',
  )

const catalogIndex391 =
  singleQuoteIndex391 >= 0
    ? singleQuoteIndex391
    : doubleQuoteIndex391

const catalogWindow391 =
  catalogIndex391 >= 0
    ? catalogVerifier.slice(
        catalogIndex391,
        catalogIndex391 + 500,
      )
    : ''

if (
  !catalogWindow391.includes(
    'count: 52',
  )
) {
  throw new Error(
    'Catalog verifier does not expect 52 Separation calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 392',
  'routing count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 392',
  'coverage count',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  392
) {
  throw new Error(
    `Expected baseline count 391; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline.directTestSignals !==
  251
) {
  throw new Error(
    `Expected 251 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'kremserAbsorptionFactorStages',
    )
) {
  throw new Error(
    'Calculator 391 appears in direct-test gap list.',
  )
}

const packageJson =
  JSON.parse(
    packageSource,
  )

if (
  !packageJson.scripts[
    'test:kremser-absorption-factor-stages-v1'
  ]
) {
  throw new Error(
    'Calculator 391 test script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:kremser-absorption-factor-stages-v1'
  ]
) {
  throw new Error(
    'Calculator 391 verifier script missing.',
  )
}

if (
  !packageJson.scripts[
    'verify:release'
  ].includes(
    'verify:kremser-absorption-factor-stages-v1',
  )
) {
  throw new Error(
    'Calculator 391 verifier missing from verify:release.',
  )
}

console.log(
  'PASS: Calculator 391 verifier.',
)

console.log(
  'Calculator count: 391',
)

console.log(
  'Separation Processes: 51',
)

console.log(
  'Direct test signals: 251',
)
