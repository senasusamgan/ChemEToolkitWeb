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
    'src/features/fluid-mechanics/partially-full-circular-channel-normal-depth/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-normal-depth/PartiallyFullCircularChannelNormalDepthCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-normal-depth/partially-full-circular-channel-normal-depth.test.ts',
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
      `Calculator 456 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_NORMAL_DEPTH_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelNormalDepth',
    'calculatePartiallyFullCircularChannelManningFlow',
    'findMaximumCapacityDepth',
    'maximumPartialFlowCapacity',
    'solutionMultiplicity',
    'deepSolution',
    'createPartiallyFullCircularChannelNormalDepthCsv',
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
    'FM–73',
    'Partially Full Circular Channel Normal Depth — Manning',
    'Shallow normal depth',
    'Solution Multiplicity',
    'Deep Normal Depth',
    'Maximum Partial-Flow Capacity',
    'Qmax / Qfull',
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
  'partiallyFullCircularChannelNormalDepth',
  'direct test ID',
)

requireMarker(
  tests,
  'Calculator 455 forward model closes the solved shallow normal depth',
  'Calculator 455 closure',
)

requireMarker(
  tests,
  'returns two normal depths between full-flow and maximum partial-flow capacity',
  'dual-depth test',
)

requireMarker(
  tests,
  'both dual normal-depth roots close Calculator 455 forward flow',
  'dual forward closure',
)

requireMarker(
  tests,
  'rejects flow above maximum free-surface Manning capacity',
  'capacity-limit test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelNormalDepth'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelNormalDepth"',
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
      'partiallyFullCircularChannelNormalDepth',
    )
) {
  throw new Error(
    'Calculator 456 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-normal-depth-v1',
    'verify:partially-full-circular-channel-normal-depth-v1',
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
    'verify:partially-full-circular-channel-normal-depth-v1',
  )
) {
  throw new Error(
    'Calculator 456 is not in verify:release.',
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
  'PASS: Calculator 456 verifier.',
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
