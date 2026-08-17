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
    'src/features/fluid-mechanics/trapezoidal-channel-normal-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-normal-depth/TrapezoidalChannelNormalDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-normal-depth/trapezoidal-channel-normal-depth.test.ts',
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
      `Calculator 421 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_NORMAL_DEPTH_ENGINE_VERSION',
  'calculateTrapezoidalChannelNormalDepth',
  'calculateTrapezoidalChannelManningFlow',
  'BRACKETING_FAILURE',
  'CONVERGENCE_FAILURE',
  'dischargeResidual',
  'relativeDischargeResidual',
  'solverIterations',
  'createTrapezoidalChannelNormalDepthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–38',
  'Trapezoidal Channel Normal Depth',
  'Normal flow depth',
  'Froude Number',
  'Discharge Residual',
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
  'trapezoidalChannelNormalDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'recovers one-meter normal depth from known Manning discharge',
  'inverse Manning test',
)

requireMarker(
  tests,
  'closes the target-discharge residual',
  'solver closure test',
)

requireMarker(
  tests,
  'supports rectangular-channel limit with zero side slope',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelNormalDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelNormalDepth"',
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
      'trapezoidalChannelNormalDepth',
    )
) {
  throw new Error(
    'Calculator 421 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-normal-depth-v1',
  'verify:trapezoidal-channel-normal-depth-v1',
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
    'verify:trapezoidal-channel-normal-depth-v1',
  )
) {
  throw new Error(
    'Calculator 421 is not in verify:release.',
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
  'PASS: Calculator 421 verifier.',
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
