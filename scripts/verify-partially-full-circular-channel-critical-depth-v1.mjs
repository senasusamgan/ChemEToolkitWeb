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
    'src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/PartiallyFullCircularChannelCriticalDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-critical-depth/partially-full-circular-channel-critical-depth.test.ts',
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
      `Calculator 457 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_CRITICAL_DEPTH_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'criticalConditionResidual',
    'criticalWaveCelerity',
    'criticalSpecificEnergy',
    'dischargePerUnitTopWidth',
    'createPartiallyFullCircularChannelCriticalDepthCsv',
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
    'FM–74',
    'Partially Full Circular Channel Critical Depth',
    'Critical Depth Ratio y/D',
    'Gravity-Wave Celerity',
    'Critical Froude Number',
    'Minimum Specific Energy',
    'Critical-Condition Residual',
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
  'partiallyFullCircularChannelCriticalDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'critical Froude number and wave-speed closure equal unity',
  'Froude closure',
)

requireMarker(
  tests,
  'critical condition Q squared T over g A cubed closes to one',
  'critical-condition closure',
)

requireMarker(
  tests,
  'critical depth corresponds to minimum specific energy',
  'specific-energy minimum test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelCriticalDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelCriticalDepth"',
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
      'partiallyFullCircularChannelCriticalDepth',
    )
) {
  throw new Error(
    'Calculator 457 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-critical-depth-v1',
    'verify:partially-full-circular-channel-critical-depth-v1',
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
    'verify:partially-full-circular-channel-critical-depth-v1',
  )
) {
  throw new Error(
    'Calculator 457 is not in verify:release.',
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
  'PASS: Calculator 457 verifier.',
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
