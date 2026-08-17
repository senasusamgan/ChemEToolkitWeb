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
    'src/features/fluid-mechanics/trapezoidal-max-bed-rise-choking/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-bed-rise-choking/TrapezoidalMaximumBedRiseBeforeChokingCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-bed-rise-choking/trapezoidal-max-bed-rise-choking.test.ts',
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
      `Calculator 436 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_MAXIMUM_BED_RISE_BEFORE_CHOKING_ENGINE_VERSION',
  'calculateTrapezoidalMaximumBedRiseBeforeChoking',
  'calculateTrapezoidalChannelCriticalDepth',
  'upstreamSpecificEnergy',
  'criticalSpecificEnergy',
  'maximumBedRise',
  'waterSurfaceElevationChangeAtChoking',
  'specificEnergyClosureResidual',
  'criticalConditionResidual',
  'createTrapezoidalMaximumBedRiseBeforeChokingCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–53',
  'Maximum Bed Rise Before Open-Channel Choking',
  'Maximum bed rise before choking',
  'Critical Froude Number',
  'Available Energy Margin',
  'Water-Surface Change at Choking',
  'Specific-Energy Closure Residual',
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
  'trapezoidalMaximumBedRiseBeforeChoking',
  'direct test ID',
)

requireMarker(
  tests,
  'crest choking state has Froude number equal to one',
  'critical-flow test',
)

requireMarker(
  tests,
  'bed rise removes exactly the available specific-energy margin',
  'energy closure test',
)

requireMarker(
  tests,
  'rectangular limit matches analytical critical depth and energy',
  'rectangular limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumBedRiseBeforeChoking'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumBedRiseBeforeChoking"',
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
      'trapezoidalMaximumBedRiseBeforeChoking',
    )
) {
  throw new Error(
    'Calculator 436 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-max-bed-rise-choking-v1',
  'verify:trapezoidal-max-bed-rise-choking-v1',
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
    'verify:trapezoidal-max-bed-rise-choking-v1',
  )
) {
  throw new Error(
    'Calculator 436 is not in verify:release.',
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
  'PASS: Calculator 436 verifier.',
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
