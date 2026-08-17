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
    'src/features/fluid-mechanics/pitot-tube-velocity-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/pitot-tube-velocity-flow/PitotTubeVelocityFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/pitot-tube-velocity-flow/pitot-tube-velocity-flow.test.ts',
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
      `Calculator 410 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'PITOT_TUBE_VELOCITY_FLOW_ENGINE_VERSION',
  'calculatePitotTubeVelocityFlow',
  'idealVelocity',
  'correctedVelocity',
  'volumetricFlowRate',
  'reynoldsNumber',
  'createPitotTubeVelocityFlowCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–27',
  'Pitot Tube Velocity & Volumetric Flow',
  'Corrected fluid velocity',
  'Volumetric Flow Rate',
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
  'pitotTubeVelocityFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'four times differential pressure doubles velocity and flow',
  'square-root pressure relationship test',
)

requireMarker(
  workbench,
  "calculatorId === 'pitotTubeVelocityFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "pitotTubeVelocityFlow"',
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
      'pitotTubeVelocityFlow',
    )
) {
  throw new Error(
    'Calculator 410 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:pitot-tube-velocity-flow-v1',
  'verify:pitot-tube-velocity-flow-v1',
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
    'verify:pitot-tube-velocity-flow-v1',
  )
) {
  throw new Error(
    'Calculator 410 is not in verify:release.',
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
  'PASS: Calculator 410 verifier.',
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
