import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile'


const [
  types,
  engine,
  calculator,
  tests,
  catalog,
  workbench,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-adaptive-upstream-standard-step-profile/partially-full-circular-channel-adaptive-upstream-standard-step-profile.test.ts',
    'utf8',
  ),

  readFile(
    'src/data/calculators.ts',
    'utf8',
  ),

  readFile(
    'src/components/CalculatorWorkbench.tsx',
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
      `${label} missing: ${marker}`,
    )
  }
}


for (
  const marker of [
    'downstreamBoundaryDepth',
    'upstreamProfileLength',
    'acceptedReaches',
    'rejectedTrials',
    'maximumAcceptedErrorRatio',
    'upstreamDistance',
  ]
) {
  requireMarker(
    types,
    marker,
    'types marker',
  )
}


for (
  const marker of [
    'calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile',
    '-input.upstreamProfileLength',
    'mapPoint',
    'totalHeadRiseMovingUpstream',
    'energyClosureResidual',
    'PROFILE_SOLVER_FAILURE',
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
    'FM–86',
    'Partially Full Circular Channel Adaptive Upstream Standard-Step GVF Profile',
    'Solve adaptive upstream profile',
    'Accepted Reaches',
    'Maximum Error Ratio',
    'Total Head Rise Moving Upstream',
    'Export adaptive upstream profile CSV',
  ]
) {
  requireMarker(
    calculator,
    marker,
    'UI marker',
  )
}


requireMarker(
  tests,
  calculatorId,
  'direct test signal',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile',
  'Calculator 467 cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelUpstreamStandardStepProfile',
  'Calculator 468 cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelAdaptiveGvfProfile',
  'Calculator 464 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator',
  'workbench import',
)


requireMarker(
  workbench,
  `calculatorId === '${calculatorId}'`,
  'workbench route',
)


const pkg =
  JSON.parse(
    packageSource,
  )


if (
  !pkg.scripts[
    'test:partially-full-circular-channel-adaptive-upstream-standard-step-profile-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-adaptive-upstream-standard-step-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 469 package scripts are missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-adaptive-upstream-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 469 verifier is missing from verify:release.',
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
    'Visible calculator-count verifier must remain last.',
  )
}


const baseline =
  JSON.parse(
    baselineSource,
  )


const catalogCount =
  Array.from(
    catalog.matchAll(
      /\{\s*id:\s*"[^"]+"/g,
    ),
  ).length


if (
  baseline.catalogCalculatorCount !==
  catalogCount
) {
  throw new Error(
    'Coverage baseline does not match the current catalog.',
  )
}


if (
  baseline.directTestSignals +
  baseline.withoutDirectTestSignal !==
  baseline.catalogCalculatorCount
) {
  throw new Error(
    'Coverage baseline counts do not close.',
  )
}


if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      calculatorId,
    )
) {
  throw new Error(
    'Calculator 469 lacks direct-test coverage.',
  )
}


console.log(
  'PASS: circular-channel adaptive upstream standard-step profile v1 verifier.',
)
