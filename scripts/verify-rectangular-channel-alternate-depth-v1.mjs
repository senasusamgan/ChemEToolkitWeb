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
    'src/features/fluid-mechanics/rectangular-channel-alternate-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/rectangular-channel-alternate-depth/RectangularChannelAlternateDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/rectangular-channel-alternate-depth/rectangular-channel-alternate-depth.test.ts',
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
      `Calculator 424 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'RECTANGULAR_CHANNEL_ALTERNATE_DEPTH_ENGINE_VERSION',
  'calculateRectangularChannelAlternateDepth',
  'minimumSpecificEnergy',
  'shallowDepth',
  'deepDepth',
  'shallowFroudeNumber',
  'deepFroudeNumber',
  'momentumFunctionDifference',
  'createRectangularChannelAlternateDepthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–41',
  'Rectangular Channel Alternate Depths',
  'Minimum Specific Energy',
  'Shallow Alternate Depth',
  'Deep Alternate Depth',
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
  'rectangularChannelAlternateDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'alternate depths reproduce identical specific energy',
  'energy closure test',
)

requireMarker(
  tests,
  'shallow root is supercritical and deep root is subcritical',
  'Froude regime test',
)

requireMarker(
  tests,
  'rejects exactly critical minimum energy because alternate roots collapse',
  'critical-energy guard test',
)

requireMarker(
  workbench,
  "calculatorId === 'rectangularChannelAlternateDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "rectangularChannelAlternateDepth"',
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
      'rectangularChannelAlternateDepth',
    )
) {
  throw new Error(
    'Calculator 424 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:rectangular-channel-alternate-depth-v1',
  'verify:rectangular-channel-alternate-depth-v1',
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
    'verify:rectangular-channel-alternate-depth-v1',
  )
) {
  throw new Error(
    'Calculator 424 is not in verify:release.',
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
  'PASS: Calculator 424 verifier.',
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
