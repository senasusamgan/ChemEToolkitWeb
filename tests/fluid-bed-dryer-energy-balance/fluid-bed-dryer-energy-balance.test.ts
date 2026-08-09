import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FluidBedDryerEnergyBalanceError,
  calculateFluidBedDryerEnergyBalance,
  createFluidBedDryerEnergyBalanceCsv,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-energy-balance/engine.ts'

import {
  calculateFluidBedDryerMassCore,
} from '../../src/features/material-energy-balances/fluid-bed-dryer/shared/fluidBedDryerBalanceCore.ts'

const CALCULATOR_ID =
  'fluidBedDryerEnergyBalance'

const input = {
  wetFeedMassFlowRate: 100,
  inletMoistureWetBasis: 0.30,
  outletMoistureWetBasis: 0.10,
  dryAirMassFlowRate: 500,
  inletAirHumidityRatio: 0.01,
  feedTemperature: 25,
  productTemperature: 60,
  inletAirTemperature: 120,
  outletAirTemperature: 70,
  referenceTemperature: 0,
  drySolidHeatCapacity: 1.0,
  liquidWaterHeatCapacity: 4.18,
  dryAirHeatCapacity: 1.005,
  waterVaporHeatCapacity: 1.88,
  waterLatentHeatReference: 2500,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  )
}

test(
  'reuses the shared Calculator 393 fluid-bed dryer mass core',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'fluidBedDryerEnergyBalance',
    )

    const energy =
      calculateFluidBedDryerEnergyBalance(
        input,
      )

    const mass =
      calculateFluidBedDryerMassCore(
        input,
      )

    closeTo(
      energy.drySolidMassFlowRate,
      mass.drySolidMassFlowRate,
    )

    closeTo(
      energy.evaporatedWaterMassFlowRate,
      mass.evaporatedWaterMassFlowRate,
    )

    closeTo(
      energy.outletAirHumidityRatio,
      mass.outletAirHumidityRatio,
    )

    closeTo(
      energy.massBalanceClosurePercent,
      mass.massBalanceClosurePercent,
    )
  },
)

test(
  'calculates material and drying-air enthalpy rates',
  () => {
    const result =
      calculateFluidBedDryerEnergyBalance(
        input,
      )

    closeTo(result.feedMaterialEnthalpyRate, 4885)
    closeTo(result.productMaterialEnthalpyRate, 6150.666666666666)
    closeTo(result.inletAirEnthalpyRate, 73928)
    closeTo(result.outletAirEnthalpyRate, 106813)
  },
)

test(
  'calculates integrated external heat duty and energy closure',
  () => {
    const result =
      calculateFluidBedDryerEnergyBalance(
        input,
      )

    closeTo(result.netExternalHeatDuty, 34150.66666666667)
    closeTo(result.netExternalHeatDutyKilowatts, 9.486296296296297)
    closeTo(result.specificExternalHeatDutyPerWaterRemoved, 1536.7800000000002)
    closeTo(result.energyBalanceClosureError, 0, 1e-10)
    closeTo(result.energyBalanceClosurePercent, 0, 1e-12)

    assert.equal(
      result.status,
      'heating-required',
    )
  },
)

test(
  'identifies an approximately adiabatic operating point',
  () => {
    const result =
      calculateFluidBedDryerEnergyBalance({
        ...input,
        inletAirTemperature:
          186.7135508237286,
      })

    closeTo(
      result.netExternalHeatDuty,
      0,
      1e-8,
    )

    assert.equal(
      result.status,
      'near-adiabatic',
    )
  },
)

test(
  'rejects invalid heat-capacity inputs',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerEnergyBalance({
          ...input,
          dryAirHeatCapacity: 0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FluidBedDryerEnergyBalanceError &&
        error.code ===
          'INVALID_HEAT_CAPACITY',
    )
  },
)

test(
  'exports integrated FBD mass and energy results as CSV',
  () => {
    const result =
      calculateFluidBedDryerEnergyBalance(
        input,
      )

    const csv =
      createFluidBedDryerEnergyBalanceCsv(
        input,
        result,
      )

    assert.match(csv, /Fluid Bed Dryer Integrated Energy Balance/)
    assert.match(csv, /Evaporated water/)
    assert.match(csv, /Net external heat duty/)
  },
)
