import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelDirectStep'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-direct-step/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-direct-step/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-direct-step/PartiallyFullCircularChannelDirectStepCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-direct-step/partially-full-circular-channel-direct-step.test.ts',
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
    'PartiallyFullCircularChannelDirectStepInput',
    'state1FlowDepth',
    'state2FlowDepth',
    'averageFrictionSlope',
    'signedDistance',
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
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'CROSSES_CRITICAL_DEPTH',
    'NEAR_UNIFORM_DENOMINATOR',
    'frictionSlope',
    'specificEnergyChange',
    'bedSlopeMinusAverageFrictionSlope',
    'signedDistance',
    'energyClosureResidual',
    'Δx = (E₂ − E₁)/(S₀ − S̄f)',
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
    'FM–78',
    'Partially Full Circular Channel Direct-Step Method — GVF',
    'Solve direct-step reach',
    'Critical Depth',
    'Average Friction Slope',
    'Energy Closure Residual',
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
  'PartiallyFullCircularChannelDirectStepCalculator',
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
    'test:partially-full-circular-channel-direct-step-v1'
  ]
) {
  throw new Error(
    'Calculator 461 test package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:partially-full-circular-channel-direct-step-v1'
  ]
) {
  throw new Error(
    'Calculator 461 verifier package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-direct-step-v1',
  )
) {
  throw new Error(
    'Calculator 461 verifier is missing from verify:release.',
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
    'Coverage baseline catalog count does not match the live calculator catalog.',
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
    'Calculator 461 is still listed without a direct test signal.',
  )
}


console.log(
  'PASS: partially full circular channel direct-step v1 verifier.',
)
