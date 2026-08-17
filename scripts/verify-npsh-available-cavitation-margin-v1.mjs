import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  core,
  component,
  tests,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/shared/pipeHydraulicsCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/npsh-available-cavitation-margin/NpshAvailableCavitationMarginCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/npsh-available-cavitation-margin/npsh-available-cavitation-margin.test.ts',
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
      `Calculator 405 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'NPSH_AVAILABLE_CAVITATION_MARGIN_ENGINE_VERSION',
  'calculatePipeHydraulicsState',
  'calculateNpshAvailableCavitationMargin',
  'availableNpsh',
  'npshMargin',
  'createNpshAvailableCavitationMarginCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculatePipeHydraulicsState',
  'totalHeadLoss',
  'frictionPressureDrop',
  'minorPressureDrop',
]) {
  requireMarker(
    core,
    marker,
    'shared-core marker',
  )
}

for (const marker of [
  'FM–22',
  'NPSH Available & Cavitation Margin',
  'NPSH available',
  'NPSH Margin',
  'Cavitation Status',
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
  'npshAvailableCavitationMargin',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses shared pipe-hydraulics core for suction losses',
  'shared-core reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'npshAvailableCavitationMargin'",
  'route',
)

requireMarker(
  catalog,
  'id: "npshAvailableCavitationMargin"',
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
      'npshAvailableCavitationMargin',
    )
) {
  throw new Error(
    'Calculator 405 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:npsh-available-cavitation-margin-v1',
  'verify:npsh-available-cavitation-margin-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 405 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:npsh-available-cavitation-margin-v1',
  )
) {
  throw new Error(
    'Calculator 405 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 405 verifier.',
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
