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
    'src/features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/PartiallyFullCircularChannelHydraulicJumpCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-hydraulic-jump/partially-full-circular-channel-hydraulic-jump.test.ts',
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
      `Calculator 460 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_HYDRAULIC_JUMP_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelHydraulicJump',
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'hydrostaticFirstMoment',
    'specificForce',
    'momentumClosureResidual',
    'hydraulicPowerDissipated',
    'createPartiallyFullCircularChannelHydraulicJumpCsv',
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
    'FM–77',
    'Partially Full Circular Channel Hydraulic Jump',
    'Downstream conjugate depth',
    'Sequent Depth Ratio y₂/y₁',
    'Momentum Closure Residual',
    'Specific Energy Loss',
    'Force-Balance Residual',
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
  'partiallyFullCircularChannelHydraulicJump',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 457 critical depth lies between jump states',
  'Calculator 457 closure',
)

requireMarker(
  tests,
  'specific-force momentum function closes across the jump',
  'momentum closure',
)

requireMarker(
  tests,
  'hydrostatic-force increase closes momentum-flux change',
  'force balance closure',
)

requireMarker(
  tests,
  'rejects a jump whose conjugate depth would exceed the conduit crown',
  'crown-limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelHydraulicJump'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelHydraulicJump"',
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
      'partiallyFullCircularChannelHydraulicJump',
    )
) {
  throw new Error(
    'Calculator 460 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-hydraulic-jump-v1',
    'verify:partially-full-circular-channel-hydraulic-jump-v1',
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
    'verify:partially-full-circular-channel-hydraulic-jump-v1',
  )
) {
  throw new Error(
    'Calculator 460 is not in verify:release.',
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
  'PASS: Calculator 460 verifier.',
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
