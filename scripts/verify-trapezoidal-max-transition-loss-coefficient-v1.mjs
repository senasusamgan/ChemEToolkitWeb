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
    'src/features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/TrapezoidalMaximumTransitionLossCoefficientCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-transition-loss-coefficient/trapezoidal-max-transition-loss-coefficient.test.ts',
    'utf8',
  ),
  readFile(
    'scripts/calculator-routing-contract-v1.txt',
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
      `Calculator 442 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MAXIMUM_TRANSITION_LOSS_COEFFICIENT_ENGINE_VERSION',
    'calculateTrapezoidalMaximumTransitionLossCoefficient',
    'calculateTrapezoidalMaximumDischargeSpecificEnergy',
    'calculateTrapezoidalContractionTransitionLoss',
    'maximumAllowableTransitionLossCoefficient',
    'maximumAllowableTransitionLossHead',
    'forwardWidthClosureResidual',
    'controlConditionResidual',
    'createTrapezoidalMaximumTransitionLossCoefficientCsv',
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
    'FM–59',
    'Maximum Allowable Transition Loss Before Choking',
    'Maximum allowable transition-loss coefficient',
    'Maximum Allowable Loss Head',
    'Lossless Flow-Capacity Margin',
    'Loss-Adjusted Control Froude',
    'Forward Width Closure Residual',
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
  'trapezoidalMaximumTransitionLossCoefficient',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 441 forward model closes to the specified contraction width',
  'forward closure test',
)

requireMarker(
  tests,
  'wider contracted section can tolerate a larger transition-loss coefficient',
  'design trend test',
)

requireMarker(
  tests,
  'rejects a contraction already choked with zero transition loss',
  'lossless choking test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumTransitionLossCoefficient'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumTransitionLossCoefficient"',
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
      'trapezoidalMaximumTransitionLossCoefficient',
    )
) {
  throw new Error(
    'Calculator 442 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-max-transition-loss-coefficient-v1',
    'verify:trapezoidal-max-transition-loss-coefficient-v1',
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
    'verify:trapezoidal-max-transition-loss-coefficient-v1',
  )
) {
  throw new Error(
    'Calculator 442 is not in verify:release.',
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
  'PASS: Calculator 442 verifier.',
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
