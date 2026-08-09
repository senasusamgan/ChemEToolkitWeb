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
    'src/features/fluid-mechanics/positive-displacement-flow-meter/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/positive-displacement-flow-meter/PositiveDisplacementFlowMeterCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/positive-displacement-flow-meter/positive-displacement-flow-meter.test.ts',
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
      `Calculator 416 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'POSITIVE_DISPLACEMENT_FLOW_METER_ENGINE_VERSION',
  'calculatePositiveDisplacementFlowMeter',
  'idealVolumetricFlowRate',
  'slipVolumetricFlowRate',
  'recoveredDisplacementPerCycle',
  'displacementClosureResidual',
  'createPositiveDisplacementFlowMeterCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–33',
  'Positive-Displacement Flow Meter',
  'Ideal Volumetric Flow',
  'Slip Percentage',
  'Recovered Displacement',
  'Displacement Closure Residual',
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
  'positiveDisplacementFlowMeter',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the displacement-per-cycle relation',
  'displacement closure test',
)

requireMarker(
  tests,
  'doubling rotational speed doubles indicated flow',
  'speed scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'positiveDisplacementFlowMeter'",
  'route',
)

requireMarker(
  catalog,
  'id: "positiveDisplacementFlowMeter"',
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
      'positiveDisplacementFlowMeter',
    )
) {
  throw new Error(
    'Calculator 416 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:positive-displacement-flow-meter-v1',
  'verify:positive-displacement-flow-meter-v1',
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
    'verify:positive-displacement-flow-meter-v1',
  )
) {
  throw new Error(
    'Calculator 416 is not in verify:release.',
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
  'PASS: Calculator 416 verifier.',
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
