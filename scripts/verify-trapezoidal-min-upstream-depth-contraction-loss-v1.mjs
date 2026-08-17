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
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/TrapezoidalMinimumUpstreamDepthContractionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-min-upstream-depth-contraction-loss/trapezoidal-min-upstream-depth-contraction-loss.test.ts',
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
      `Calculator 444 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_CONTRACTION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMinimumUpstreamDepthContractionLoss',
    'calculateTrapezoidalChannelAlternateDepth',
    'calculateTrapezoidalChannelCriticalDepth',
    'minimumSubcriticalUpstreamDepth',
    'alternateSupercriticalUpstreamDepth',
    'transitionLossHeadAtThreshold',
    'controlConditionResidual',
    'createTrapezoidalMinimumUpstreamDepthContractionLossCsv',
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
    'FM–61',
    'Minimum Upstream Depth for a Contraction with Transition Loss',
    'Minimum subcritical upstream depth',
    'Alternate Supercritical Upstream Depth',
    'Loss-Adjusted Control Froude',
    'Transition-Loss Head at Threshold',
    'Transition-Loss Dissipation Power',
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
  'trapezoidalMinimumUpstreamDepthContractionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 441 forward model closes at the specified contraction threshold',
  'forward closure test',
)

requireMarker(
  tests,
  'zero transition loss recovers lossless contraction depth requirement',
  'lossless limit test',
)

requireMarker(
  tests,
  'larger transition loss requires a deeper upstream approach',
  'loss trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMinimumUpstreamDepthContractionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMinimumUpstreamDepthContractionLoss"',
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
      'trapezoidalMinimumUpstreamDepthContractionLoss',
    )
) {
  throw new Error(
    'Calculator 444 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-min-upstream-depth-contraction-loss-v1',
    'verify:trapezoidal-min-upstream-depth-contraction-loss-v1',
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
    'verify:trapezoidal-min-upstream-depth-contraction-loss-v1',
  )
) {
  throw new Error(
    'Calculator 444 is not in verify:release.',
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
  'PASS: Calculator 444 verifier.',
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
