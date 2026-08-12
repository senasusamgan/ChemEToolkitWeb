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
    'src/features/fluid-mechanics/trapezoidal-contraction-throat-analysis/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-contraction-throat-analysis/TrapezoidalContractionThroatAnalysisCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-contraction-throat-analysis/trapezoidal-contraction-throat-analysis.test.ts',
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
      `Calculator 440 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_CONTRACTION_THROAT_ANALYSIS_ENGINE_VERSION',
  'calculateTrapezoidalContractionThroatAnalysis',
  'calculateTrapezoidalChannelCriticalDepth',
  'calculateTrapezoidalMaximumDischargeSpecificEnergy',
  'calculateTrapezoidalMinimumContractionWidth',
  'subcriticalThroatDepth',
  'supercriticalAlternateDepth',
  'maximumPassableFlowAtAvailableEnergy',
  'createTrapezoidalContractionThroatAnalysisCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–57',
  'Trapezoidal Contraction Throat & Choking Analysis',
  'Minimum Contracted Width',
  'Subcritical Throat Depth',
  'Supercritical Alternate Depth',
  'Maximum Passable Flow',
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
  'trapezoidalContractionThroatAnalysis',
  'direct test ID',
)

requireMarker(
  tests,
  'both throat roots close to the upstream specific energy',
  'energy closure test',
)

requireMarker(
  tests,
  'width equal to Calculator 439 limit reaches critical contraction threshold',
  'critical width test',
)

requireMarker(
  tests,
  'width below choking limit is reported as choked',
  'choking detection test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalContractionThroatAnalysis'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalContractionThroatAnalysis"',
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
      'trapezoidalContractionThroatAnalysis',
    )
) {
  throw new Error(
    'Calculator 440 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-contraction-throat-analysis-v1',
  'verify:trapezoidal-contraction-throat-analysis-v1',
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
    'verify:trapezoidal-contraction-throat-analysis-v1',
  )
) {
  throw new Error(
    'Calculator 440 is not in verify:release.',
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
  'PASS: Calculator 440 verifier.',
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
