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
      'src/features/separation-processes/tray-hydraulics-weeping-check/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/tray-hydraulics-weeping-check/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/tray-hydraulics-weeping-check/TrayHydraulicsWeepingCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/tray-hydraulics-weeping/tray-hydraulics-weeping.test.ts',
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

const requiredTypeMarkers = [
  'TrayHydraulicStatus',
  'TrayHydraulicsInput',
  'TrayHydraulicsScenario',
  'TrayHydraulicsResult',
]

for (const marker of requiredTypeMarkers) {
  if (!types.includes(marker)) {
    throw new Error(
      `Tray type marker missing: ${marker}`,
    )
  }
}

const requiredEngineMarkers = [
  'TRAY_HYDRAULICS_WEEPING_ENGINE_VERSION',
  'calculateWeirOverflowHeight',
  'calculateTrayHydraulicsScenario',
  'calculateTrayHydraulics',
  'createTrayHydraulicsCsv',
]

for (const marker of requiredEngineMarkers) {
  if (!engine.includes(marker)) {
    throw new Error(
      `Tray engine marker missing: ${marker}`,
    )
  }
}

const requiredUiMarkers = [
  'Tray Hydraulic Pressure Drop & Weeping Check',
  'Check tray hydraulics',
  'Dry Tray Pressure Drop',
  'Weeping Velocity Ratio',
  'Flooding Level',
  'Vapor-load operating window',
  'Export calculation CSV',
]

for (const marker of requiredUiMarkers) {
  if (!component.includes(marker)) {
    throw new Error(
      `Tray UI marker missing: ${marker}`,
    )
  }
}

const requiredRouteMarkers = [
  'TrayHydraulicsWeepingCalculator',
  "calculatorId === 'trayHydraulicsWeepingCheck'",
  'return <TrayHydraulicsWeepingCalculator />',
]

for (const marker of requiredRouteMarkers) {
  if (!workbench.includes(marker)) {
    throw new Error(
      `Tray route marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "trayHydraulicsWeepingCheck"',
  )
) {
  throw new Error(
    'Tray calculator catalog entry is missing.',
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
      'EXPECTED_CALCULATOR_COUNT = 403',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 383 calculators.',
    )
  }
}

const requiredTestMarkers = [
  'calculates tray gross active and hole areas',
  'calculates Francis weir overflow and clear liquid head',
  'calculates dry liquid-head and total tray pressure drop',
  'calculates weeping and flooding operating margins',
  'detects weeping and marginal operation at reduced vapor loads',
  'rejects invalid tray geometry and densities',
  'exports pressure-drop and operating-window scenarios as CSV',
]

for (const marker of requiredTestMarkers) {
  if (!tests.includes(marker)) {
    throw new Error(
      `Tray test marker missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'test:tray-hydraulics-weeping-v1',
    'verify:tray-hydraulics-weeping-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(
      `Tray package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  403
) {
  throw new Error(
    'Coverage baseline count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'trayHydraulicsWeepingCheck',
    )
) {
  throw new Error(
    'Tray calculator is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: Tray pressure-drop calculation verified.',
)

console.log(
  'PASS: Weeping and flooding checks verified.',
)

console.log(
  'PASS: Vapor-load scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 383 — TRAY HYDRAULICS V1',
)
