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
    'src/features/fluid-mechanics/variable-area-rotameter-flow/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/variable-area-rotameter-flow/VariableAreaRotameterFlowCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/variable-area-rotameter-flow/variable-area-rotameter-flow.test.ts',
    'utf8',
  ),
  readFile(
    'src/components/CalculatorWorkbench.tsx',
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
      `Calculator 412 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'VARIABLE_AREA_ROTAMETER_FLOW_ENGINE_VERSION',
  'calculateVariableAreaRotameterFlow',
  'effectiveFloatWeight',
  'equilibriumVelocity',
  'dragForce',
  'forceBalanceResidual',
  'createVariableAreaRotameterFlowCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–29',
  'Variable-Area Rotameter Flow Rate',
  'Equilibrium Annular Velocity',
  'Effective Float Weight',
  'Drag Force',
  'Force-Balance Residual',
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
  'variableAreaRotameterFlow',
  'direct test ID',
)

requireMarker(
  tests,
  'closes the float drag and effective-weight force balance',
  'physical force-balance test',
)

requireMarker(
  tests,
  'annular area scales flow linearly without changing equilibrium velocity',
  'area scaling test',
)

requireMarker(
  workbench,
  "calculatorId === 'variableAreaRotameterFlow'",
  'route',
)

requireMarker(
  catalog,
  'id: "variableAreaRotameterFlow"',
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
      'variableAreaRotameterFlow',
    )
) {
  throw new Error(
    'Calculator 412 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:variable-area-rotameter-flow-v1',
  'verify:variable-area-rotameter-flow-v1',
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
    'verify:variable-area-rotameter-flow-v1',
  )
) {
  throw new Error(
    'Calculator 412 is not in verify:release.',
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
  'PASS: Calculator 412 verifier.',
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
