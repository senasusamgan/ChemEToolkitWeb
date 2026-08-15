import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveStandardStepProfile'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-adaptive-standard-step-profile/partially-full-circular-channel-adaptive-standard-step-profile.test.ts',
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
    'PartiallyFullCircularChannelAdaptiveStandardStepProfileInput',
    'absoluteTolerance',
    'relativeTolerance',
    'acceptedReaches',
    'rejectedTrials',
    'localErrorEstimate',
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
    'calculatePartiallyFullCircularChannelStandardStep',
    'calculatePartiallyFullCircularChannelGvfSlope',
    'adaptiveTrial',
    'localErrorEstimate',
    'errorRatio',
    'TOLERANCE_NOT_ACHIEVABLE',
    'signedFrictionHeadChange',
    'energyClosureResidual',
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
    'FM–84',
    'Partially Full Circular Channel Adaptive Standard-Step GVF Profile',
    'Solve adaptive standard-step profile',
    'Accepted Reaches',
    'Rejected Trials',
    'Maximum Error Ratio',
    'Export adaptive profile CSV',
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
  'calculatePartiallyFullCircularChannelStandardStepProfile',
  'Calculator 466 cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelGvfProfile',
  'Calculator 463 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator',
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
    'test:partially-full-circular-channel-adaptive-standard-step-profile-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-adaptive-standard-step-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 467 package scripts are missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-adaptive-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 467 verifier is missing from verify:release.',
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
    'Calculator 467 lacks direct-test coverage.',
  )
}


console.log(
  'PASS: circular-channel adaptive standard-step profile v1 verifier.',
)
