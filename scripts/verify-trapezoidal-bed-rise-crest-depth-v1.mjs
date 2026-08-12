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
    'src/features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/TrapezoidalChannelBedRiseCrestDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-bed-rise-crest-depth/trapezoidal-bed-rise-crest-depth.test.ts',
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
      `Calculator 437 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CHANNEL_BED_RISE_CREST_DEPTH_ENGINE_VERSION',
  'calculateTrapezoidalChannelBedRiseCrestDepth',
  'calculateTrapezoidalMaximumBedRiseBeforeChoking',
  'subcriticalCrestDepth',
  'supercriticalAlternateDepth',
  'remainingBedRiseMargin',
  'additionalSpecificEnergyRequired',
  'createTrapezoidalChannelBedRiseCrestDepthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–54',
  'Trapezoidal Channel Flow over a Bed Rise',
  'Maximum Bed Rise Before Choking',
  'Subcritical Crest Depth',
  'Supercritical Alternate Depth',
  'Additional Specific Energy Required',
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
  'trapezoidalChannelBedRiseCrestDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'both crest-depth branches satisfy the same specific-energy equation',
  'energy-root closure test',
)

requireMarker(
  tests,
  'exact maximum bed rise reaches the critical choking threshold',
  'critical threshold test',
)

requireMarker(
  tests,
  'bed rise above maximum is reported as choked',
  'choking test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalChannelBedRiseCrestDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalChannelBedRiseCrestDepth"',
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
      'trapezoidalChannelBedRiseCrestDepth',
    )
) {
  throw new Error(
    'Calculator 437 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-bed-rise-crest-depth-v1',
  'verify:trapezoidal-bed-rise-crest-depth-v1',
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
    'verify:trapezoidal-bed-rise-crest-depth-v1',
  )
) {
  throw new Error(
    'Calculator 437 is not in verify:release.',
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
  'PASS: Calculator 437 verifier.',
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
