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
    'src/features/fluid-mechanics/partially-full-circular-channel-manning-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-manning-flow/PartiallyFullCircularChannelManningFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/partially-full-circular-channel-manning-flow/partially-full-circular-channel-manning-flow.test.ts',
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
      `Calculator 455 ${label} missing: ${marker}`,
    )
  }
}

for (
  const marker of [
    'PARTIALLY_FULL_CIRCULAR_CHANNEL_MANNING_FLOW_ENGINE_VERSION',
    'calculatePartiallyFullCircularChannelManningFlow',
    'centralAngleRadians',
    'hydraulicRadius',
    'flowRateRatioToFull',
    'averageBoundaryShearStress',
    'hydraulicPowerDissipationPerUnitLength',
    'createPartiallyFullCircularChannelManningFlowCsv',
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
    'FM–72',
    'Partially Full Circular Channel Flow — Manning',
    'Volumetric flow rate',
    'Depth Ratio y/D',
    'Full-Flow Manning Capacity',
    'Average Boundary Shear Stress',
    'Hydraulic Power Dissipation / Length',
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
  'partiallyFullCircularChannelManningFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'half-full section carries exactly half the full Manning flow at equal velocity',
  'half-full analytical closure',
)

requireMarker(
  tests,
  'deep partially full channel can exceed nominal full-flow Manning capacity',
  'deep-flow capacity test',
)

requireMarker(
  tests,
  'Manning flow scales with square root of slope',
  'Manning slope scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'partiallyFullCircularChannelManningFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "partiallyFullCircularChannelManningFlow"',
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
      'partiallyFullCircularChannelManningFlow',
    )
) {
  throw new Error(
    'Calculator 455 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (
  const scriptName of [
    'test:partially-full-circular-channel-manning-flow-v1',
    'verify:partially-full-circular-channel-manning-flow-v1',
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
    'verify:partially-full-circular-channel-manning-flow-v1',
  )
) {
  throw new Error(
    'Calculator 455 is not in verify:release.',
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
  'PASS: Calculator 455 verifier.',
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
