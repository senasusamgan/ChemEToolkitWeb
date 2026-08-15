import {
  readFile,
} from 'node:fs/promises'


const calculatorId =
  'partiallyFullCircularChannelStandardStep'


const [
  engine,
  calculator,
  tests,
  catalog,
  workbench,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-standard-step/engine.ts',
    'utf8',
  ),

  readFile(
    'src/features/fluid-mechanics/partially-full-circular-channel-standard-step/PartiallyFullCircularChannelStandardStepCalculator.tsx',
    'utf8',
  ),

  readFile(
    'tests/partially-full-circular-channel-standard-step/partially-full-circular-channel-standard-step.test.ts',
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
  if (!source.includes(marker)) {
    throw new Error(
      `${label} missing: ${marker}`,
    )
  }
}


for (
  const marker of [
    'calculatePartiallyFullCircularChannelCriticalDepth',
    'calculatePartiallyFullCircularChannelGvfSlope',
    'localLinearDepthPrediction',
    'averageFrictionSlope',
    'equivalentDirectStepDistance',
    'rootCandidatesFound',
    'NO_PHYSICAL_ROOT',
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
    'FM–82',
    'Partially Full Circular Channel Standard-Step Method',
    'Solve standard step',
    'Equivalent Direct-Step Distance',
    'Root Candidates',
    'Export standard-step CSV',
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
  'calculatePartiallyFullCircularChannelDirectStep',
  'Calculator 461 inverse cross-check',
)


requireMarker(
  tests,
  'calculatePartiallyFullCircularChannelGvfProfile',
  'Calculator 463 profile cross-check',
)


requireMarker(
  catalog,
  `id: "${calculatorId}"`,
  'catalog integration',
)


requireMarker(
  workbench,
  'PartiallyFullCircularChannelStandardStepCalculator',
  'workbench import',
)


requireMarker(
  workbench,
  `calculatorId === '${calculatorId}'`,
  'workbench routing',
)


const pkg =
  JSON.parse(packageSource)


if (
  !pkg.scripts[
    'test:partially-full-circular-channel-standard-step-v1'
  ] ||
  !pkg.scripts[
    'verify:partially-full-circular-channel-standard-step-v1'
  ]
) {
  throw new Error(
    'Calculator 465 package scripts missing.',
  )
}


if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:partially-full-circular-channel-standard-step-v1',
  )
) {
  throw new Error(
    'Calculator 465 verifier missing from release.',
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
    'Visible calculator verifier must remain last.',
  )
}


const baseline =
  JSON.parse(baselineSource)


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
    'Coverage counts do not close.',
  )
}


if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(calculatorId)
) {
  throw new Error(
    'Calculator 465 lacks direct test coverage.',
  )
}


console.log(
  'PASS: circular-channel standard-step v1 verifier.',
)
