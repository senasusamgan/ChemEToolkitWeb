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
    'src/features/fluid-mechanics/flow-nozzle-differential-pressure/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/flow-nozzle-differential-pressure/FlowNozzleDifferentialPressureCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/flow-nozzle-differential-pressure/flow-nozzle-differential-pressure.test.ts',
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
      `Calculator 411 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'FLOW_NOZZLE_DIFFERENTIAL_PRESSURE_ENGINE_VERSION',
  'calculateFlowNozzleDifferentialPressure',
  'betaRatio',
  'idealVolumetricFlowRate',
  'volumetricFlowRate',
  'reynoldsNumber',
  'createFlowNozzleDifferentialPressureCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–28',
  'Flow Nozzle Differential-Pressure Meter',
  'Volumetric flow rate',
  'Beta Ratio',
  'Nozzle Velocity',
  'Reynolds Number',
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
  'flowNozzleDifferentialPressure',
  'direct test ID',
)

requireMarker(
  tests,
  'flow scales with square root of differential pressure',
  'physical scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'flowNozzleDifferentialPressure'",
  'route',
)

requireMarker(
  catalog,
  'id: "flowNozzleDifferentialPressure"',
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
      'flowNozzleDifferentialPressure',
    )
) {
  throw new Error(
    'Calculator 411 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:flow-nozzle-differential-pressure-v1',
  'verify:flow-nozzle-differential-pressure-v1',
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
    'verify:flow-nozzle-differential-pressure-v1',
  )
) {
  throw new Error(
    'Calculator 411 is not in verify:release.',
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
  'PASS: Calculator 411 verifier.',
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
