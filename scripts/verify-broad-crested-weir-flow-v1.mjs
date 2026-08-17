import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  workbench,
  catalog,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/fluid-mechanics/broad-crested-weir-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/broad-crested-weir-flow/BroadCrestedWeirFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/broad-crested-weir-flow/broad-crested-weir-flow.test.ts',
    'utf8',
  ),
  readFile(
    'scripts/calculator-routing-contract-v1.txt',
    'utf8',
  ),
  readFile(
    'src/data/calculators.ts',
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
      `Calculator 427 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'BROAD_CRESTED_WEIR_FLOW_ENGINE_VERSION',
  'calculateBroadCrestedWeirFlow',
  'theoreticalCriticalDepth',
  'theoreticalCriticalFroudeNumber',
  'idealUnitDischarge',
  'recoveredUpstreamHead',
  'headClosureResidual',
  'createBroadCrestedWeirFlowCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–44',
  'Broad-Crested Weir Flow Rate',
  'Theoretical Critical Depth',
  'Theoretical Critical Froude Number',
  'Recovered Upstream Head',
  'Head Closure Residual',
  'Export calculation CSV',
]) {
  requireMarker(
    component,
    marker,
    'UI marker',
  )
}

requireMarker(
  tests,
  'broadCrestedWeirFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'theoretical crest state is critical',
  'critical-flow test',
)

requireMarker(
  tests,
  'recovers upstream head from corrected discharge',
  'head closure test',
)

requireMarker(
  tests,
  'flow follows the three-halves head power law',
  'head scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'broadCrestedWeirFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "broadCrestedWeirFlow"',
  'catalog ID',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'broadCrestedWeirFlow',
    )
) {
  throw new Error(
    'Calculator 427 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:broad-crested-weir-flow-v1',
  'verify:broad-crested-weir-flow-v1',
  'sync:verified-calculator-copy',
  'verify:verified-calculator-copy',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Missing package script: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:broad-crested-weir-flow-v1',
  )
) {
  throw new Error(
    'Calculator 427 is not in verify:release.',
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
    'Visible calculator-count verifier must remain last in verify:release.',
  )
}

console.log(
  'PASS: Calculator 427 verifier.',
)

console.log(
  `Catalog calculators: ${baseline.catalogCalculatorCount}`,
)

console.log(
  `Direct test signals: ${baseline.directTestSignals}`,
)

console.log(
  `Coverage gaps: ${baseline.withoutDirectTestSignal}`,
)
