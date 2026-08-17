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
    'src/features/fluid-mechanics/trapezoidal-channel-alternate-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-alternate-depth/TrapezoidalChannelAlternateDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-alternate-depth/trapezoidal-channel-alternate-depth.test.ts',
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
      `Calculator 428 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_ALTERNATE_DEPTH_ENGINE_VERSION',
  'calculateTrapezoidalChannelAlternateDepth',
  'calculateTrapezoidalChannelCriticalDepth',
  'minimumSpecificEnergy',
  'shallowDepth',
  'deepDepth',
  'shallowFroudeNumber',
  'deepFroudeNumber',
  'momentumFunctionDifference',
  'createTrapezoidalChannelAlternateDepthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–45',
  'Trapezoidal Channel Alternate Depths',
  'Minimum Specific Energy',
  'Alternate Depth Ratio',
  'Shallow Froude Number',
  'Deep Froude Number',
  'Momentum Function Difference',
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
  'trapezoidalChannelAlternateDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'both alternate depths recover the same specific energy',
  'energy closure test',
)

requireMarker(
  tests,
  'shallow root is supercritical and deep root is subcritical',
  'Froude split test',
)

requireMarker(
  tests,
  'rectangular limit remains valid at zero side slope',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelAlternateDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelAlternateDepth"',
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
      'trapezoidalChannelAlternateDepth',
    )
) {
  throw new Error(
    'Calculator 428 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-alternate-depth-v1',
  'verify:trapezoidal-channel-alternate-depth-v1',
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
    'verify:trapezoidal-channel-alternate-depth-v1',
  )
) {
  throw new Error(
    'Calculator 428 is not in verify:release.',
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
  'PASS: Calculator 428 verifier.',
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
