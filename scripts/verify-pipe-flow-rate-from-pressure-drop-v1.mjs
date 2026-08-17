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
    'src/features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/shared/pipeHydraulicsCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/PipeFlowRateFromPressureDropCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/pipe-flow-rate-from-pressure-drop/pipe-flow-rate-from-pressure-drop.test.ts',
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
      `Calculator 402 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'PIPE_FLOW_RATE_FROM_PRESSURE_DROP_ENGINE_VERSION',
  'calculatePipeHydraulicsState',
  'calculatePipeFlowRateFromPressureDrop',
  'BISECTION_ITERATIONS',
  'createPipeFlowRateFromPressureDropCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculatePipeHydraulicsState',
  'reynoldsNumber',
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
  'FM–19',
  'Pipe Flow Rate from Available Pressure Drop',
  'Available volumetric flow rate',
  'Darcy Friction Factor',
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
  'pipeFlowRateFromPressureDrop',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses shared pipe-hydraulics core',
  'shared-core reuse test',
)

requireMarker(
  tests,
  'recovers Calculator 401 design point',
  'Calculator 401 inverse-pair test',
)

requireMarker(
  workbench,
  "calculatorId === 'pipeFlowRateFromPressureDrop'",
  'route',
)

requireMarker(
  catalog,
  'id: "pipeFlowRateFromPressureDrop"',
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
      'pipeFlowRateFromPressureDrop',
    )
) {
  throw new Error(
    'Calculator 402 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:pipe-flow-rate-from-pressure-drop-v1',
  'verify:pipe-flow-rate-from-pressure-drop-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 402 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:pipe-flow-rate-from-pressure-drop-v1',
  )
) {
  throw new Error(
    'Calculator 402 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 402 verifier.',
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
