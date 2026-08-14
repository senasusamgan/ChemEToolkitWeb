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
    'src/features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-adaptive-upstream-standard-step-profile/trapezoidal-channel-adaptive-upstream-standard-step-profile.test.ts',
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
      `Calculator 454 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CHANNEL_ADAPTIVE_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION',
    'calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile',
    'calculateTrapezoidalChannelUpstreamStandardStepProfile',
    'maximumDepthChangePerStep',
    'adaptiveReductionCount',
    'maximumDepthChangeObserved',
    'distanceFromDownstream',
    'totalEnergyClosureResidual',
    'createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv',
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
    'FM–71',
    'Adaptive Upstream Standard-Step GVF Profile',
    'Required upstream boundary depth',
    'Adaptive Reductions',
    'Maximum |Δy| Observed',
    'Adaptive Upstream-to-Downstream GVF Stations',
    'Total Friction Head Loss',
    'Export adaptive upstream profile CSV',
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
  'trapezoidalChannelAdaptiveUpstreamStandardStepProfile',
  'direct test ID',
)

requireMarker(
  tests,
  'loose adaptive criterion reproduces Calculator 453 fixed profile',
  'Calculator 453 closure',
)

requireMarker(
  tests,
  'Calculator 452 forward adaptive profile closes reverse profile',
  'Calculator 452 closure',
)

requireMarker(
  tests,
  'tighter depth-change criterion creates more reverse steps',
  'adaptive refinement test',
)

requireMarker(
  tests,
  'solves adaptive reverse M2 profile',
  'M2 reverse test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelAdaptiveUpstreamStandardStepProfile'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelAdaptiveUpstreamStandardStepProfile"',
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
      'trapezoidalChannelAdaptiveUpstreamStandardStepProfile',
    )
) {
  throw new Error(
    'Calculator 454 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-channel-adaptive-upstream-standard-step-profile-v1',
    'verify:trapezoidal-channel-adaptive-upstream-standard-step-profile-v1',
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
    'verify:trapezoidal-channel-adaptive-upstream-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 454 is missing from verify:release.',
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
  'PASS: Calculator 454 verifier.',
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
