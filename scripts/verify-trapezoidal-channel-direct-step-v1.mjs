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
    'src/features/fluid-mechanics/trapezoidal-channel-direct-step/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-direct-step/TrapezoidalChannelDirectStepCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-direct-step/trapezoidal-channel-direct-step.test.ts',
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
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 431 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_DIRECT_STEP_ENGINE_VERSION',
  'calculateTrapezoidalChannelDirectStep',
  'calculateTrapezoidalChannelCriticalDepth',
  'solveNormalDepth',
  'profileClassification',
  'averageFrictionSlope',
  'signedDistance',
  'energyClosureResidual',
  'hydraulicPowerDissipated',
  'createTrapezoidalChannelDirectStepCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–48',
  'Trapezoidal Channel Direct-Step Method',
  'Direct-step reach length',
  'GVF Profile',
  'Average Friction Slope',
  'Friction Head Loss',
  'Energy Closure Residual',
  'Export calculation CSV',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'trapezoidalChannelDirectStep',
  'direct test ID',
)

requireMarker(
  tests,
  'classifies the reference reach as a mild-slope M1 profile',
  'profile classification test',
)

requireMarker(
  tests,
  'closes the direct-step energy equation',
  'energy closure test',
)

requireMarker(
  tests,
  'reversing endpoint order reverses signed distance but not reach length',
  'direction symmetry test',
)

requireMarker(
  tests,
  'rejects reaches that cross a GVF profile boundary',
  'profile-boundary test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelDirectStep'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelDirectStep"',
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
      'trapezoidalChannelDirectStep',
    )
) {
  throw new Error(
    'Calculator 431 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-direct-step-v1',
  'verify:trapezoidal-channel-direct-step-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:trapezoidal-channel-direct-step-v1',
  )
) {
  throw new Error(
    'Calculator 431 is not in verify:release.',
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
  'PASS: Calculator 431 verifier.',
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
