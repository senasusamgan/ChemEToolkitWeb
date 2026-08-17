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
    'src/features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/TrapezoidalChannelUpstreamStandardStepProfileCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-upstream-standard-step-profile/trapezoidal-channel-upstream-standard-step-profile.test.ts',
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
      `Calculator 453 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CHANNEL_UPSTREAM_STANDARD_STEP_PROFILE_ENGINE_VERSION',
    'calculateTrapezoidalChannelUpstreamStandardStepProfile',
    'solveUpstreamDepth',
    'profileClassification',
    'totalFrictionHeadLoss',
    'totalEnergyClosureResidual',
    'distanceFromDownstream',
    'createTrapezoidalChannelUpstreamStandardStepProfileCsv',
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
    'FM–70',
    'Upstream Standard-Step GVF Profile from Downstream Boundary',
    'Required upstream boundary depth',
    'Downstream Control Depth',
    'Upstream-to-Downstream GVF Stations',
    'Total Friction Head Loss',
    'Hydraulic Power Dissipated',
    'Export upstream profile CSV',
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
  'trapezoidalChannelUpstreamStandardStepProfile',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 451 forward profile closes the reverse calculation',
  'Calculator 451 inverse closure',
)

requireMarker(
  tests,
  'recovers an upstream M2 boundary depth',
  'M2 reverse profile test',
)

requireMarker(
  tests,
  'M2 reverse-forward closure reproduces downstream boundary',
  'M2 forward closure',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelUpstreamStandardStepProfile'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelUpstreamStandardStepProfile"',
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
      'trapezoidalChannelUpstreamStandardStepProfile',
    )
) {
  throw new Error(
    'Calculator 453 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-channel-upstream-standard-step-profile-v1',
    'verify:trapezoidal-channel-upstream-standard-step-profile-v1',
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
    'verify:trapezoidal-channel-upstream-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 453 is not in verify:release.',
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
  'PASS: Calculator 453 verifier.',
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
