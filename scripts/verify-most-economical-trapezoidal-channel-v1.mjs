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
    'src/features/fluid-mechanics/most-economical-trapezoidal-channel/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/most-economical-trapezoidal-channel/MostEconomicalTrapezoidalChannelCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/most-economical-trapezoidal-channel/most-economical-trapezoidal-channel.test.ts',
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
      `Calculator 430 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MOST_ECONOMICAL_TRAPEZOIDAL_CHANNEL_ENGINE_VERSION',
  'calculateMostEconomicalTrapezoidalChannel',
  'calculateTrapezoidalChannelManningFlow',
  'optimumGeometryResidual',
  'hydraulicRadiusResidual',
  'manningConveyance',
  'reconstructedFlowRate',
  'relativeFlowClosureResidual',
  'createMostEconomicalTrapezoidalChannelCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–47',
  'Most Economical Trapezoidal Channel Design',
  'Optimal depth × bottom width',
  'Optimum Geometry Residual',
  'Rh − y/2 Residual',
  'Reconstructed Flow Rate',
  'Hydraulic Power Dissipation',
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
  'mostEconomicalTrapezoidalChannelDesign',
  'direct test ID',
)

requireMarker(
  tests,
  'satisfies the best-hydraulic trapezoid geometry condition',
  'optimal geometry test',
)

requireMarker(
  tests,
  'hydraulic radius equals one-half flow depth',
  'hydraulic-radius identity test',
)

requireMarker(
  tests,
  'forward Manning solver reconstructs the design flow',
  'forward solver closure test',
)

requireMarker(
  tests,
  'rectangular limit gives bottom width equal to twice the depth',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'mostEconomicalTrapezoidalChannelDesign'",
  'route',
)

requireMarker(
  catalog,
  'id: "mostEconomicalTrapezoidalChannelDesign"',
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
      'mostEconomicalTrapezoidalChannelDesign',
    )
) {
  throw new Error(
    'Calculator 430 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:most-economical-trapezoidal-channel-v1',
  'verify:most-economical-trapezoidal-channel-v1',
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
    'verify:most-economical-trapezoidal-channel-v1',
  )
) {
  throw new Error(
    'Calculator 430 is not in verify:release.',
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
  'PASS: Calculator 430 verifier.',
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
