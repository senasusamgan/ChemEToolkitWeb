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
    'src/features/fluid-mechanics/vortex-shedding-flow-meter/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/vortex-shedding-flow-meter/VortexSheddingFlowMeterCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/vortex-shedding-flow-meter/vortex-shedding-flow-meter.test.ts',
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
      `Calculator 413 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'VORTEX_SHEDDING_FLOW_METER_ENGINE_VERSION',
  'calculateVortexSheddingFlowMeter',
  'fluidVelocity',
  'vortexSheddingPeriod',
  'recoveredStrouhalNumber',
  'strouhalResidual',
  'createVortexSheddingFlowMeterCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–30',
  'Vortex Shedding Flow Meter',
  'Fluid Velocity',
  'Vortex Shedding Period',
  'Recovered Strouhal Number',
  'Strouhal Closure Residual',
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
  'vortexSheddingFlowMeter',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the Strouhal relation',
  'Strouhal closure test',
)

requireMarker(
  tests,
  'doubling shedding frequency doubles velocity and flow',
  'frequency scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'vortexSheddingFlowMeter'",
  'route',
)

requireMarker(
  catalog,
  'id: "vortexSheddingFlowMeter"',
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
      'vortexSheddingFlowMeter',
    )
) {
  throw new Error(
    'Calculator 413 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:vortex-shedding-flow-meter-v1',
  'verify:vortex-shedding-flow-meter-v1',
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
    'verify:vortex-shedding-flow-meter-v1',
  )
) {
  throw new Error(
    'Calculator 413 is not in verify:release.',
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
  'PASS: Calculator 413 verifier.',
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
