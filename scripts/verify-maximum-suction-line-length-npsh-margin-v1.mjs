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
    'src/features/fluid-mechanics/maximum-suction-line-length-npsh-margin/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/maximum-suction-line-length-npsh-margin/MaximumSuctionLineLengthNpshMarginCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/maximum-suction-line-length-npsh-margin/maximum-suction-line-length-npsh-margin.test.ts',
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
      `Calculator 409 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MAXIMUM_SUCTION_LINE_LENGTH_NPSH_MARGIN_ENGINE_VERSION',
  'calculateNpshAvailableCavitationMargin',
  'calculateMaximumSuctionLineLengthNpshMargin',
  'zeroLengthNpshMargin',
  'marginLossPerUnitLength',
  'createMaximumSuctionLineLengthNpshMarginCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–26',
  'Maximum Suction-Line Length for Required NPSH Margin',
  'Maximum suction-line length',
  'Target NPSH Margin',
  'Zero-Length NPSH Margin',
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
  'maximumSuctionLineLengthNpshMargin',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 405 at solved maximum suction length',
  'Calculator 405 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'maximumSuctionLineLengthNpshMargin'",
  'route',
)

requireMarker(
  catalog,
  'id: "maximumSuctionLineLengthNpshMargin"',
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
      'maximumSuctionLineLengthNpshMargin',
    )
) {
  throw new Error(
    'Calculator 409 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:maximum-suction-line-length-npsh-margin-v1',
  'verify:maximum-suction-line-length-npsh-margin-v1',
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
    'verify:maximum-suction-line-length-npsh-margin-v1',
  )
) {
  throw new Error(
    'Calculator 409 is not in verify:release.',
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
  'PASS: Calculator 409 verifier.',
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
