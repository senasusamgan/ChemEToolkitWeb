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
    'src/features/fluid-mechanics/rectangular-hydraulic-jump/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/rectangular-hydraulic-jump/RectangularHydraulicJumpCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/rectangular-hydraulic-jump/rectangular-hydraulic-jump.test.ts',
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
      `Calculator 422 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'RECTANGULAR_HYDRAULIC_JUMP_ENGINE_VERSION',
  'calculateRectangularHydraulicJump',
  'sequentDepthRatio',
  'downstreamDepth',
  'energyLoss',
  'dissipatedPower',
  'momentumClosureResidual',
  'createRectangularHydraulicJumpCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–39',
  'Rectangular Hydraulic Jump',
  'Sequent downstream depth',
  'Hydraulic-Jump Energy Loss',
  'Dissipated Hydraulic Power',
  'Momentum Closure Residual',
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
  'rectangularHydraulicJump',
  'direct test ID',
)

requireMarker(
  tests,
  'calculates upstream Froude number and sequent depth',
  'sequent-depth test',
)

requireMarker(
  tests,
  'closes the rectangular-channel momentum function',
  'momentum closure test',
)

requireMarker(
  tests,
  'rejects subcritical upstream flow',
  'supercritical guard test',
)

requireMarker(
  workbench,
  "calculatorId === 'rectangularHydraulicJump'",
  'route',
)

requireMarker(
  catalog,
  'id: "rectangularHydraulicJump"',
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
      'rectangularHydraulicJump',
    )
) {
  throw new Error(
    'Calculator 422 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:rectangular-hydraulic-jump-v1',
  'verify:rectangular-hydraulic-jump-v1',
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
    'verify:rectangular-hydraulic-jump-v1',
  )
) {
  throw new Error(
    'Calculator 422 is not in verify:release.',
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
  'PASS: Calculator 422 verifier.',
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
