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
    'src/features/fluid-mechanics/maximum-minor-loss-coefficient/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/shared/pipeHydraulicsCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/maximum-minor-loss-coefficient/MaximumMinorLossCoefficientCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/maximum-minor-loss-coefficient/maximum-minor-loss-coefficient.test.ts',
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
      `Calculator 404 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MAXIMUM_MINOR_LOSS_COEFFICIENT_ENGINE_VERSION',
  'calculatePipeHydraulicsState',
  'calculateMaximumMinorLossCoefficient',
  'pressureDropAvailableForMinorLosses',
  'createMaximumMinorLossCoefficientCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculatePipeHydraulicsState',
  'dynamicPressure',
  'frictionPressureDrop',
  'minorPressureDrop',
  'totalPressureDrop',
]) {
  requireMarker(
    core,
    marker,
    'shared-core marker',
  )
}

for (const marker of [
  'FM–21',
  'Maximum Minor-Loss Coefficient / Fittings Budget',
  'Maximum allowable ΣK',
  'Pressure Available for Minor Losses',
  'Minor-Loss Budget',
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
  'maximumMinorLossCoefficient',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses shared pipe-hydraulics core for solved K value',
  'shared-core reuse test',
)

requireMarker(
  tests,
  'recovers Calculator 403 K equals five design point',
  'Calculator 403 inverse-pair test',
)

requireMarker(
  workbench,
  "calculatorId === 'maximumMinorLossCoefficient'",
  'route',
)

requireMarker(
  catalog,
  'id: "maximumMinorLossCoefficient"',
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
      'maximumMinorLossCoefficient',
    )
) {
  throw new Error(
    'Calculator 404 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:maximum-minor-loss-coefficient-v1',
  'verify:maximum-minor-loss-coefficient-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 404 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:maximum-minor-loss-coefficient-v1',
  )
) {
  throw new Error(
    'Calculator 404 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 404 verifier.',
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
