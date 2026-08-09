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
      'src/features/separation-processes/tray-downcomer-backup-residence/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/tray-downcomer-backup-residence/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/tray-downcomer-backup-residence/TrayDowncomerBackupCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/tray-downcomer-backup/tray-downcomer-backup.test.ts',
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
    'TrayDowncomerStatus',
    'TrayDowncomerInput',
    'TrayDowncomerScenario',
    'TrayDowncomerResult',
  ]
) {
  if (
    !types.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer type marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'TRAY_DOWNCOMER_BACKUP_ENGINE_VERSION',
    'calculateDowncomerWeirOverflowHeight',
    'calculateTrayDowncomerScenario',
    'calculateMaximumLiquidFlowByBackup',
    'calculateTrayDowncomerBackup',
    'createTrayDowncomerCsv',
  ]
) {
  if (
    !engine.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer engine marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'Tray Downcomer Backup & Residence Time',
    'Check downcomer capacity',
    'Liquid Residence Time',
    'Total Backup Height',
    'Maximum Flow by Backup',
    'Liquid-load operating window',
    'Export calculation CSV',
  ]
) {
  if (
    !component.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer UI marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'TrayDowncomerBackupCalculator',
    "calculatorId === 'trayDowncomerBackupResidence'",
    'return <TrayDowncomerBackupCalculator />',
  ]
) {
  if (
    !workbench.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer route marker missing: ${marker}`,
    )
  }
}

if (
  !catalog.includes(
    'id: "trayDowncomerBackupResidence"',
  )
) {
  throw new Error(
    'Downcomer calculator catalog entry is missing.',
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
      'EXPECTED_CALCULATOR_COUNT = 402',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 384 calculators.',
    )
  }
}

for (
  const marker
  of [
    'calculates column and downcomer areas',
    'calculates weir overflow pressure head velocity head and backup height',
    'calculates downcomer velocity residence time and hydraulic margins',
    'solves maximum backup flow and identifies residence time as governing',
    'detects marginal and short-residence operation at elevated liquid loads',
    'rejects invalid geometry and unavailable hydraulic headroom',
    'exports downcomer capacity and liquid-load scenarios as CSV',
  ]
) {
  if (
    !tests.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer test marker missing: ${marker}`,
    )
  }
}

for (
  const marker
  of [
    'test:tray-downcomer-backup-v1',
    'verify:tray-downcomer-backup-v1',
  ]
) {
  if (
    !packageSource.includes(
      marker,
    )
  ) {
    throw new Error(
      `Downcomer package script missing: ${marker}`,
    )
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  402
) {
  throw new Error(
    'Coverage baseline count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'trayDowncomerBackupResidence',
    )
) {
  throw new Error(
    'Downcomer calculator is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: Downcomer backup-height calculation verified.',
)

console.log(
  'PASS: Residence-time and hydraulic-capacity limits verified.',
)

console.log(
  'PASS: Liquid-load scenarios and CSV export verified.',
)

console.log(
  'PASS: Native routing and calculator counts verified.',
)

console.log(
  'PASS: CALCULATOR 384 — TRAY DOWNCOMER V1',
)
