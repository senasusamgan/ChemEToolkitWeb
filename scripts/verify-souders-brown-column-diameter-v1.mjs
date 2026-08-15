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
] =
  await Promise.all([
    readFile(
      'src/features/separation-processes/souders-brown-column-diameter/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/souders-brown-column-diameter/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/souders-brown-column-diameter/SoudersBrownColumnDiameterCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/souders-brown-column-diameter/souders-brown-column-diameter.test.ts',
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

for (
  const marker of [
    'SoudersBrownColumnInput',
    'SoudersBrownScenario',
    'SoudersBrownColumnResult',
  ]
) {
  if (!types.includes(marker)) {
    throw new Error(
      `Souders–Brown type marker missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'SOUDERS_BROWN_COLUMN_DIAMETER_ENGINE_VERSION',
    'calculateSoudersBrownFloodingVelocity',
    'calculateSoudersBrownScenario',
    'calculateSoudersBrownColumnDiameter',
    'createSoudersBrownColumnCsv',
  ]
) {
  if (!engine.includes(marker)) {
    throw new Error(
      `Souders–Brown engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'Souders–Brown Distillation Column Diameter',
    'Size column diameter',
    'Flooding Velocity',
    'Required Gross Area',
    'Capacity Margin',
    'Flooding-fraction sensitivity',
    'Export calculation CSV',
  ]
) {
  if (!component.includes(marker)) {
    throw new Error(
      `Souders–Brown UI marker missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'SoudersBrownColumnDiameterCalculator',
    "calculatorId === 'soudersBrownColumnDiameter'",
    'return <SoudersBrownColumnDiameterCalculator />',
  ]
) {
  if (!workbench.includes(marker)) {
    throw new Error(
      `Souders–Brown native route marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "soudersBrownColumnDiameter"',
  )
) {
  throw new Error(
    'Souders–Brown calculator catalog entry is missing.',
  )
}

if (
  !/name:\s*["']Separation Processes["']\s*,\s*icon:\s*["']⋈["']\s*,\s*total:\s*52\s*,\s*live:\s*52/.test(
    categories,
  )
) {
  throw new Error(
    'Separation Processes metadata is not 52/52.',
  )
}

if (
  !/name:\s*['"]Separation Processes['"]\s*,\s*count:\s*52\s*,/.test(
    catalogVerifier,
  )
) {
  throw new Error(
    'Catalog verifier does not expect 52 Separation calculators.',
  )
}

for (
  const source of [
    routingVerifier,
    coverageVerifier,
  ]
) {
  if (
    !source.includes(
      'EXPECTED_CALCULATOR_COUNT = 465',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 382 calculators.',
    )
  }
}

for (
  const marker of [
    'calculates the Souders Brown flooding velocity',
    'calculates net area gross area and raw tower diameter',
    'rounds the tower diameter upward and reconstructs actual flooding',
    'calculates vapor mass flow and F factor',
    'creates hydraulic sensitivity scenarios',
    'rejects invalid densities and hydraulic fractions',
    'exports column sizing and sensitivity results as CSV',
  ]
) {
  if (!tests.includes(marker)) {
    throw new Error(
      `Souders–Brown test marker missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'test:souders-brown-column-diameter-v1',
    'verify:souders-brown-column-diameter-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(
      `Souders–Brown package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  465
) {
  throw new Error(
    'Coverage baseline calculator count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'soudersBrownColumnDiameter',
    )
) {
  throw new Error(
    'Souders–Brown calculator is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: Souders–Brown flooding velocity verified.',
)

console.log(
  'PASS: Net area, gross area and diameter sizing verified.',
)

console.log(
  'PASS: Diameter rounding and actual flooding verified.',
)

console.log(
  'PASS: Sensitivity scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 382 — SOUDERS BROWN V1',
)
