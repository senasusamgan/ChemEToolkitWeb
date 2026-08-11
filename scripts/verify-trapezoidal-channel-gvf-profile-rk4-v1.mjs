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
    'src/features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/TrapezoidalChannelGvfProfileRk4Calculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-gvf-profile-rk4/trapezoidal-channel-gvf-profile-rk4.test.ts',
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
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 433 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_GVF_PROFILE_RK4_ENGINE_VERSION',
  'calculateTrapezoidalChannelGvfProfileRk4',
  'calculateTrapezoidalChannelGvfSlope',
  'integrationStepLength',
  'integratedFrictionHeadLoss',
  'profilePoints',
  'energyClosureResidual',
  'hydraulicPowerDissipated',
  'createTrapezoidalChannelGvfProfileRk4Csv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–50',
  'Trapezoidal Channel GVF Profile — RK4',
  'Final downstream flow depth',
  'Integrated Friction Head Loss',
  'Energy Closure Residual',
  'Stored Profile Points',
  'Export full profile CSV',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'trapezoidalChannelGvfProfileRk4',
  'direct test ID',
)

requireMarker(
  tests,
  'preserves the M1 profile classification across the reach',
  'profile test',
)

requireMarker(
  tests,
  'closes the finite-reach energy balance',
  'energy closure test',
)

requireMarker(
  tests,
  'RK4 solution is stable under step refinement',
  'step refinement test',
)

requireMarker(
  tests,
  'returns one profile point per RK4 node',
  'profile-point test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelGvfProfileRk4'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelGvfProfileRk4"',
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
      'trapezoidalChannelGvfProfileRk4',
    )
) {
  throw new Error(
    'Calculator 433 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-gvf-profile-rk4-v1',
  'verify:trapezoidal-channel-gvf-profile-rk4-v1',
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
    'verify:trapezoidal-channel-gvf-profile-rk4-v1',
  )
) {
  throw new Error(
    'Calculator 433 is not in verify:release.',
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
  'PASS: Calculator 433 verifier.',
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
