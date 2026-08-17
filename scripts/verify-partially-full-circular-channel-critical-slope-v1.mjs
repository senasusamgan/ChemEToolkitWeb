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
    'src/features/fluid-mechanics/partially-full-circular-channel-critical-slope/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-critical-slope/PartiallyFullCircularChannelCriticalSlopeCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-critical-slope/partially-full-circular-channel-critical-slope.test.ts',
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
      `Calculator 459 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_CRITICAL_SLOPE_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelCriticalSlope',
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'criticalSlope',
    'manningConveyance',
    'fullFlowCapacityAtCriticalSlope',
    'averageBoundaryShearStress',
    'createPartiallyFullCircularChannelCriticalSlopeCsv',
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
    'FM–76',
    'Partially Full Circular Channel Critical Slope — Manning',
    'Critical channel slope',
    'Critical Slope',
    'Manning Conveyance',
    'Full-Flow Capacity at Critical Slope',
    'Slope Classification',
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
  'partiallyFullCircularChannelCriticalSlope',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 457 critical geometry is preserved exactly',
  'Calculator 457 closure',
)

requireMarker(
  tests,
  'Calculator 455 Manning flow closes at the critical depth and slope',
  'Calculator 455 closure',
)

requireMarker(
  tests,
  'Calculator 456 normal depth equals critical depth at critical slope',
  'Calculator 456 closure',
)

requireMarker(
  tests,
  'critical slope scales with Manning roughness squared',
  'roughness scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelCriticalSlope'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelCriticalSlope"',
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
      'partiallyFullCircularChannelCriticalSlope',
    )
) {
  throw new Error(
    'Calculator 459 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-critical-slope-v1',
    'verify:partially-full-circular-channel-critical-slope-v1',
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
    'verify:partially-full-circular-channel-critical-slope-v1',
  )
) {
  throw new Error(
    'Calculator 459 is not in verify:release.',
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
  'PASS: Calculator 459 verifier.',
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
