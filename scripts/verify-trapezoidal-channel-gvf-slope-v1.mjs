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
    'src/features/fluid-mechanics/trapezoidal-channel-gvf-slope/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-gvf-slope/TrapezoidalChannelGvfSlopeCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-gvf-slope/trapezoidal-channel-gvf-slope.test.ts',
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
      `Calculator 432 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_GVF_SLOPE_ENGINE_VERSION',
  'calculateTrapezoidalChannelGvfSlope',
  'calculateTrapezoidalChannelCriticalDepth',
  'solveNormalDepth',
  'profileClassification',
  'frictionSlope',
  'depthGradient',
  'waterSurfaceElevationGradient',
  'differentialEquationResidual',
  'createTrapezoidalChannelGvfSlopeCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–49',
  'Trapezoidal Channel GVF Differential Slope',
  'Local depth gradient dy/dx',
  'GVF Profile',
  'Water-Surface Elevation Gradient',
  'Friction Head Loss per 100 m',
  'Differential Equation Residual',
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
  'trapezoidalChannelGvfSlope',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the GVF differential equation',
  'differential closure test',
)

requireMarker(
  tests,
  'M2 profile has a negative downstream depth gradient',
  'M2 profile test',
)

requireMarker(
  tests,
  'M3 profile is supercritical and has positive depth gradient',
  'M3 profile test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelGvfSlope'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelGvfSlope"',
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
      'trapezoidalChannelGvfSlope',
    )
) {
  throw new Error(
    'Calculator 432 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-gvf-slope-v1',
  'verify:trapezoidal-channel-gvf-slope-v1',
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
    'verify:trapezoidal-channel-gvf-slope-v1',
  )
) {
  throw new Error(
    'Calculator 432 is not in verify:release.',
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
  'PASS: Calculator 432 verifier.',
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
