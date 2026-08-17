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
    'src/features/fluid-mechanics/partially-full-circular-channel-alternate-depths/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-alternate-depths/PartiallyFullCircularChannelAlternateDepthsCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-alternate-depths/partially-full-circular-channel-alternate-depths.test.ts',
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
      `Calculator 458 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_ALTERNATE_DEPTHS_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelAlternateDepths',
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'criticalSpecificEnergy',
    'fullDepthLimitSpecificEnergy',
    'solutionMultiplicity',
    'deepSolution',
    'createPartiallyFullCircularChannelAlternateDepthsCsv',
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
    'FM–75',
    'Partially Full Circular Channel Alternate Depths from Specific Energy',
    'Shallow alternate depth',
    'Solution Multiplicity',
    'Critical Specific Energy',
    'Deep Alternate Depth',
    'Alternate Depth Separation',
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
  'partiallyFullCircularChannelAlternateDepths',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 457 critical state separates the two alternate roots',
  'Calculator 457 closure',
)

requireMarker(
  tests,
  'both alternate roots recover the specified energy',
  'energy closure test',
)

requireMarker(
  tests,
  'critical specific energy collapses the alternate roots into one critical depth',
  'critical-limit test',
)

requireMarker(
  tests,
  'specific energy above the crown-limit energy has only one partial-depth root',
  'crown-limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelAlternateDepths'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelAlternateDepths"',
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
      'partiallyFullCircularChannelAlternateDepths',
    )
) {
  throw new Error(
    'Calculator 458 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-alternate-depths-v1',
    'verify:partially-full-circular-channel-alternate-depths-v1',
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
    'verify:partially-full-circular-channel-alternate-depths-v1',
  )
) {
  throw new Error(
    'Calculator 458 is not in verify:release.',
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
  'PASS: Calculator 458 verifier.',
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
