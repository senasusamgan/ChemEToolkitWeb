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
    'src/features/fluid-mechanics/maximum-pipe-length-pressure-drop/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/shared/pipeHydraulicsCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/maximum-pipe-length-pressure-drop/MaximumPipeLengthFromPressureDropCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/maximum-pipe-length-pressure-drop/maximum-pipe-length-pressure-drop.test.ts',
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
      `Calculator 403 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MAXIMUM_PIPE_LENGTH_FROM_PRESSURE_DROP_ENGINE_VERSION',
  'calculatePipeHydraulicsState',
  'calculateMaximumPipeLengthFromPressureDrop',
  'REFERENCE_PIPE_LENGTH',
  'createMaximumPipeLengthFromPressureDropCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculatePipeHydraulicsState',
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
  'FM–20',
  'Maximum Pipe Length from Pressure-Drop Budget',
  'Maximum allowable pipe length',
  'Friction Loss Gradient',
  'Pressure Available for Pipe Friction',
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
  'maximumPipeLengthFromPressureDrop',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses shared pipe-hydraulics core for final verification',
  'shared-core reuse test',
)

requireMarker(
  tests,
  'recovers Calculator 401 hundred-meter design point',
  'Calculator 401 inverse-design test',
)

requireMarker(
  workbench,
  "calculatorId === 'maximumPipeLengthFromPressureDrop'",
  'route',
)

requireMarker(
  catalog,
  'id: "maximumPipeLengthFromPressureDrop"',
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
      'maximumPipeLengthFromPressureDrop',
    )
) {
  throw new Error(
    'Calculator 403 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:maximum-pipe-length-pressure-drop-v1',
  'verify:maximum-pipe-length-pressure-drop-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 403 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:maximum-pipe-length-pressure-drop-v1',
  )
) {
  throw new Error(
    'Calculator 403 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 403 verifier.',
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
