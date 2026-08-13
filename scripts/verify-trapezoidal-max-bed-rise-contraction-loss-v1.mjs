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
    'src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/TrapezoidalMaximumBedRiseContractionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-bed-rise-contraction-loss/trapezoidal-max-bed-rise-contraction-loss.test.ts',
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
  if (
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Calculator 445 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MAXIMUM_BED_RISE_CONTRACTION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMaximumBedRiseContractionLoss',
    'calculateTrapezoidalContractionTransitionLoss',
    'maximumAllowableBedRise',
    'requiredBedLowering',
    'transitionLossDissipationPower',
    'exactThresholdEnergyResidual',
    'createTrapezoidalMaximumBedRiseContractionLossCsv',
  ]
) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (
  const marker of [
    'FM–62',
    'Maximum Bed Rise Through a Contraction with Transition Loss',
    'Maximum Allowable Bed Rise',
    'Required Bed Lowering',
    'Transition-Loss Head at Threshold',
    'Maximum Bed-Rise Potential Power',
    'Energy Closure Residual',
    'Export calculation CSV',
  ]
) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'trapezoidalMaximumBedRiseContractionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'zero transition loss increases the allowable bed rise',
  'lossless limit test',
)

requireMarker(
  tests,
  'larger transition loss reduces allowable bed rise',
  'loss trend test',
)

requireMarker(
  tests,
  'already choked contraction reports required bed lowering',
  'bed-lowering test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumBedRiseContractionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumBedRiseContractionLoss"',
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
      'trapezoidalMaximumBedRiseContractionLoss',
    )
) {
  throw new Error(
    'Calculator 445 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-max-bed-rise-contraction-loss-v1',
    'verify:trapezoidal-max-bed-rise-contraction-loss-v1',
    'sync:verified-calculator-copy',
    'verify:verified-calculator-copy',
  ]
) {
  if (
    !pkg.scripts[
      scriptName
    ]
  ) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:trapezoidal-max-bed-rise-contraction-loss-v1',
  )
) {
  throw new Error(
    'Calculator 445 is not in verify:release.',
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
  'PASS: Calculator 445 verifier.',
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
