import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FluidBedDryerAdiabaticInletTemperatureError,
  calculateFluidBedDryerAdiabaticInletTemperature,
  createFluidBedDryerAdiabaticInletTemperatureCsv,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-adiabatic-inlet-temperature/engine.ts'

import {
  calculateFluidBedDryerEnergyBalance,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-energy-balance/engine.ts'

const CALCULATOR_ID =
  'fluidBedDryerAdiabaticInletTemperature'

const input = {
  wetFeedMassFlowRate: 100,
  inletMoistureWetBasis: 0.30,
  outletMoistureWetBasis: 0.10,
  dryAirMassFlowRate: 500,
  inletAirHumidityRatio: 0.01,
  feedTemperature: 25,
  productTemperature: 60,
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
  'solves the Calculator 394 energy model for the adiabatic inlet-air temperature',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'fluidBedDryerAdiabaticInletTemperature',
    )

    const result =
      calculateFluidBedDryerAdiabaticInletTemperature(
        input,
      )

    closeTo(
      result.requiredInletAirTemperature,
      186.7135508237286,
      1e-9,
    )

    closeTo(
      result.adiabaticResidualDuty,
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
  'matches a direct Calculator 394 evaluation at the solved temperature',
  () => {
    const inverse =
      calculateFluidBedDryerAdiabaticInletTemperature(
        input,
      )

    const direct =
      calculateFluidBedDryerEnergyBalance({
        ...input,
        inletAirTemperature:
          inverse.requiredInletAirTemperature,
      })

    closeTo(
      inverse.netExternalHeatDuty,
      direct.netExternalHeatDuty,
      1e-10,
    )

    closeTo(
      inverse.evaporatedWaterMassFlowRate,
      direct.evaporatedWaterMassFlowRate,
      1e-10,
    )

    closeTo(
      inverse.outletAirHumidityRatio,
      direct.outletAirHumidityRatio,
      1e-12,
    )
  },
)

test(
  'preserves Calculator 393 mass closure through the Calculator 394 model',
  () => {
    const result =
      calculateFluidBedDryerAdiabaticInletTemperature(
        input,
      )

    closeTo(
      result.massBalanceClosurePercent,
      0,
      1e-12,
    )

    closeTo(
      result.energyBalanceClosurePercent,
      0,
      1e-12,
    )
  },
)

test(
  'delegates invalid thermophysical inputs to Calculator 394 validation',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerAdiabaticInletTemperature({
          ...input,
          dryAirHeatCapacity: 0,
        }),
    )
  },
)

test(
  'rejects a degenerate inlet-air temperature sensitivity',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerAdiabaticInletTemperature({
          ...input,
          dryAirMassFlowRate: 1e-9,
          inletAirHumidityRatio: 0,
          dryAirHeatCapacity: 1e-9,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FluidBedDryerAdiabaticInletTemperatureError &&
        error.code ===
          'DEGENERATE_ENERGY_SLOPE',
    )
  },
)

test(
  'exports the solved adiabatic design point as CSV',
  () => {
    const result =
      calculateFluidBedDryerAdiabaticInletTemperature(
        input,
      )

    const csv =
      createFluidBedDryerAdiabaticInletTemperatureCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Fluid Bed Dryer Adiabatic Inlet-Air Temperature/,
    )

    assert.match(
      csv,
      /Required inlet-air temperature/,
    )

    assert.match(
      csv,
      /Adiabatic residual duty/,
    )
  },
)
