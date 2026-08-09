import assert from 'node:assert/strict'
import test from 'node:test'

import {
  FluidBedDryerAdiabaticDryAirRequirementError,
  calculateFluidBedDryerAdiabaticDryAirRequirement,
  createFluidBedDryerAdiabaticDryAirRequirementCsv,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-adiabatic-dry-air-requirement/engine.ts'

import {
  calculateFluidBedDryerEnergyBalance,
} from '../../src/features/material-energy-balances/fluid-bed-dryer-energy-balance/engine.ts'

const CALCULATOR_ID =
  'fluidBedDryerAdiabaticDryAirRequirement'

const input = {
  wetFeedMassFlowRate: 100,
  inletMoistureWetBasis: 0.30,
  outletMoistureWetBasis: 0.10,
  inletAirHumidityRatio: 0.01,

  feedTemperature: 25,
  productTemperature: 60,

  inletAirTemperature:
    186.7135508237286,

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
  'solves the adiabatic dry-air requirement',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'fluidBedDryerAdiabaticDryAirRequirement',
    )

    const result =
      calculateFluidBedDryerAdiabaticDryAirRequirement(
        input,
      )

    closeTo(
      result.requiredDryAirMassFlowRate,
      500,
      1e-8,
    )
  },
)

test(
  'matches Calculator 394 at the solved dry-air flow',
  () => {
    const result =
      calculateFluidBedDryerAdiabaticDryAirRequirement(
        input,
      )

    const direct =
      calculateFluidBedDryerEnergyBalance({
        ...input,
        dryAirMassFlowRate:
          result.requiredDryAirMassFlowRate,
      })

    closeTo(
      result.netExternalHeatDuty,
      direct.netExternalHeatDuty,
      1e-9,
    )

    closeTo(
      result.adiabaticResidualDuty,
      0,
      1e-7,
    )

    closeTo(
      result.massBalanceClosurePercent,
      direct.massBalanceClosurePercent,
      1e-12,
    )
  },
)

test(
  'predicts a higher dry-air requirement at a lower inlet temperature',
  () => {
    const result =
      calculateFluidBedDryerAdiabaticDryAirRequirement({
        ...input,
        inletAirTemperature: 120,
      })

    closeTo(
      result.requiredDryAirMassFlowRate,
      1167.135508237233,
      1e-8,
    )
  },
)

test(
  'rejects a non-physical negative required dry-air flow',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerAdiabaticDryAirRequirement({
          ...input,
          inletAirTemperature: 50,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FluidBedDryerAdiabaticDryAirRequirementError &&
        error.code ===
          'INVALID_REQUIRED_DRY_AIR_FLOW',
    )
  },
)

test(
  'rejects a degenerate dry-air sensitivity',
  () => {
    assert.throws(
      () =>
        calculateFluidBedDryerAdiabaticDryAirRequirement({
          ...input,
          inletAirTemperature: 70,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          FluidBedDryerAdiabaticDryAirRequirementError &&
        error.code ===
          'DEGENERATE_DRY_AIR_SLOPE',
    )
  },
)

test(
  'exports the solved design point as CSV',
  () => {
    const result =
      calculateFluidBedDryerAdiabaticDryAirRequirement(
        input,
      )

    const csv =
      createFluidBedDryerAdiabaticDryAirRequirementCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Fluid Bed Dryer Adiabatic Dry-Air Requirement/,
    )

    assert.match(
      csv,
      /Required dry-air mass flow rate/,
    )

    assert.match(
      csv,
      /Adiabatic residual duty/,
    )
  },
)
