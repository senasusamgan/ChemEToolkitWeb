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
    'src/features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/TrapezoidalChannelAdaptiveStandardStepProfileCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-adaptive-standard-step-profile/trapezoidal-channel-adaptive-standard-step-profile.test.ts',
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
      `Calculator 452 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CHANNEL_ADAPTIVE_STANDARD_STEP_PROFILE_ENGINE_VERSION',
    'calculateTrapezoidalChannelAdaptiveStandardStepProfile',
    'calculateTrapezoidalChannelStandardStep',
    'maximumDepthChangePerStep',
    'adaptiveReductionCount',
    'maximumDepthChangeObserved',
    'totalEnergyClosureResidual',
    'createTrapezoidalChannelAdaptiveStandardStepProfileCsv',
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
    'FM–69',
    'Adaptive Standard-Step GVF Profile',
    'Adaptive Reductions',
    'Maximum |Δy| Observed',
    'Adaptive GVF Stations',
    'Total Friction Head Loss',
    'Hydraulic Power Dissipated',
    'Export adaptive profile CSV',
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
  'trapezoidalChannelAdaptiveStandardStepProfile',
  'direct test ID',
)

requireMarker(
  tests,
  'loose adaptive criterion reproduces Calculator 451 fixed ten-step profile',
  'Calculator 451 closure',
)

requireMarker(
  tests,
  'adaptive endpoint agrees closely with RK4 GVF profile',
  'RK4 cross-check',
)

requireMarker(
  tests,
  'tighter depth-change criterion creates more accepted steps',
  'adaptive refinement test',
)

requireMarker(
  tests,
  'solves an adaptive M2 drawdown profile',
  'M2 adaptive profile test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelAdaptiveStandardStepProfile'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelAdaptiveStandardStepProfile"',
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
      'trapezoidalChannelAdaptiveStandardStepProfile',
    )
) {
  throw new Error(
    'Calculator 452 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-channel-adaptive-standard-step-profile-v1',
    'verify:trapezoidal-channel-adaptive-standard-step-profile-v1',
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
    'verify:trapezoidal-channel-adaptive-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 452 is not in verify:release.',
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
  'PASS: Calculator 452 verifier.',
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
