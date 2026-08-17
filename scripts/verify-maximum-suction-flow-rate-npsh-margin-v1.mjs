import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  calculator405,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/MaximumSuctionFlowRateNpshMarginCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/maximum-suction-flow-rate-npsh-margin/maximum-suction-flow-rate-npsh-margin.test.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts',
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
      `Calculator 408 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MAXIMUM_SUCTION_FLOW_RATE_NPSH_MARGIN_ENGINE_VERSION',
  'calculateNpshAvailableCavitationMargin',
  'calculateMaximumSuctionFlowRateNpshMargin',
  'BISECTION_ITERATIONS',
  'zeroFlowNpshMargin',
  'createMaximumSuctionFlowRateNpshMarginCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–25',
  'Maximum Suction Flow Rate for Required NPSH Margin',
  'Maximum suction flow rate',
  'Target NPSH Margin',
  'Zero-Flow NPSH Margin',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  calculator405,
  'calculateNpshAvailableCavitationMargin',
  'Calculator 405 reuse marker',
)

requireMarker(
  tests,
  'maximumSuctionFlowRateNpshMargin',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 405 at solved maximum flow',
  'Calculator 405 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'maximumSuctionFlowRateNpshMargin'",
  'route',
)

requireMarker(
  catalog,
  'id: "maximumSuctionFlowRateNpshMargin"',
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
      'maximumSuctionFlowRateNpshMargin',
    )
) {
  throw new Error(
    'Calculator 408 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:maximum-suction-flow-rate-npsh-margin-v1',
  'verify:maximum-suction-flow-rate-npsh-margin-v1',
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
    'verify:maximum-suction-flow-rate-npsh-margin-v1',
  )
) {
  throw new Error(
    'Calculator 408 is not in verify:release.',
  )
}

console.log(
  'PASS: Calculator 408 verifier.',
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
