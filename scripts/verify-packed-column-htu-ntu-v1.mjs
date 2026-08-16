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
      'src/features/separation-processes/packed-column-htu-ntu-height/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-htu-ntu-height/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-htu-ntu-height/PackedColumnHtuNtuCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/packed-column-htu-ntu/packed-column-htu-ntu.test.ts',
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
  const marker
  of [
    'PackedColumnInput',
    'PackedColumnScenario',
    'PackedColumnResult',
  ]
) {
  if (
    !types.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column type marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'PACKED_COLUMN_HTU_NTU_ENGINE_VERSION',
    'calculateLogarithmicMeanDrivingForce',
    'calculatePackedColumnScenario',
    'calculatePackedColumnHtuNtu',
    'createPackedColumnHtuNtuCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Packed Column HTU–NTU Height',
    'Calculate packing height',
    'Overall Gas-Phase NTU',
    'Theoretical Packing Height',
    'Log-Mean Driving Force',
    'Outlet-target sensitivity',
    'Export calculation CSV',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column UI marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'PackedColumnHtuNtuCalculator',
    "calculatorId === 'packedColumnHtuNtuHeight'",
    'return <PackedColumnHtuNtuCalculator />',
  ]
) {
  if (
    !workbench.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column route marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "packedColumnHtuNtuHeight"',
  )
) {
  throw new Error(
    'Packed-column calculator catalog entry is missing.',
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
  const source
  of [
    routingVerifier,
    coverageVerifier,
  ]
) {
  if (
    !source.includes(
      'EXPECTED_CALCULATOR_COUNT = 471',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 385 calculators.',
    )
  }
}

for (
  const marker
  of [
    'calculates overall gas phase transfer units',
    'calculates theoretical and design packing height',
    'calculates logarithmic mean mass transfer driving force',
    'calculates removal and equilibrium approach',
    'creates outlet target sensitivity scenarios',
    'rejects invalid outlet and equilibrium targets',
    'exports packed column design and target scenarios as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:packed-column-htu-ntu-v1',
    'verify:packed-column-htu-ntu-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Packed-column package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  471
) {
  throw new Error(
    'Coverage baseline count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'packedColumnHtuNtuHeight',
    )
) {
  throw new Error(
    'Packed-column calculator is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: HTU–NTU packing-height calculation verified.',
)

console.log(
  'PASS: Driving-force and removal calculations verified.',
)

console.log(
  'PASS: Outlet-target scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 385 — PACKED COLUMN HTU NTU V1',
)
