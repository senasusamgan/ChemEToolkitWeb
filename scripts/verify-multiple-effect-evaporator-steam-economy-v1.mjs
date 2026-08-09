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
    'src/features/material-energy-balances/multiple-effect-evaporator-steam-economy/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/multiple-effect-evaporator-steam-economy/MultipleEffectEvaporatorSteamEconomyCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/multiple-effect-evaporator-steam-economy/multiple-effect-evaporator-steam-economy.test.ts',
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
      `Calculator 398 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'MULTIPLE_EFFECT_EVAPORATOR_STEAM_ECONOMY_ENGINE_VERSION',
  'calculateEvaporatorSteamRequirementEconomy',
  'calculateMultipleEffectEvaporatorSteamEconomy',
  'createMultipleEffectEvaporatorSteamEconomyCsv',
  'latentHeatAmplificationFactor',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'MEB–31',
  'Multiple-Effect Evaporator Steam Economy',
  'Required Heating Steam',
  'Steam Savings',
  'Latent-Heat Amplification Factor',
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
  'multipleEffectEvaporatorSteamEconomy',
  'direct test ID',
)

requireMarker(
  tests,
  'reuses Calculator 397 as the single-effect reference',
  'Calculator 397 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'multipleEffectEvaporatorSteamEconomy'",
  'route',
)

requireMarker(
  catalog,
  'id: "multipleEffectEvaporatorSteamEconomy"',
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
      'multipleEffectEvaporatorSteamEconomy',
    )
) {
  throw new Error(
    'Calculator 398 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:multiple-effect-evaporator-steam-economy-v1',
  'verify:multiple-effect-evaporator-steam-economy-v1',
]) {
  if (
    !pkg.scripts[
      scriptName
    ]
  ) {
    throw new Error(
      `Calculator 398 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:multiple-effect-evaporator-steam-economy-v1',
  )
) {
  throw new Error(
    'Calculator 398 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 398 verifier.',
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
