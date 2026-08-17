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
    'src/features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/TrapezoidalMaximumDischargeSpecificEnergyCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/trapezoidal-max-discharge-specific-energy/trapezoidal-max-discharge-specific-energy.test.ts',
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
      `Calculator 434 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'TRAPEZOIDAL_MAXIMUM_DISCHARGE_SPECIFIC_ENERGY_ENGINE_VERSION',
  'calculateTrapezoidalMaximumDischargeSpecificEnergy',
  'calculateTrapezoidalChannelCriticalDepth',
  'criticalVelocity',
  'maximumVolumetricFlowRate',
  'specificEnergyResidual',
  'criticalConditionResidual',
  'criticalDepthClosureResidual',
  'createTrapezoidalMaximumDischargeSpecificEnergyCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'FM–51',
  'Maximum Trapezoidal Discharge from Specific Energy',
  'Maximum volumetric flow rate',
  'Critical Froude Number',
  'Critical Condition Residual',
  'Forward Critical Depth',
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
  'trapezoidalMaximumDischargeSpecificEnergy',
  'direct test ID',
)

requireMarker(
  tests,
  'critical control section has Froude number equal to one',
  'critical-flow test',
)

requireMarker(
  tests,
  'rectangular limit matches the analytical two-thirds-energy critical depth',
  'rectangular limit test',
)

requireMarker(
  tests,
  'closes the general trapezoidal critical-flow condition',
  'critical closure test',
)

requireMarker(
  workbench,
  "calculatorId === 'trapezoidalMaximumDischargeSpecificEnergy'",
  'route',
)

requireMarker(
  catalog,
  'id: "trapezoidalMaximumDischargeSpecificEnergy"',
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
      'trapezoidalMaximumDischargeSpecificEnergy',
    )
) {
  throw new Error(
    'Calculator 434 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:trapezoidal-max-discharge-specific-energy-v1',
  'verify:trapezoidal-max-discharge-specific-energy-v1',
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
    'verify:trapezoidal-max-discharge-specific-energy-v1',
  )
) {
  throw new Error(
    'Calculator 434 is not in verify:release.',
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
  'PASS: Calculator 434 verifier.',
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
