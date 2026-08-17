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
    'src/features/fluid-mechanics/required-static-liquid-level-npsh-margin/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/required-static-liquid-level-npsh-margin/RequiredStaticLiquidLevelNpshMarginCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/required-static-liquid-level-npsh-margin/required-static-liquid-level-npsh-margin.test.ts',
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
      `Calculator 407 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'REQUIRED_STATIC_LIQUID_LEVEL_NPSH_MARGIN_ENGINE_VERSION',
  'calculateNpshAvailableCavitationMargin',
  'calculateRequiredStaticLiquidLevelNpshMargin',
  'zeroLevelNpshMargin',
  'maximumSuctionLift',
  'minimumFloodedSuctionHead',
  'createRequiredStaticLiquidLevelNpshMarginCsv',
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
  'FM–24',
  'Required Static Liquid Level / Maximum Suction Lift',
  'Maximum suction lift',
  'Minimum Flooded Suction Head',
  'Target NPSH Margin',
  'Zero-Level NPSH Margin',
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
  'requiredStaticLiquidLevelNpshMargin',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 405 at solved static level',
  'Calculator 405 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'requiredStaticLiquidLevelNpshMargin'",
  'route',
)

requireMarker(
  catalog,
  'id: "requiredStaticLiquidLevelNpshMargin"',
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
      'requiredStaticLiquidLevelNpshMargin',
    )
) {
  throw new Error(
    'Calculator 407 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:required-static-liquid-level-npsh-margin-v1',
  'verify:required-static-liquid-level-npsh-margin-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 407 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:required-static-liquid-level-npsh-margin-v1',
  )
) {
  throw new Error(
    'Calculator 407 is not part of verify:release.',
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
    'Verified-calculator copy verifier must remain last in verify:release.',
  )
}

console.log(
  'PASS: Calculator 407 verifier.',
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
