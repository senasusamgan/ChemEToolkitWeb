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
    'src/features/fluid-mechanics/trapezoidal-min-contraction-width/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-min-contraction-width/TrapezoidalMinimumContractionWidthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-min-contraction-width/trapezoidal-min-contraction-width.test.ts',
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
      `Calculator 439 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_MINIMUM_CONTRACTION_WIDTH_ENGINE_VERSION',
  'calculateTrapezoidalMinimumContractionWidth',
  'calculateTrapezoidalCriticalControlWidth',
  'minimumContractedBottomWidth',
  'contractionRatio',
  'criticalThroatFroudeNumber',
  'reconstructedCriticalCapacity',
  'energyClosureResidual',
  'createTrapezoidalMinimumContractionWidthCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–56',
  'Minimum Contracted Width Before Choking',
  'Minimum contracted bottom width',
  'Contraction Ratio',
  'Critical Throat Froude Number',
  'Reconstructed Critical Capacity',
  'Energy Closure Residual',
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
  'trapezoidalMinimumContractionWidth',
  'direct test ID',
)

requireMarker(
  tests,
  'critical contraction throat operates at Froude number one',
  'critical-throat test',
)

requireMarker(
  tests,
  'Calculator 435 forward capacity closes to the design flow',
  'forward closure test',
)

requireMarker(
  tests,
  'rectangular-channel limit matches analytical contraction width',
  'rectangular limit test',
)

requireMarker(
  tests,
  'more upstream specific energy permits a narrower contraction',
  'design trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMinimumContractionWidth'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMinimumContractionWidth"',
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
      'trapezoidalMinimumContractionWidth',
    )
) {
  throw new Error(
    'Calculator 439 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-min-contraction-width-v1',
  'verify:trapezoidal-min-contraction-width-v1',
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
    'verify:trapezoidal-min-contraction-width-v1',
  )
) {
  throw new Error(
    'Calculator 439 is not in verify:release.',
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
  'PASS: Calculator 439 verifier.',
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
