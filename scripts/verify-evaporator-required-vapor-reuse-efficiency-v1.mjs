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
    'src/features/material-energy-balances/evaporator-required-vapor-reuse-efficiency/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/evaporator-required-vapor-reuse-efficiency/EvaporatorRequiredVaporReuseEfficiencyCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/evaporator-required-vapor-reuse-efficiency/evaporator-required-vapor-reuse-efficiency.test.ts',
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
  if (
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Calculator 400 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'EVAPORATOR_REQUIRED_VAPOR_REUSE_EFFICIENCY_ENGINE_VERSION',
  'calculateMultipleEffectEvaporatorSteamEconomy',
  'calculateEvaporatorRequiredVaporReuseEfficiency',
  'BISECTION_ITERATIONS',
  'TARGET_NOT_ACHIEVABLE',
  'createEvaporatorRequiredVaporReuseEfficiencyCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'MEB–33',
  '400th calculator milestone',
  'Required Vapor-Reuse Efficiency for Target Steam Economy',
  'Required vapor-reuse efficiency',
  'Maximum Economy at Perfect Reuse',
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
  'evaporatorRequiredVaporReuseEfficiency',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 398 at the solved efficiency',
  'Calculator 398 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'evaporatorRequiredVaporReuseEfficiency'",
  'route',
)

requireMarker(
  catalog,
  'id: "evaporatorRequiredVaporReuseEfficiency"',
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
      'evaporatorRequiredVaporReuseEfficiency',
    )
) {
  throw new Error(
    'Calculator 400 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:evaporator-required-vapor-reuse-efficiency-v1',
  'verify:evaporator-required-vapor-reuse-efficiency-v1',
]) {
  if (
    !pkg.scripts[
      scriptName
    ]
  ) {
    throw new Error(
      `Calculator 400 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:evaporator-required-vapor-reuse-efficiency-v1',
  )
) {
  throw new Error(
    'Calculator 400 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 400 verifier.',
)

console.log(
  `Current catalog calculators: ${baseline.catalogCalculatorCount}`,
)

console.log(
  `Current direct test signals: ${baseline.directTestSignals}`,
)

console.log(
  `Current coverage gaps: ${baseline.withoutDirectTestSignal}`,
)
