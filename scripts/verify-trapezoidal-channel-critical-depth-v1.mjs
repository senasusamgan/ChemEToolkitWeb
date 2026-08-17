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
    'src/features/fluid-mechanics/trapezoidal-channel-critical-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-critical-depth/TrapezoidalChannelCriticalDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-critical-depth/trapezoidal-channel-critical-depth.test.ts',
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
      `Calculator 423 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_CRITICAL_DEPTH_ENGINE_VERSION',
  'calculateTrapezoidalChannelCriticalDepth',
  'criticalResidual',
  'gravityWaveCelerity',
  'reconstructedVolumetricFlowRate',
  'relativeDischargeResidual',
  'solverIterations',
  'createTrapezoidalChannelCriticalDepthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–40',
  'Trapezoidal Channel Critical Depth',
  'Critical flow depth',
  'Gravity-Wave Celerity',
  'Froude Number',
  'Critical Specific Energy',
  'Relative Discharge Residual',
  'Solver Iterations',
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
  'trapezoidalChannelCriticalDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'critical solution closes at Froude number one',
  'Froude closure test',
)

requireMarker(
  tests,
  'rectangular-channel limit matches analytical critical depth',
  'rectangular analytical limit',
)

requireMarker(
  tests,
  'reconstructs the target discharge from critical geometry',
  'discharge closure test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelCriticalDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelCriticalDepth"',
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
      'trapezoidalChannelCriticalDepth',
    )
) {
  throw new Error(
    'Calculator 423 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-critical-depth-v1',
  'verify:trapezoidal-channel-critical-depth-v1',
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
    'verify:trapezoidal-channel-critical-depth-v1',
  )
) {
  throw new Error(
    'Calculator 423 is not in verify:release.',
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
  'PASS: Calculator 423 verifier.',
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
