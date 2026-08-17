import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelCapacityChokingMargin'


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
    'src/features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/types.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/PartiallyFullCircularChannelCapacityChokingMarginCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-capacity-choking-margin/partially-full-circular-channel-capacity-choking-margin.test.ts',
    'utf8',
  ),

  readFile(
    'src/data/calculators.ts',
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
    'maximumDischarge',
    'dischargeMargin',
    'minimumRequiredSpecificEnergy',
    'specificEnergyMargin',
    'chokingMarginIndex',
    'capacityState',
    'inverseDischargeResidual',
    'inverseEnergyResidual',
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
    'calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy',
    'calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy',
    'Adequate capacity margin',
    'At choking limit',
    'Insufficient energy — choking risk',
    'inverseDischargeResidual',
    'inverseEnergyResidual',
    'hydraulicPowerMargin',
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
    'FM–90',
    'Partially Full Circular Channel Capacity & Choking Margin',
    'Evaluate choking margin',
    'Capacity Utilization',
    'Specific Energy Margin',
    'Hydraulic Power Margin',
    'Export margin analysis CSV',
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
  'calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy',
  'Calculator 470 cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy',
  'Calculator 472 cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelCapacityChokingMarginCalculator',
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
    'test:partially-full-circular-channel-capacity-choking-margin-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-capacity-choking-margin-v1'
  ]
) {
  throw new Error(
    'Calculator 473 package scripts are missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-capacity-choking-margin-v1',
  )
) {
  throw new Error(
    'Calculator 473 verifier is missing from verify:release.',
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
    'Calculator 473 lacks direct-test coverage.',
  )
}


console.log(
  'PASS: circular-channel capacity and choking margin v1 verifier.',
)
