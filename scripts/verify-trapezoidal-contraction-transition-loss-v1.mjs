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
    'src/features/fluid-mechanics/trapezoidal-contraction-transition-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-contraction-transition-loss/TrapezoidalContractionTransitionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-contraction-transition-loss/trapezoidal-contraction-transition-loss.test.ts',
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
  if (
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Calculator 441 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CONTRACTION_TRANSITION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalContractionTransitionLoss',
    'calculateTrapezoidalContractionThroatAnalysis',
    'lossAdjustedMinimumContractedBottomWidth',
    'lossAdjustedControlFroudeNumber',
    'controlTransitionLossHead',
    'subcriticalTransitionLossHead',
    'controlConditionResidual',
    'createTrapezoidalContractionTransitionLossCsv',
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
    'FM–58',
    'Trapezoidal Contraction with Transition Loss',
    'Loss-Adjusted Minimum Width',
    'Loss Penalty Width',
    'Control Transition-Loss Head',
    'Subcritical Transition-Loss Head',
    'Control-Condition Residual',
    'Export calculation CSV',
  ]
) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'trapezoidalContractionTransitionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'zero transition-loss coefficient recovers Calculator 440',
  'lossless closure test',
)

requireMarker(
  tests,
  'transition loss widens the minimum safe contraction throat',
  'width-penalty test',
)

requireMarker(
  tests,
  'width below the loss-adjusted limit is reported as choked',
  'choking test',
)

requireMarker(
  tests,
  'both loss-adjusted depth roots close the upstream energy equation',
  'energy closure test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalContractionTransitionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalContractionTransitionLoss"',
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
      'trapezoidalContractionTransitionLoss',
    )
) {
  throw new Error(
    'Calculator 441 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-contraction-transition-loss-v1',
    'verify:trapezoidal-contraction-transition-loss-v1',
    'sync:verified-calculator-copy',
    'verify:verified-calculator-copy',
  ]
) {
  if (
    !pkg.scripts[
      scriptName
    ]
  ) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:trapezoidal-contraction-transition-loss-v1',
  )
) {
  throw new Error(
    'Calculator 441 is not in verify:release.',
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
  'PASS: Calculator 441 verifier.',
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
