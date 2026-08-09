import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  calculator405Engine,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/MinimumSuctionPipeDiameterNpshMarginCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/minimum-suction-pipe-diameter-npsh-margin/minimum-suction-pipe-diameter-npsh-margin.test.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts',
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
      `Calculator 406 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MINIMUM_SUCTION_PIPE_DIAMETER_NPSH_MARGIN_ENGINE_VERSION',
  'calculateNpshAvailableCavitationMargin',
  'calculateMinimumSuctionPipeDiameterNpshMargin',
  'BISECTION_ITERATIONS',
  'TARGET_NOT_ACHIEVABLE',
  'createMinimumSuctionPipeDiameterNpshMarginCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculateNpshAvailableCavitationMargin',
  'availableNpsh',
  'npshMargin',
  'suctionLineHeadLoss',
]) {
  requireMarker(
    calculator405Engine,
    marker,
    'Calculator 405 marker',
  )
}

for (const marker of [
  'FM–23',
  'Minimum Suction Pipe Diameter for Required NPSH Margin',
  'Minimum suction-pipe diameter',
  'Target NPSH Margin',
  'Achieved NPSH Margin',
  'Suction-Line Head Loss',
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
  'minimumSuctionPipeDiameterNpshMargin',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 405 at solved suction diameter',
  'Calculator 405 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'minimumSuctionPipeDiameterNpshMargin'",
  'route',
)

requireMarker(
  catalog,
  'id: "minimumSuctionPipeDiameterNpshMargin"',
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
      'minimumSuctionPipeDiameterNpshMargin',
    )
) {
  throw new Error(
    'Calculator 406 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:minimum-suction-pipe-diameter-npsh-margin-v1',
  'verify:minimum-suction-pipe-diameter-npsh-margin-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 406 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:minimum-suction-pipe-diameter-npsh-margin-v1',
  )
) {
  throw new Error(
    'Calculator 406 is not part of verify:release.',
  )
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:verified-calculator-copy',
  )
) {
  throw new Error(
    'Verified-calculator copy check is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 406 verifier.',
)

console.log(
  `Current catalog calculators: ${baseline.catalogCalculatorCount}`,
)

console.log(
  `Current direct test signals: ${baseline.directTestSignals}`,
)

console.log(
  `Current coverage gaps: ${baseline.withoutDirectTestSignal}`,
)
