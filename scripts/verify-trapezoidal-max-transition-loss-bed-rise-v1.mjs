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
    'src/features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-transition-loss-bed-rise/trapezoidal-max-transition-loss-bed-rise.test.ts',
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
      `Calculator 448 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MAXIMUM_TRANSITION_LOSS_COEFFICIENT_BED_RISE_ENGINE_VERSION',
    'calculateTrapezoidalMaximumTransitionLossCoefficientBedRise',
    'calculateTrapezoidalMaximumDischargeSpecificEnergy',
    'maximumAllowableTransitionLossCoefficient',
    'availableThroatSpecificEnergy',
    'maximumAllowableTransitionLossHead',
    'totalEnergyClosureResidual',
    'createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv',
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
    'FM–65',
    'Maximum Transition Loss with Bed Rise Before Choking',
    'Maximum allowable transition-loss coefficient',
    'Available Throat Specific Energy',
    'Lossless Flow-Capacity Margin',
    'Loss-Adjusted Control Froude',
    'Combined Bed-Rise + Loss Power',
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
  'trapezoidalMaximumTransitionLossCoefficientBedRise',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 445 forward model recovers the specified bed rise at KL max',
  'Calculator 445 closure test',
)

requireMarker(
  tests,
  'zero bed rise recovers Calculator 442 maximum transition-loss limit',
  'Calculator 442 limiting case',
)

requireMarker(
  tests,
  'larger bed rise reduces allowable transition loss',
  'bed-rise trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumTransitionLossCoefficientBedRise'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumTransitionLossCoefficientBedRise"',
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
      'trapezoidalMaximumTransitionLossCoefficientBedRise',
    )
) {
  throw new Error(
    'Calculator 448 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-max-transition-loss-bed-rise-v1',
    'verify:trapezoidal-max-transition-loss-bed-rise-v1',
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
    'verify:trapezoidal-max-transition-loss-bed-rise-v1',
  )
) {
  throw new Error(
    'Calculator 448 is not in verify:release.',
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
  'PASS: Calculator 448 verifier.',
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
