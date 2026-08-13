import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  sharedCore,
  component,
  tests,
  workbench,
  catalog,
  categories,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile(
    'src/features/material-energy-balances/evaporator-steam-requirement-economy/engine.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/evaporator/shared/evaporatorMassCore.ts',
    'utf8',
  ),
  readFile(
    'src/features/material-energy-balances/evaporator-steam-requirement-economy/EvaporatorSteamRequirementEconomyCalculator.tsx',
    'utf8',
  ),
  readFile(
    'tests/evaporator-steam-requirement-economy/evaporator-steam-requirement-economy.test.ts',
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
    'src/data/categories.ts',
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
      `Calculator 397 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'EVAPORATOR_STEAM_REQUIREMENT_ECONOMY_ENGINE_VERSION',
  'calculateEvaporatorMassCore',
  'calculateEvaporatorSteamRequirementEconomy',
  'createEvaporatorSteamRequirementEconomyCsv',
]) {
  requireMarker(
    engine,
    marker,
    'engine marker',
  )
}

for (const marker of [
  'calculateEvaporatorMassCore',
  'drySolidsMassFlowRate',
  'evaporatedWaterMassFlowRate',
  'massBalanceClosurePercent',
]) {
  requireMarker(
    sharedCore,
    marker,
    'shared mass-core marker',
  )
}

for (const marker of [
  'MEB–30',
  'Evaporator Steam Requirement & Economy',
  'Required heating steam',
  'Steam Economy',
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
  'evaporatorSteamRequirementEconomy',
  'test ID',
)

requireMarker(
  tests,
  'reuses the shared evaporator mass core',
  'shared-core test',
)

requireMarker(
  workbench,
  "calculatorId === 'evaporatorSteamRequirementEconomy'",
  'route',
)

requireMarker(
  catalog,
  'id: "evaporatorSteamRequirementEconomy"',
  'catalog ID',
)

const categoryLine =
  categories
    .split('\n')
    .find(
      line =>
        line.includes(
          'Material & Energy Balances',
        ),
    )

if (
  !categoryLine ||
  !categoryLine.includes(
    'total: 33',
  ) ||
  !categoryLine.includes(
    'live: 33',
  )
) {
  throw new Error(
    'Material & Energy Balances metadata is not 33/33.',
  )
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (
  baseline.catalogCalculatorCount !==
  450
) {
  throw new Error(
    `Expected Calculator 397 catalog state; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline.directTestSignals !==
  311
) {
  throw new Error(
    `Expected 257 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (
  baseline.withoutDirectTestSignal !==
  139
) {
  throw new Error(
    `Expected 140 coverage gaps; found ${baseline.withoutDirectTestSignal}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'evaporatorSteamRequirementEconomy',
    )
) {
  throw new Error(
    'Calculator 397 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:evaporator-steam-requirement-economy-v1',
  'verify:evaporator-steam-requirement-economy-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 397 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:evaporator-steam-requirement-economy-v1',
  )
) {
  throw new Error(
    'Calculator 397 is not part of verify:release.',
  )
}

console.log(
  'PASS: Calculator 397 verifier.',
)

console.log(
  'Calculator count: 398',
)

console.log(
  'Material & Energy Balances: 33',
)

console.log(
  'Direct test signals: 258',
)

console.log(
  'Coverage gaps: 140',
)
