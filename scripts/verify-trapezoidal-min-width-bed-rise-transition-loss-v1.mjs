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
    'src/features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/TrapezoidalMinimumWidthBedRiseTransitionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-min-width-bed-rise-transition-loss/trapezoidal-min-width-bed-rise-transition-loss.test.ts',
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
      `Calculator 446 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MINIMUM_WIDTH_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMinimumWidthBedRiseTransitionLoss',
    'minimumContractedBottomWidth',
    'losslessMinimumContractedBottomWidth',
    'transitionLossWidthPenalty',
    'availableThroatSpecificEnergy',
    'controlConditionResidual',
    'createTrapezoidalMinimumWidthBedRiseTransitionLossCsv',
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
    'FM–63',
    'Minimum Contracted Width for Bed Rise & Transition Loss',
    'Minimum contracted bottom width',
    'Transition-Loss Width Penalty',
    'Available Throat Specific Energy',
    'Loss-Adjusted Control Froude',
    'Bed-Rise Potential Power',
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
  'trapezoidalMinimumWidthBedRiseTransitionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 445 forward model recovers the specified maximum bed rise',
  'Calculator 445 inverse closure test',
)

requireMarker(
  tests,
  'zero bed rise recovers Calculator 441 minimum-width requirement',
  'zero bed-rise limit test',
)

requireMarker(
  tests,
  'larger bed rise requires a wider contracted section',
  'bed-rise trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMinimumWidthBedRiseTransitionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMinimumWidthBedRiseTransitionLoss"',
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
      'trapezoidalMinimumWidthBedRiseTransitionLoss',
    )
) {
  throw new Error(
    'Calculator 446 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-min-width-bed-rise-transition-loss-v1',
    'verify:trapezoidal-min-width-bed-rise-transition-loss-v1',
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
    'verify:trapezoidal-min-width-bed-rise-transition-loss-v1',
  )
) {
  throw new Error(
    'Calculator 446 is not in verify:release.',
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
  'PASS: Calculator 446 verifier.',
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
