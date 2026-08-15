import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelGvfSlope'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/PartiallyFullCircularChannelGvfSlopeCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-gvf-slope/partially-full-circular-channel-gvf-slope.test.ts',
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
    'PartiallyFullCircularChannelGvfSlopeInput',
    'froudeDenominator',
    'depthGradient',
    'depthChangePer100m',
    'criticalDepth',
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
    'NEAR_CRITICAL_FLOW',
    'frictionSlope',
    'slopeNumerator',
    'froudeDenominator',
    'depthGradient',
    '1 − Fr²',
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
    'FM–79',
    'Partially Full Circular Channel GVF Differential Slope',
    'Evaluate GVF slope',
    'Depth Change per 100 m',
    'Froude Number',
    'Friction Slope',
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
  'calculatePartiallyFullCircularChannelDirectStep',
  'Calculator 461 cross-check',
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
  'PartiallyFullCircularChannelGvfSlopeCalculator',
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
    'test:partially-full-circular-channel-gvf-slope-v1'
  ]
) {
  throw new Error(
    'Calculator 462 test package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:partially-full-circular-channel-gvf-slope-v1'
  ]
) {
  throw new Error(
    'Calculator 462 verifier package script is missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-gvf-slope-v1',
  )
) {
  throw new Error(
    'Calculator 462 verifier is missing from verify:release.',
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
    'Coverage baseline direct-test and gap counts do not close to the catalog count.',
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
    'Calculator 462 is still listed without a direct test signal.',
  )
}


console.log(
  'PASS: partially full circular channel GVF slope v1 verifier.',
)
