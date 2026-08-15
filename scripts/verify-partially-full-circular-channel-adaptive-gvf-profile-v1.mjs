import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveGvfProfile'


const [
  types,
  engine,
  calculator,
  tests,
  catalog,
  categories,
  workbench,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/PartiallyFullCircularChannelAdaptiveGvfProfileCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-adaptive-gvf-profile/partially-full-circular-channel-adaptive-gvf-profile.test.ts',
    'utf8',
  ),

  readFile(
    'src/data/calculators.ts',
    'utf8',
  ),

  readFile(
    'src/data/categories.ts',
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
    'PartiallyFullCircularChannelAdaptiveGvfProfileInput',
    'absoluteTolerance',
    'relativeTolerance',
    'acceptedSteps',
    'rejectedSteps',
    'localErrorEstimate',
    'errorRatio',
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
    'calculatePartiallyFullCircularChannelGvfSlope',
    'adaptiveTrial',
    'rk4Step',
    'Richardson',
    'errorEstimate',
    'errorRatio',
    'TOLERANCE_NOT_ACHIEVABLE',
    'PROFILE_CROSSES_CRITICAL_DEPTH',
    'signedFrictionHeadChange',
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
    'FM–81',
    'Partially Full Circular Channel Adaptive GVF Profile — RK4',
    'Integrate adaptive profile',
    'Accepted Steps',
    'Rejected Steps',
    'Maximum Error Ratio',
    'Export adaptive profile CSV',
  ]
) {
  requireMarker(
    calculator,
    marker,
    'calculator UI marker',
  )
}


requireMarker(
  tests,
  calculatorId,
  'direct test signal',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelGvfProfile',
  'Calculator 463 cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelGvfSlope',
  'Calculator 462 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  categories,
  'name: "Fluid Mechanics"',
  'Fluid Mechanics category',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelAdaptiveGvfProfileCalculator',
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
    'test:partially-full-circular-channel-adaptive-gvf-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 464 test package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:partially-full-circular-channel-adaptive-gvf-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 464 verifier package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-adaptive-gvf-profile-v1',
  )
) {
  throw new Error(
    'Calculator 464 verifier is missing from verify:release.',
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
    'Coverage baseline catalog count does not match the current calculator catalog.',
  )
}


if (
  baseline.directTestSignals +
  baseline.withoutDirectTestSignal !==
  baseline.catalogCalculatorCount
) {
  throw new Error(
    'Coverage baseline direct-test and gap counts do not close to catalog count.',
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
    'Calculator 464 is still listed without a direct test signal.',
  )
}


console.log(
  'PASS: partially full circular channel adaptive GVF profile v1 verifier.',
)
