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
    'src/features/material-energy-balances/evaporator-target-steam-economy-effect-count/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/evaporator-target-steam-economy-effect-count/EvaporatorTargetSteamEconomyEffectCountCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/evaporator-target-steam-economy-effect-count/evaporator-target-steam-economy-effect-count.test.ts',
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
  if (
    !source.includes(
      marker,
    )
  ) {
    throw new Error(
      `Calculator 399 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'EVAPORATOR_TARGET_STEAM_ECONOMY_EFFECT_COUNT_ENGINE_VERSION',
  'calculateMultipleEffectEvaporatorSteamEconomy',
  'calculateEvaporatorTargetSteamEconomyEffectCount',
  'TARGET_NOT_ACHIEVABLE',
  'createEvaporatorTargetSteamEconomyEffectCountCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'MEB–32',
  'Evaporator Effect Count for Target Steam Economy',
  'Minimum required effects',
  'Achieved Steam Economy',
  'Economy Margin',
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
  'evaporatorTargetSteamEconomyEffectCount',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 398 at the selected effect count',
  'Calculator 398 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'evaporatorTargetSteamEconomyEffectCount'",
  'route',
)

requireMarker(
  catalog,
  'id: "evaporatorTargetSteamEconomyEffectCount"',
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
      'evaporatorTargetSteamEconomyEffectCount',
    )
) {
  throw new Error(
    'Calculator 399 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:evaporator-target-steam-economy-effect-count-v1',
  'verify:evaporator-target-steam-economy-effect-count-v1',
]) {
  if (
    !pkg.scripts[
      scriptName
    ]
  ) {
    throw new Error(
      `Calculator 399 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:evaporator-target-steam-economy-effect-count-v1',
  )
) {
  throw new Error(
    'Calculator 399 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 399 verifier.',
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
