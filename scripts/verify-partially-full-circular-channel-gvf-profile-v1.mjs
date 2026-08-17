import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelGvfProfile'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/PartiallyFullCircularChannelGvfProfileCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-gvf-profile/partially-full-circular-channel-gvf-profile.test.ts',
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
    'scripts/calculator-routing-contract-v1.txt',
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
    'PartiallyFullCircularChannelGvfProfileInput',
    'PartiallyFullCircularChannelGvfProfilePoint',
    'profilePoints',
    'energyClosureResidual',
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
    'PROFILE_APPROACHES_CRITICAL_FLOW',
    'PROFILE_CROSSES_CRITICAL_DEPTH',
    'TOO_MANY_STEPS',
    'k1',
    'k2',
    'k3',
    'k4',
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
    'FM–80',
    'Partially Full Circular Channel GVF Profile — RK4',
    'Integrate RK4 profile',
    'Final Flow Depth',
    'Energy Closure Residual',
    'Export profile CSV',
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
  'PartiallyFullCircularChannelGvfProfileCalculator',
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
    'test:partially-full-circular-channel-gvf-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 463 test package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:partially-full-circular-channel-gvf-profile-v1'
  ]
) {
  throw new Error(
    'Calculator 463 verifier package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-gvf-profile-v1',
  )
) {
  throw new Error(
    'Calculator 463 verifier is missing from verify:release.',
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
    'Calculator 463 is still listed without a direct test signal.',
  )
}


console.log(
  'PASS: partially full circular channel GVF profile RK4 v1 verifier.',
)
