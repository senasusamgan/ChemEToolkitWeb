import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelStandardStepProfile'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/PartiallyFullCircularChannelStandardStepProfileCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-standard-step-profile/partially-full-circular-channel-standard-step-profile.test.ts',
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
    'PartiallyFullCircularChannelStandardStepProfileInput',
    'PartiallyFullCircularChannelStandardStepProfilePoint',
    'profilePoints',
    'maximumSegmentEnergyResidual',
    'totalRootIterations',
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
    'numberOfReaches',
    'actualReachLength',
    'signedFrictionHeadChange',
    'maximumSegmentEnergyResidual',
    'STANDARD_STEP_FAILURE',
    'TOO_MANY_REACHES',
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
    'FM–83',
    'Partially Full Circular Channel Multi-Reach Standard-Step GVF Profile',
    'Solve multi-reach profile',
    'Number of Reaches',
    'Global Energy Residual',
    'Export profile CSV',
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
  'calculatePartiallyFullCircularChannelStandardStep',
  'Calculator 465 chaining cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelGvfProfile',
  'Calculator 463 RK4 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelStandardStepProfileCalculator',
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
    'test:partially-full-circular-channel-standard-step-profile-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-standard-step-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 466 package scripts missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-standard-step-profile-v1',
  )
) {
  throw new Error(
    'Calculator 466 verifier missing from release.',
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
    'Coverage baseline does not match live catalog.',
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
    'Calculator 466 lacks direct-test coverage.',
  )
}


console.log(
  'PASS: circular-channel multi-reach standard-step profile v1 verifier.',
)
