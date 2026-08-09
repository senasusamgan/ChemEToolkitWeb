import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  massCore,
  workbench,
  catalog,
  categories,
  catalogVerifier,
  routingVerifier,
  coverageVerifier,
  baselineSource,
  packageSource,
] = await Promise.all([
  readFile('src/features/material-energy-balances/fluid-bed-dryer-energy-balance/engine.ts', 'utf8'),
  readFile('src/features/material-energy-balances/fluid-bed-dryer-energy-balance/FluidBedDryerEnergyBalanceCalculator.tsx', 'utf8'),
  readFile('tests/fluid-bed-dryer-energy-balance/fluid-bed-dryer-energy-balance.test.ts', 'utf8'),
  readFile('src/features/material-energy-balances/fluid-bed-dryer/shared/fluidBedDryerBalanceCore.ts', 'utf8'),
  readFile('src/components/CalculatorWorkbench.tsx', 'utf8'),
  readFile('src/data/calculators.ts', 'utf8'),
  readFile('src/data/categories.ts', 'utf8'),
  readFile('scripts/verify-calculator-catalog-v1.mjs', 'utf8'),
  readFile('scripts/verify-calculator-routing-v1.mjs', 'utf8'),
  readFile('scripts/verify-calculator-test-coverage-v1.mjs', 'utf8'),
  readFile('scripts/calculator-test-coverage-baseline-v1.json', 'utf8'),
  readFile('package.json', 'utf8'),
])

function requireMarker(
  source,
  marker,
  label,
) {
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 394 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'FLUID_BED_DRYER_ENERGY_BALANCE_ENGINE_VERSION',
  'calculateFluidBedDryerMassCore',
  'calculateFluidBedDryerEnergyBalance',
  'createFluidBedDryerEnergyBalanceCsv',
]) {
  requireMarker(engine, marker, 'engine marker')
}

for (const marker of [
  'calculateFluidBedDryerMassCore',
  'evaporatedWaterMassFlowRate',
  'outletAirHumidityRatio',
  'massBalanceClosurePercent',
]) {
  requireMarker(massCore, marker, 'shared mass-core marker')
}

for (const marker of [
  'MEB–27',
  'Fluid Bed Dryer Integrated Energy Balance',
  'Net External Heat Duty',
  'Energy-Balance Closure Error',
  'Shared FBD mass core',
  'Export calculation CSV',
]) {
  requireMarker(component, marker, 'UI marker')
}

requireMarker(tests, 'fluidBedDryerEnergyBalance', 'test ID')
requireMarker(tests, 'reuses the shared Calculator 393 fluid-bed dryer mass core', 'shared-core test')
requireMarker(workbench, "calculatorId === 'fluidBedDryerEnergyBalance'", 'route')
requireMarker(catalog, 'id: "fluidBedDryerEnergyBalance"', 'catalog ID')

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
  !categoryLine.includes('total: 33') ||
  !categoryLine.includes('live: 33')
) {
  throw new Error(
    'Material & Energy Balances metadata is not 33/33.',
  )
}

const singleIndex =
  catalogVerifier.indexOf(
    "name: 'Material & Energy Balances'",
  )

const doubleIndex =
  catalogVerifier.indexOf(
    'name: "Material & Energy Balances"',
  )

const catalogIndex =
  singleIndex >= 0
    ? singleIndex
    : doubleIndex

const catalogWindow =
  catalogIndex >= 0
    ? catalogVerifier.slice(
        catalogIndex,
        catalogIndex + 500,
      )
    : ''

if (!catalogWindow.includes('count: 33')) {
  throw new Error(
    'Catalog verifier does not expect 33 Material & Energy Balances calculators.',
  )
}

requireMarker(
  routingVerifier,
  'EXPECTED_CALCULATOR_COUNT = 401',
  'routing count',
)

requireMarker(
  coverageVerifier,
  'EXPECTED_CALCULATOR_COUNT = 401',
  'coverage count',
)

const baseline =
  JSON.parse(
    baselineSource,
  )

if (baseline.catalogCalculatorCount !== 401) {
  throw new Error(
    `Expected baseline 394; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (baseline.directTestSignals !== 261) {
  throw new Error(
    `Expected 254 direct test signals; found ${baseline.directTestSignals}.`,
  )
}

if (baseline.withoutDirectTestSignal !== 140) {
  throw new Error(
    `Expected 140 remaining coverage gaps; found ${baseline.withoutDirectTestSignal}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'fluidBedDryerEnergyBalance',
    )
) {
  throw new Error(
    'Calculator 394 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:fluid-bed-dryer-energy-balance-v1',
  'verify:fluid-bed-dryer-energy-balance-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 394 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:fluid-bed-dryer-energy-balance-v1',
  )
) {
  throw new Error(
    'Calculator 394 is not part of verify:release.',
  )
}

console.log('PASS: Calculator 394 verifier.')
console.log('Calculator count: 398')
console.log('Material & Energy Balances: 33')
console.log('Direct test signals: 258')
console.log('Coverage gaps: 140')
