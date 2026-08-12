import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/trapezoidal-critical-control-width/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-critical-control-width/TrapezoidalCriticalControlWidthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-critical-control-width/trapezoidal-critical-control-width.test.ts',
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
    'package.json',
    'utf8',
  ),
  readFile(
    'scripts/calculator-test-coverage-baseline-v1.json',
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
      `Calculator 435 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CRITICAL_CONTROL_WIDTH_ENGINE_VERSION',
  'calculateTrapezoidalCriticalControlWidth',
  'calculateTrapezoidalMaximumDischargeSpecificEnergy',
  'requiredBottomWidth',
  'zeroBottomWidthCapacity',
  'reconstructedMaximumFlowRate',
  'flowClosureResidual',
  'criticalConditionResidual',
  'createTrapezoidalCriticalControlWidthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–52',
  'Required Trapezoidal Critical-Control Width',
  'Required bottom width',
  'Zero-Width Limiting Capacity',
  'Reconstructed Maximum Flow',
  'Critical Condition Residual',
  'Export calculation CSV',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'trapezoidalCriticalControlWidth',
  'direct test ID',
)

requireMarker(
  tests,
  'forward Calculator 434 capacity closes to requested discharge',
  'forward closure test',
)

requireMarker(
  tests,
  'rectangular limit matches analytical critical-control width',
  'rectangular limit test',
)

requireMarker(
  tests,
  'rejects flow below the triangular zero-bottom-width capacity',
  'triangular-limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalCriticalControlWidth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalCriticalControlWidth"',
  'catalog ID',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'trapezoidalCriticalControlWidth',
    )
) {
  throw new Error(
    'Calculator 435 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-critical-control-width-v1',
  'verify:trapezoidal-critical-control-width-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:trapezoidal-critical-control-width-v1',
  )
) {
  throw new Error(
    'Calculator 435 is not in verify:release.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].endsWith(
    'npm run verify:verified-calculator-copy',
  )
) {
  throw new Error(
    'Visible calculator-count verifier must remain last in verify:release.',
  )
}

console.log(
  'PASS: Calculator 435 verifier.',
)

console.log(
  `Catalog calculators: ${baseline.catalogCalculatorCount}`,
)

console.log(
  `Direct test signals: ${baseline.directTestSignals}`,
)

console.log(
  `Coverage gaps: ${baseline.withoutDirectTestSignal}`,
)
