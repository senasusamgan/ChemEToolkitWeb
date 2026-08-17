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
    'src/features/fluid-mechanics/trapezoidal-hydraulic-jump/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-hydraulic-jump/TrapezoidalHydraulicJumpCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-hydraulic-jump/trapezoidal-hydraulic-jump.test.ts',
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
      `Calculator 426 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_HYDRAULIC_JUMP_ENGINE_VERSION',
  'calculateTrapezoidalHydraulicJump',
  'calculateTrapezoidalChannelCriticalDepth',
  'hydrostaticMomentumTerm',
  'kineticMomentumTerm',
  'momentumFunction',
  'energyLoss',
  'dissipatedPower',
  'relativeMomentumClosureResidual',
  'solverIterations',
  'createTrapezoidalHydraulicJumpCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–43',
  'Trapezoidal Hydraulic Jump',
  'Downstream sequent depth',
  'Critical Depth',
  'Energy Loss',
  'Dissipated Hydraulic Power',
  'Momentum Closure Residual',
  'Solver Iterations',
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
  'trapezoidalHydraulicJump',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the trapezoidal momentum function',
  'momentum closure test',
)

requireMarker(
  tests,
  'reduces to rectangular hydraulic-jump relation when side slope is zero',
  'rectangular limiting-case test',
)

requireMarker(
  tests,
  'converts supercritical flow to subcritical flow',
  'Froude transition test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalHydraulicJump'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalHydraulicJump"',
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
      'trapezoidalHydraulicJump',
    )
) {
  throw new Error(
    'Calculator 426 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-hydraulic-jump-v1',
  'verify:trapezoidal-hydraulic-jump-v1',
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
    'verify:trapezoidal-hydraulic-jump-v1',
  )
) {
  throw new Error(
    'Calculator 426 is not in verify:release.',
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
  'PASS: Calculator 426 verifier.',
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
