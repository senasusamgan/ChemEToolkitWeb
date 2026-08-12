import {
  readFile,
} from 'node:fs/promises'

const [
  engine,
  component,
  tests,
  workbench,
  catalog,
  categories,
  packageSource,
  baselineSource,
] = await Promise.all([
  readFile('src/features/material-energy-balances/fluid-bed-dryer-adiabatic-inlet-temperature/engine.ts', 'utf8'),
  readFile('src/features/material-energy-balances/fluid-bed-dryer-adiabatic-inlet-temperature/FluidBedDryerAdiabaticInletTemperatureCalculator.tsx', 'utf8'),
  readFile('tests/fluid-bed-dryer-adiabatic-inlet-temperature/fluid-bed-dryer-adiabatic-inlet-temperature.test.ts', 'utf8'),
  readFile('src/components/CalculatorWorkbench.tsx', 'utf8'),
  readFile('src/data/calculators.ts', 'utf8'),
  readFile('src/data/categories.ts', 'utf8'),
  readFile('package.json', 'utf8'),
  readFile('scripts/calculator-test-coverage-baseline-v1.json', 'utf8'),
])

function requireMarker(
  source,
  marker,
  label,
) {
  if (!source.includes(marker)) {
    throw new Error(
      `Calculator 395 ${label} missing: ${marker}`,
    )
  }
}

for (const marker of [
  'FLUID_BED_DRYER_ADIABATIC_INLET_TEMPERATURE_ENGINE_VERSION',
  'calculateFluidBedDryerEnergyBalance',
  'calculateFluidBedDryerAdiabaticInletTemperature',
  'createFluidBedDryerAdiabaticInletTemperatureCsv',
]) {
  requireMarker(engine, marker, 'engine marker')
}

for (const marker of [
  'MEB–28',
  'Fluid Bed Dryer Adiabatic Inlet-Air Temperature',
  'Required inlet-air temperature',
  'Adiabatic Residual Duty',
  'Export calculation CSV',
]) {
  requireMarker(component, marker, 'UI marker')
}

requireMarker(
  tests,
  'fluidBedDryerAdiabaticInletTemperature',
  'test ID',
)

requireMarker(
  tests,
  'matches a direct Calculator 394 evaluation at the solved temperature',
  'Calculator 394 reuse test',
)

requireMarker(
  workbench,
  "calculatorId === 'fluidBedDryerAdiabaticInletTemperature'",
  'route',
)

requireMarker(
  catalog,
  'id: "fluidBedDryerAdiabaticInletTemperature"',
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
  !categoryLine.includes('total: 33') ||
  !categoryLine.includes('live: 33')
) {
  throw new Error(
    'Material & Energy Balances metadata is not 33/33.',
  )
}

const baseline =
  JSON.parse(
    baselineSource,
  )

if (baseline.catalogCalculatorCount !== 442) {
  throw new Error(
    `Expected baseline 395; found ${baseline.catalogCalculatorCount}.`,
  )
}

if (
  baseline
    .calculatorIdsWithoutDirectTestSignal
    .includes(
      'fluidBedDryerAdiabaticInletTemperature',
    )
) {
  throw new Error(
    'Calculator 395 is in the direct-test gap list.',
  )
}

const pkg =
  JSON.parse(
    packageSource,
  )

for (const scriptName of [
  'test:fluid-bed-dryer-adiabatic-inlet-temperature-v1',
  'verify:fluid-bed-dryer-adiabatic-inlet-temperature-v1',
]) {
  if (!pkg.scripts[scriptName]) {
    throw new Error(
      `Calculator 395 package script missing: ${scriptName}`,
    )
  }
}

if (
  !pkg.scripts[
    'verify:release'
  ].includes(
    'verify:fluid-bed-dryer-adiabatic-inlet-temperature-v1',
  )
) {
  throw new Error(
    'Calculator 395 is not part of verify:release.',
  )
}

console.log('PASS: Calculator 395 verifier.')
console.log(`Calculator count: ${baseline.catalogCalculatorCount}`)
console.log('Material & Energy Balances: 33')
console.log(`Direct test signals: ${baseline.directTestSignals}`)
console.log(`Coverage gaps: ${baseline.withoutDirectTestSignal}`)
