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
    'src/features/fluid-mechanics/trapezoidal-channel-standard-step/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-standard-step/TrapezoidalChannelStandardStepCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-standard-step/trapezoidal-channel-standard-step.test.ts',
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
      `Calculator 450 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_CHANNEL_STANDARD_STEP_ENGINE_VERSION',
    'calculateTrapezoidalChannelStandardStep',
    'calculateTrapezoidalChannelCriticalDepth',
    'profileClassification',
    'equivalentDirectStepDistance',
    'standardStepEnergyResidual',
    'AMBIGUOUS_STANDARD_STEP',
    'createTrapezoidalChannelStandardStepCsv',
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
    'FM–67',
    'Trapezoidal Channel Standard-Step Method — GVF',
    'Downstream flow depth',
    'Equivalent Direct-Step Distance',
    'Average Friction Slope',
    'Water-Surface Elevation Change',
    'Hydraulic Power Dissipated',
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
  'trapezoidalChannelStandardStep',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 431 direct-step inverse closure recovers 100 metre reach',
  'Calculator 431 inverse closure',
)

requireMarker(
  tests,
  'solves a mild-slope M2 profile with decreasing downstream depth',
  'M2 profile test',
)

requireMarker(
  tests,
  'rejects an overly long standard step with multiple same-zone roots',
  'ambiguous step protection',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelStandardStep'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelStandardStep"',
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
      'trapezoidalChannelStandardStep',
    )
) {
  throw new Error(
    'Calculator 450 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-channel-standard-step-v1',
    'verify:trapezoidal-channel-standard-step-v1',
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
    'verify:trapezoidal-channel-standard-step-v1',
  )
) {
  throw new Error(
    'Calculator 450 is not in verify:release.',
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
  'PASS: Calculator 450 verifier.',
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
