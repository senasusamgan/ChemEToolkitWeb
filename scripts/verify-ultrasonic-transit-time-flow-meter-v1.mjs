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
    'src/features/fluid-mechanics/ultrasonic-transit-time-flow-meter/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/ultrasonic-transit-time-flow-meter/UltrasonicTransitTimeFlowMeterCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/ultrasonic-transit-time-flow-meter/ultrasonic-transit-time-flow-meter.test.ts',
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
      `Calculator 414 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'ULTRASONIC_TRANSIT_TIME_FLOW_METER_ENGINE_VERSION',
  'calculateUltrasonicTransitTimeFlowMeter',
  'reciprocalTimeDifference',
  'axialVelocity',
  'acousticVelocity',
  'downstreamClosureResidual',
  'upstreamClosureResidual',
  'createUltrasonicTransitTimeFlowMeterCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–31',
  'Ultrasonic Transit-Time Flow Meter',
  'Axial Fluid Velocity',
  'Recovered Acoustic Velocity',
  'Transit-Time Difference',
  'Flow Mach Number',
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
  'ultrasonicTransitTimeFlowMeter',
  'direct test ID',
)

requireMarker(
  tests,
  'recovers known axial velocity from upstream and downstream transit times',
  'inverse transit-time test',
)

requireMarker(
  tests,
  'reconstructs both measured transit times',
  'closure test',
)

requireMarker(
  workbench,
  "calculatorId === 'ultrasonicTransitTimeFlowMeter'",
  'route',
)

requireMarker(
  catalog,
  'id: "ultrasonicTransitTimeFlowMeter"',
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
      'ultrasonicTransitTimeFlowMeter',
    )
) {
  throw new Error(
    'Calculator 414 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:ultrasonic-transit-time-flow-meter-v1',
  'verify:ultrasonic-transit-time-flow-meter-v1',
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
    'verify:ultrasonic-transit-time-flow-meter-v1',
  )
) {
  throw new Error(
    'Calculator 414 is not in verify:release.',
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
  'PASS: Calculator 414 verifier.',
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
