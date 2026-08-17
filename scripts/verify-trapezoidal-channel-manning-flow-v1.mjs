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
    'src/features/fluid-mechanics/trapezoidal-channel-manning-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-channel-manning-flow/TrapezoidalChannelManningFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-channel-manning-flow/trapezoidal-channel-manning-flow.test.ts',
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
      `Calculator 420 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_MANNING_FLOW_ENGINE_VERSION',
  'calculateTrapezoidalChannelManningFlow',
  'hydraulicRadius',
  'froudeNumber',
  'boundaryShearStress',
  'recoveredManningRoughness',
  'manningClosureResidual',
  'createTrapezoidalChannelManningFlowCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–37',
  'Trapezoidal Open-Channel Flow — Manning Equation',
  'Hydraulic Radius',
  'Froude Number',
  'Boundary Shear Stress',
  'Recovered Manning Roughness',
  'Manning Closure Residual',
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
  'trapezoidalChannelManningFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'recovers the Manning roughness coefficient',
  'Manning closure test',
)

requireMarker(
  tests,
  'flow scales with square root of channel slope',
  'slope scaling test',
)

requireMarker(
  tests,
  'zero side slope reduces geometry to a rectangular channel',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelManningFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelManningFlow"',
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
      'trapezoidalChannelManningFlow',
    )
) {
  throw new Error(
    'Calculator 420 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-channel-manning-flow-v1',
  'verify:trapezoidal-channel-manning-flow-v1',
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
    'verify:trapezoidal-channel-manning-flow-v1',
  )
) {
  throw new Error(
    'Calculator 420 is not in verify:release.',
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
  'PASS: Calculator 420 verifier.',
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
