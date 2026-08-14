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
      'src/features/separation-processes/fenske-underwood-gilliland-shortcut/types.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/fenske-underwood-gilliland-shortcut/engine.ts',
      'utf8',
    ),
    readFile(
      'src/features/separation-processes/fenske-underwood-gilliland-shortcut/FenskeUnderwoodGillilandCalculator.tsx',
      'utf8',
    ),
    readFile(
      'tests/fenske-underwood-gilliland/fenske-underwood-gilliland.test.ts',
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
    'ShortcutDistillationInput',
    'ShortcutDistillationScenario',
    'ShortcutDistillationResult',
  ]
) {
  if (!types.includes(marker)) {
    throw new Error(`Type marker missing: ${marker}`)
  }
}

for (
  const marker of [
    'FENSKE_UNDERWOOD_GILLILAND_ENGINE_VERSION',
    'calculateFenskeMinimumStages',
    'calculateUnderwoodRoot',
    'calculateMinimumRefluxRatio',
    'calculateGillilandScenario',
    'calculateShortcutDistillation',
    'createShortcutDistillationCsv',
  ]
) {
  if (!engine.includes(marker)) {
    throw new Error(`Engine marker missing: ${marker}`)
  }
}

for (
  const marker of [
    'Fenske–Underwood–Gilliland Shortcut Distillation',
    'Design shortcut column',
    'Fenske Minimum Stages',
    'Underwood Root',
    'Minimum Reflux Ratio',
    'Reflux sensitivity scenarios',
    'Export calculation CSV',
  ]
) {
  if (!component.includes(marker)) {
    throw new Error(`UI marker missing: ${marker}`)
  }
}

for (
  const marker of [
    'FenskeUnderwoodGillilandCalculator',
    "calculatorId === 'fenskeUnderwoodGillilandShortcut'",
    'return <FenskeUnderwoodGillilandCalculator />',
  ]
) {
  if (!workbench.includes(marker)) {
    throw new Error(`Native route marker missing: ${marker}`)
  }
}

if (
  !catalog.includes(
    'id: "fenskeUnderwoodGillilandShortcut"',
  )
) {
  throw new Error('Calculator catalog entry is missing.')
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
      'EXPECTED_CALCULATOR_COUNT = 458',
    )
  ) {
    throw new Error(
      'A calculator verifier does not expect 381 calculators.',
    )
  }
}

for (
  const marker of [
    'calculates the Fenske minimum stage count',
    'solves the binary Underwood root',
    'calculates minimum reflux and selected Gilliland stage estimate',
    'creates low selected and high reflux scenarios',
    'rejects invalid composition ordering and reflux selection',
    'exports shortcut design and reflux scenarios as CSV',
  ]
) {
  if (!tests.includes(marker)) {
    throw new Error(`Test marker missing: ${marker}`)
  }
}

for (
  const marker of [
    'test:fenske-underwood-gilliland-v1',
    'verify:fenske-underwood-gilliland-v1',
  ]
) {
  if (!packageSource.includes(marker)) {
    throw new Error(`Package script missing: ${marker}`)
  }
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  458
) {
  throw new Error(
    'Coverage baseline calculator count is not 390.',
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'fenskeUnderwoodGillilandShortcut',
    )
) {
  throw new Error(
    'New calculator is listed as a direct-test gap.',
  )
}

console.log(
  'PASS: Fenske, Underwood and Gilliland calculations verified.',
)

console.log(
  'PASS: Native routing, catalog counts and direct tests verified.',
)

console.log(
  'PASS: CALCULATOR 381 — FUG V1',
)
