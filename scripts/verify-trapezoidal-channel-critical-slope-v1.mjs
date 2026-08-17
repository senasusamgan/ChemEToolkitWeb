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
    'src/features/fluid-mechanics/trapezoidal-channel-critical-slope/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-critical-slope/TrapezoidalChannelCriticalSlopeCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-critical-slope/trapezoidal-channel-critical-slope.test.ts',
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
      `Calculator 425 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_CRITICAL_SLOPE_ENGINE_VERSION',
  'calculateTrapezoidalChannelCriticalSlope',
  'calculateTrapezoidalChannelCriticalDepth',
  'calculateTrapezoidalChannelManningFlow',
  'criticalSlope',
  'manningConveyance',
  'boundaryShearStress',
  'relativeDischargeResidual',
  'createTrapezoidalChannelCriticalSlopeCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–42',
  'Trapezoidal Channel Critical Slope',
  'Critical Slope Angle',
  'Bed Drop per 100 m',
  'Critical Depth',
  'Froude Number',
  'Boundary Shear Stress',
  'Relative Discharge Residual',
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
  'trapezoidalChannelCriticalSlope',
  'direct test ID',
)

requireMarker(
  tests,
  'critical slope reproduces target Manning discharge',
  'Manning closure test',
)

requireMarker(
  tests,
  'critical slope state closes at Froude number one',
  'critical-flow test',
)

requireMarker(
  tests,
  'doubling Manning roughness quadruples critical slope',
  'roughness scaling test',
)

requireMarker(
  tests,
  'rectangular-channel limit matches analytical critical-depth geometry',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelCriticalSlope'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelCriticalSlope"',
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
      'trapezoidalChannelCriticalSlope',
    )
) {
  throw new Error(
    'Calculator 425 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-critical-slope-v1',
  'verify:trapezoidal-channel-critical-slope-v1',
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
    'verify:trapezoidal-channel-critical-slope-v1',
  )
) {
  throw new Error(
    'Calculator 425 is not in verify:release.',
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
  'PASS: Calculator 425 verifier.',
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
