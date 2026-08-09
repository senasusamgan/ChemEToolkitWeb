import assert from 'node:assert/strict'
import test from 'node:test'

import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  calculateEvaporatorSteamRequirementEconomy,
  createEvaporatorSteamRequirementEconomyCsv,
} from '../../src/features/material-energy-balances/evaporator-steam-requirement-economy/engine.ts'

import {
  calculateEvaporatorMassCore,
} from '../../src/features/material-energy-balances/evaporator/shared/evaporatorMassCore.ts'

const CALCULATOR_ID =
  'evaporatorSteamRequirementEconomy'

const input = {
  feedMassFlowRate: 1000,

  feedSolidsMassFraction: 0.10,
  productSolidsMassFraction: 0.40,

  feedTemperature: 25,
  boilingTemperature: 80,

  feedHeatCapacity: 4.0,

  vaporizationLatentHeat: 2300,
  steamLatentHeat: 2200,

  heatLossFraction: 0.10,
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
  'reuses the shared evaporator mass core',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'evaporatorSteamRequirementEconomy',
    )

    const mass =
      calculateEvaporatorMassCore(
        input,
      )

    const result =
      calculateEvaporatorSteamRequirementEconomy(
        input,
      )

    closeTo(
      result.drySolidsMassFlowRate,
      100,
    )

    closeTo(
      result.productMassFlowRate,
      250,
    )

    closeTo(
      result.evaporatedWaterMassFlowRate,
      750,
    )

    closeTo(
      result.productMassFlowRate,
      mass.productMassFlowRate,
    )

    closeTo(
      result.massBalanceClosurePercent,
      0,
      1e-12,
    )
  },
)

test(
  'calculates sensible and latent process duties',
  () => {
    const result =
      calculateEvaporatorSteamRequirementEconomy(
        input,
      )

    closeTo(
      result.sensibleHeatDuty,
      220000,
    )

    closeTo(
      result.evaporationHeatDuty,
      1725000,
    )

    closeTo(
      result.usefulProcessHeatDuty,
      1945000,
    )
  },
)

test(
  'calculates required steam and steam economy',
  () => {
    const result =
      calculateEvaporatorSteamRequirementEconomy(
        input,
      )

    closeTo(
      result.requiredSteamHeatRate,
      2161111.111111111,
    )

    closeTo(
      result.requiredSteamMassFlowRate,
      982.3232323232323,
    )

    closeTo(
      result.steamEconomy,
      0.7634961439588689,
    )

    closeTo(
      result.specificSteamConsumption,
      1.3097643097643097,
    )

    closeTo(
      result.energyBalanceClosurePercent,
      0,
      1e-12,
    )
  },
)

test(
  'improves steam economy without heat loss',
  () => {
    const result =
      calculateEvaporatorSteamRequirementEconomy({
        ...input,
        heatLossFraction: 0,
      })

    closeTo(
      result.requiredSteamMassFlowRate,
      884.0909090909091,
    )

    closeTo(
      result.steamEconomy,
      0.8483290488431876,
    )
  },
)

test(
  'rejects non-concentrating solids specification',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorSteamRequirementEconomy({
          ...input,
          productSolidsMassFraction:
            0.10,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorMassCoreError &&
        error.code ===
          'INVALID_CONCENTRATION_WINDOW',
    )
  },
)

test(
  'rejects invalid thermal inputs',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorSteamRequirementEconomy({
          ...input,
          heatLossFraction: 1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorSteamRequirementError &&
        error.code ===
          'INVALID_HEAT_LOSS',
    )

    assert.throws(
      () =>
        calculateEvaporatorSteamRequirementEconomy({
          ...input,
          boilingTemperature: 20,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorSteamRequirementError &&
        error.code ===
          'INVALID_TEMPERATURE_WINDOW',
    )
  },
)

test(
  'exports calculation CSV',
  () => {
    const result =
      calculateEvaporatorSteamRequirementEconomy(
        input,
      )

    const csv =
      createEvaporatorSteamRequirementEconomyCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required steam/,
    )

    assert.match(
      csv,
      /Steam economy/,
    )
  },
)
