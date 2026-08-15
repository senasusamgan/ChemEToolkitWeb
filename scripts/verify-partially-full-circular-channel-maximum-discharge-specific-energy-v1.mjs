import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelMaximumDischargeSpecificEnergy'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-maximum-discharge-specific-energy/partially-full-circular-channel-maximum-discharge-specific-energy.test.ts',
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
    'maximumDischarge',
    'criticalDepth',
    'targetSpecificEnergy',
    'criticalRelationResidual',
    'hydraulicPower',
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
    'criticalSpecificEnergyAtDepth',
    'circularGeometry',
    'Math.sqrt',
    'criticalRelationResidual',
    'froudeNumber',
    'ROOT_CONVERGENCE_FAILURE',
    'NO_PARTIAL_CRITICAL_CONTROL',
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
    'FM–87',
    'Partially Full Circular Channel Maximum Discharge for Specified Specific Energy',
    'Find maximum discharge',
    'Critical Depth',
    'Froude Number',
    'Hydraulic Power',
    'Export capacity CSV',
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
  'calculatePartiallyFullCircularChannelCriticalDepth',
  'Calculator 457 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator',
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
    'test:partially-full-circular-channel-maximum-discharge-specific-energy-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-maximum-discharge-specific-energy-v1'
  ]
) {
  throw new Error(
    'Calculator 470 package scripts are missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-maximum-discharge-specific-energy-v1',
  )
) {
  throw new Error(
    'Calculator 470 verifier is missing from verify:release.',
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
    'Coverage baseline does not match current catalog.',
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
    'Calculator 470 lacks direct-test coverage.',
  )
}


console.log(
  'PASS: circular-channel maximum discharge for specified specific energy v1 verifier.',
)
