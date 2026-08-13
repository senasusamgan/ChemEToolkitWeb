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
    'src/features/fluid-mechanics/trapezoidal-channel-standard-step-profile/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-standard-step-profile/TrapezoidalChannelStandardStepProfileCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-standard-step-profile/trapezoidal-channel-standard-step-profile.test.ts',
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
      `Calculator 451 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CHANNEL_STANDARD_STEP_PROFILE_ENGINE_VERSION',
    'calculateTrapezoidalChannelStandardStepProfile',
    'calculateTrapezoidalChannelStandardStep',
    'profilePoints',
    'totalFrictionHeadLoss',
    'totalEnergyClosureResidual',
    'cumulativeDepthSolverIterations',
    'createTrapezoidalChannelStandardStepProfileCsv',
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
    'FM–68',
    'Trapezoidal Multi-Reach Standard-Step GVF Profile',
    'Final flow depth',
    'Standard-Step Profile Stations',
    'Total Friction Head Loss',
    'Maximum |dy/dx|',
    'Hydraulic Power Dissipated',
    'Export profile CSV',
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
  'trapezoidalChannelStandardStepProfile',
  'direct test ID',
)

requireMarker(
  tests,
  'one profile step reproduces Calculator 450 exactly',
  'Calculator 450 closure',
)

requireMarker(
  tests,
  'standard-step profile agrees closely with RK4 GVF endpoint',
  'RK4 endpoint comparison',
)

requireMarker(
  tests,
  'standard-step refinement converges toward RK4 profile',
  'step-refinement test',
)

requireMarker(
  tests,
  'solves a multi-reach M2 drawdown profile',
  'M2 profile test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelStandardStepProfile'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelStandardStepProfile"',
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
      'trapezoidalChannelStandardStepProfile',
    )
) {
  throw new Error(
    'Calculator 451 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-channel-standard-step-profile-v1',
    'verify:trapezoidal-channel-standard-step-profile-v1',
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
    'verify:trapezoidal-channel-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 451 is not in verify:release.',
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
  'PASS: Calculator 451 verifier.',
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
