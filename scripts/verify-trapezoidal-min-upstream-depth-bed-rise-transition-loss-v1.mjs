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
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-min-upstream-depth-bed-rise-transition-loss/trapezoidal-min-upstream-depth-bed-rise-transition-loss.test.ts',
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
      `Calculator 449 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss',
    'calculateTrapezoidalMinimumUpstreamDepthContractionLoss',
    'calculateTrapezoidalChannelAlternateDepth',
    'minimumSubcriticalUpstreamDepth',
    'bedRiseDepthPenalty',
    'throatRequiredSpecificEnergy',
    'combinedBedRiseAndLossPower',
    'createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv',
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
    'FM–66',
    'Minimum Upstream Depth with Contraction, Bed Rise & Transition Loss',
    'Minimum subcritical upstream depth',
    'Bed-Rise Depth Penalty',
    'Throat Required Specific Energy',
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
  'trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 445 forward closure recovers specified bed rise',
  'Calculator 445 closure',
)

requireMarker(
  tests,
  'Calculator 446 closure recovers specified contracted width',
  'Calculator 446 closure',
)

requireMarker(
  tests,
  'Calculator 448 closure recovers specified transition-loss coefficient',
  'Calculator 448 closure',
)

requireMarker(
  tests,
  'zero bed rise recovers Calculator 444 minimum upstream depth',
  'Calculator 444 limiting case',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss"',
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
      'trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss',
    )
) {
  throw new Error(
    'Calculator 449 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-min-upstream-depth-bed-rise-transition-loss-v1',
    'verify:trapezoidal-min-upstream-depth-bed-rise-transition-loss-v1',
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
    'verify:trapezoidal-min-upstream-depth-bed-rise-transition-loss-v1',
  )
) {
  throw new Error(
    'Calculator 449 is not in verify:release.',
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
  'PASS: Calculator 449 verifier.',
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
