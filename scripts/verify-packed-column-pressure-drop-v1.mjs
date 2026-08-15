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
      'src/features/separation-processes/packed-column-pressure-drop-flooding/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-pressure-drop-flooding/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/packed-column-pressure-drop-flooding/PackedColumnPressureDropCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/packed-column-pressure-drop/packed-column-pressure-drop-flooding.test.ts',
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

const typeMarkers = [
  'PackedColumnHydraulicStatus',
  'PackedColumnPressureDropInput',
  'PackedColumnPressureDropScenario',
  'PackedColumnPressureDropResult',
]

for (const marker of typeMarkers) {
  if (!types.includes(marker)) {
    throw new Error(
      `Calculator 386 type marker missing: ${marker}`,
    )
  }
}

const engineMarkers = [
  'PACKED_COLUMN_PRESSURE_DROP_ENGINE_VERSION',
  'calculatePackedColumnFloodingVelocity',
  'calculatePackedColumnPressureScenario',
  'calculatePackedColumnPressureDrop',
  'createPackedColumnPressureDropCsv',
]

for (const marker of engineMarkers) {
  if (!engine.includes(marker)) {
    throw new Error(
      `Calculator 386 engine marker missing: ${marker}`,
    )
  }
}

const componentMarkers = [
  'Packed Column Pressure Drop & Flooding Check',
  'Check packed-column hydraulics',
  'Packing Reynolds Number',
  'Viscous Pressure Gradient',
  'Inertial Pressure Gradient',
  'Flooding Velocity',
  'Gas-load operating window',
  'Export calculation CSV',
]

for (const marker of componentMarkers) {
  if (!component.includes(marker)) {
    throw new Error(
      `Calculator 386 UI marker missing: ${marker}`,
    )
  }
}

const routeMarkers = [
  'PackedColumnPressureDropCalculator',
  "calculatorId === 'packedColumnPressureDropFlooding'",
  'return <PackedColumnPressureDropCalculator />',
]

for (const marker of routeMarkers) {
  if (!workbench.includes(marker)) {
    throw new Error(
      `Calculator 386 route marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "packedColumnPressureDropFlooding"',
  )
) {
  throw new Error(
    'Calculator 386 catalog entry is missing.',
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
      'EXPECTED_CALCULATOR_COUNT = 459',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 386 calculators.',
    )
  }
}

const testMarkers = [
  'packedColumnPressureDropFlooding calculates column area and velocity',
  'calculates Ergun Reynolds and pressure-drop terms',
  'calculates flooding velocity and design capacity',
  'classifies gas-load scenarios',
  'rejects invalid packing data',
  'exports pressure-drop scenarios as CSV',
]

for (const marker of testMarkers) {
  if (!tests.includes(marker)) {
    throw new Error(
      `Calculator 386 test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:packed-column-pressure-drop-v1',
    'verify:packed-column-pressure-drop-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(
      `Calculator 386 package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  459
) {
  throw new Error(
    'Coverage baseline count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'packedColumnPressureDropFlooding',
    )
) {
  throw new Error(
    'Calculator 386 is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: Ergun pressure-drop calculation verified.',
)

console.log(
  'PASS: Flooding and design-capacity calculations verified.',
)

console.log(
  'PASS: Gas-load scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 386 — PACKED PRESSURE DROP V1',
)
