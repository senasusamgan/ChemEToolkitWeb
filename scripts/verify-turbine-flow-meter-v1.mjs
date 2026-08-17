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
    'src/features/fluid-mechanics/turbine-flow-meter/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/turbine-flow-meter/TurbineFlowMeterCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/turbine-flow-meter/turbine-flow-meter.test.ts',
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
      `Calculator 417 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TURBINE_FLOW_METER_ENGINE_VERSION',
  'calculateTurbineFlowMeter',
  'rawVolumetricFlowRate',
  'reconstructedPulseFrequency',
  'frequencyClosureResidual',
  'createTurbineFlowMeterCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–34',
  'Turbine Flow Meter',
  'Raw Volumetric Flow',
  'Pulse Period',
  'Reconstructed Pulse Frequency',
  'Frequency Closure Residual',
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
  'turbineFlowMeter',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the K-factor pulse-frequency relation',
  'K-factor closure test',
)

requireMarker(
  tests,
  'doubling pulse frequency doubles flow',
  'frequency scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'turbineFlowMeter'",
  'route',
)

requireMarker(
  catalog,
  'id: "turbineFlowMeter"',
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
      'turbineFlowMeter',
    )
) {
  throw new Error(
    'Calculator 417 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:turbine-flow-meter-v1',
  'verify:turbine-flow-meter-v1',
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
    'verify:turbine-flow-meter-v1',
  )
) {
  throw new Error(
    'Calculator 417 is not in verify:release.',
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
  'PASS: Calculator 417 verifier.',
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
