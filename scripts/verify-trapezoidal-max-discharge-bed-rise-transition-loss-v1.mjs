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
    'src/features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-discharge-bed-rise-transition-loss/trapezoidal-max-discharge-bed-rise-transition-loss.test.ts',
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
      `Calculator 447 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'TRAPEZOIDAL_MAXIMUM_DISCHARGE_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION',
    'calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss',
    'maximumVolumetricFlowRate',
    'losslessMaximumVolumetricFlowRate',
    'zeroBedRiseMaximumVolumetricFlowRate',
    'transitionLossFlowPenalty',
    'bedRiseFlowPenalty',
    'controlConditionResidual',
    'createTrapezoidalMaximumDischargeBedRiseTransitionLossCsv',
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
    'FM–64',
    'Maximum Discharge with Contraction, Bed Rise & Transition Loss',
    'Maximum volumetric flow rate',
    'Transition-Loss Flow Penalty',
    'Bed-Rise Flow Penalty',
    'Loss-Adjusted Control Froude',
    'Bed-Rise Potential Power',
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
  'trapezoidalMaximumDischargeBedRiseTransitionLoss',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 445 recovers the specified bed-rise threshold',
  'Calculator 445 inverse closure',
)

requireMarker(
  tests,
  'Calculator 446 recovers the specified contracted width',
  'Calculator 446 inverse closure',
)

requireMarker(
  tests,
  'zero bed rise recovers Calculator 443 maximum discharge',
  'Calculator 443 limiting case',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumDischargeBedRiseTransitionLoss'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumDischargeBedRiseTransitionLoss"',
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
      'trapezoidalMaximumDischargeBedRiseTransitionLoss',
    )
) {
  throw new Error(
    'Calculator 447 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:trapezoidal-max-discharge-bed-rise-transition-loss-v1',
    'verify:trapezoidal-max-discharge-bed-rise-transition-loss-v1',
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
    'verify:trapezoidal-max-discharge-bed-rise-transition-loss-v1',
  )
) {
  throw new Error(
    'Calculator 447 is not in verify:release.',
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
  'PASS: Calculator 447 verifier.',
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
