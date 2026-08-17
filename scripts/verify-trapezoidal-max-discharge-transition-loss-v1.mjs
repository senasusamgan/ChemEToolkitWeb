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
    'src/features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/TrapezoidalMaximumDischargeTransitionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-discharge-transition-loss/trapezoidal-max-discharge-transition-loss.test.ts',
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
  if (
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Calculator 443 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MAXIMUM_DISCHARGE_TRANSITION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMaximumDischargeTransitionLoss',
    'calculateTrapezoidalMaximumDischargeSpecificEnergy',
    'calculateTrapezoidalContractionTransitionLoss',
    'maximumVolumetricFlowRate',
    'losslessMaximumVolumetricFlowRate',
    'transitionLossFlowPenalty',
    'backCalculatedMaximumTransitionLossCoefficient',
    'forwardWidthClosureResidual',
    'createTrapezoidalMaximumDischargeTransitionLossCsv',
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
    'FM–60',
    'Maximum Discharge Through a Contraction with Transition Loss',
    'Maximum volumetric flow rate',
    'Transition-Loss Flow Penalty',
    'Loss-Adjusted Control Froude',
    'Back-Calculated Maximum Kₗ',
    'Maximum Dissipation Power',
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
  'trapezoidalMaximumDischargeTransitionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 442 inversely recovers the specified transition-loss coefficient',
  'inverse closure test',
)

requireMarker(
  tests,
  'zero transition loss gives the lossless contraction capacity',
  'lossless limit test',
)

requireMarker(
  tests,
  'larger transition loss reduces maximum discharge',
  'loss trend test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumDischargeTransitionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumDischargeTransitionLoss"',
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
      'trapezoidalMaximumDischargeTransitionLoss',
    )
) {
  throw new Error(
    'Calculator 443 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-max-discharge-transition-loss-v1',
    'verify:trapezoidal-max-discharge-transition-loss-v1',
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
    'verify:trapezoidal-max-discharge-transition-loss-v1',
  )
) {
  throw new Error(
    'Calculator 443 is not in verify:release.',
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
  'PASS: Calculator 443 verifier.',
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
