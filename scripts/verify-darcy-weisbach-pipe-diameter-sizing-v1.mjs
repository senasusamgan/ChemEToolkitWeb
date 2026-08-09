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
    'src/features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/shared/pipeHydraulicsCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/DarcyWeisbachPipeDiameterSizingCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/darcy-weisbach-pipe-diameter-sizing/darcy-weisbach-pipe-diameter-sizing.test.ts',
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
      `Calculator 401 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'DARCY_WEISBACH_PIPE_DIAMETER_SIZING_ENGINE_VERSION',
  'calculatePipeHydraulicsState',
  'calculateDarcyWeisbachPipeDiameterSizing',
  'BISECTION_ITERATIONS',
  'createDarcyWeisbachPipeDiameterSizingCsv',
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
    'shared core marker',
  )
}

for (const marker of [
  'FM–18',
  'Darcy–Weisbach Pipe Diameter Sizing',
  'Required internal diameter',
  'Reynolds Number',
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
  'darcyWeisbachPipeDiameterSizing',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses the shared hydraulic state evaluator',
  'shared-core reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'darcyWeisbachPipeDiameterSizing'",
  'route',
)

requireMarker(
  catalog,
  'id: "darcyWeisbachPipeDiameterSizing"',
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
      'darcyWeisbachPipeDiameterSizing',
    )
) {
  throw new Error(
    'Calculator 401 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:darcy-weisbach-pipe-diameter-sizing-v1',
  'verify:darcy-weisbach-pipe-diameter-sizing-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 401 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:darcy-weisbach-pipe-diameter-sizing-v1',
  )
) {
  throw new Error(
    'Calculator 401 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 401 verifier.',
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
