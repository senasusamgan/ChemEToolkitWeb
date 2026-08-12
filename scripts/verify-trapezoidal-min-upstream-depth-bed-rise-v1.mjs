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
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/TrapezoidalMinimumUpstreamDepthBedRiseCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-min-upstream-depth-bed-rise/trapezoidal-min-upstream-depth-bed-rise.test.ts',
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
      `Calculator 438 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_BED_RISE_ENGINE_VERSION',
  'calculateTrapezoidalMinimumUpstreamDepthBedRise',
  'calculateTrapezoidalChannelCriticalDepth',
  'calculateTrapezoidalChannelAlternateDepth',
  'calculateTrapezoidalMaximumBedRiseBeforeChoking',
  'minimumSubcriticalUpstreamDepth',
  'alternateSupercriticalDepth',
  'bedRiseClosureResidual',
  'createTrapezoidalMinimumUpstreamDepthBedRiseCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–55',
  'Minimum Upstream Depth for a Bed Rise',
  'Minimum subcritical upstream depth',
  'Alternate Supercritical Depth',
  'Forward Maximum Bed Rise',
  'Bed-Rise Closure Residual',
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
  'trapezoidalMinimumUpstreamDepthBedRise',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 436 forward choking result closes to specified bed rise',
  'forward choking closure test',
)

requireMarker(
  tests,
  'both alternate-depth branches close to required upstream energy',
  'energy closure test',
)

requireMarker(
  tests,
  'a taller hump requires a deeper upstream subcritical state',
  'design trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMinimumUpstreamDepthBedRise'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMinimumUpstreamDepthBedRise"',
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
      'trapezoidalMinimumUpstreamDepthBedRise',
    )
) {
  throw new Error(
    'Calculator 438 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-min-upstream-depth-bed-rise-v1',
  'verify:trapezoidal-min-upstream-depth-bed-rise-v1',
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
    'verify:trapezoidal-min-upstream-depth-bed-rise-v1',
  )
) {
  throw new Error(
    'Calculator 438 is not in verify:release.',
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
  'PASS: Calculator 438 verifier.',
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
