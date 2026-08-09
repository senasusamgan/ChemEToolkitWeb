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
    'src/features/fluid-mechanics/electromagnetic-flow-meter/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/electromagnetic-flow-meter/ElectromagneticFlowMeterCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/electromagnetic-flow-meter/electromagnetic-flow-meter.test.ts',
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
      `Calculator 415 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'ELECTROMAGNETIC_FLOW_METER_ENGINE_VERSION',
  'calculateElectromagneticFlowMeter',
  'fluidVelocity',
  'reconstructedVoltage',
  'voltageClosureResidual',
  'createElectromagneticFlowMeterCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–32',
  'Electromagnetic Flow Meter',
  'Fluid Velocity',
  'Reconstructed Voltage',
  'Voltage Closure Residual',
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
  'electromagneticFlowMeter',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the Faraday voltage relation',
  'Faraday closure test',
)

requireMarker(
  tests,
  'doubling induced voltage doubles velocity and flow',
  'physical scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'electromagneticFlowMeter'",
  'route',
)

requireMarker(
  catalog,
  'id: "electromagneticFlowMeter"',
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
      'electromagneticFlowMeter',
    )
) {
  throw new Error(
    'Calculator 415 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:electromagnetic-flow-meter-v1',
  'verify:electromagnetic-flow-meter-v1',
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
    'verify:electromagnetic-flow-meter-v1',
  )
) {
  throw new Error(
    'Calculator 415 is not in verify:release.',
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
  'PASS: Calculator 415 verifier.',
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
