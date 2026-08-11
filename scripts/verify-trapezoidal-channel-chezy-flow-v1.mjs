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
    'src/features/fluid-mechanics/trapezoidal-channel-chezy-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-chezy-flow/TrapezoidalChannelChezyFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-chezy-flow/trapezoidal-channel-chezy-flow.test.ts',
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
      `Calculator 429 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_CHEZY_FLOW_ENGINE_VERSION',
  'calculateTrapezoidalChannelChezyFlow',
  'hydraulicRadius',
  'meanVelocity',
  'equivalentManningRoughness',
  'reconstructedManningFlowRate',
  'flowClosureResidual',
  'hydraulicPowerDissipationPerLength',
  'createTrapezoidalChannelChezyFlowCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–46',
  'Trapezoidal Channel Chezy Flow Rate',
  'Equivalent Manning Roughness',
  'Boundary Shear Stress',
  'Flow Closure Residual',
  'Hydraulic Power Dissipation',
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
  'trapezoidalChannelChezyFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'equivalent Manning roughness reproduces Chezy velocity and flow',
  'Manning-equivalence test',
)

requireMarker(
  tests,
  'flow rate follows square-root slope scaling',
  'slope scaling test',
)

requireMarker(
  tests,
  'rectangular limit uses correct geometry when side slope is zero',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelChezyFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelChezyFlow"',
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
      'trapezoidalChannelChezyFlow',
    )
) {
  throw new Error(
    'Calculator 429 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-chezy-flow-v1',
  'verify:trapezoidal-channel-chezy-flow-v1',
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
    'verify:trapezoidal-channel-chezy-flow-v1',
  )
) {
  throw new Error(
    'Calculator 429 is not in verify:release.',
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
  'PASS: Calculator 429 verifier.',
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
