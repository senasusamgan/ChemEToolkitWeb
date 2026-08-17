import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MultipleEffectEvaporatorSteamEconomyError,
  calculateMultipleEffectEvaporatorSteamEconomy,
  createMultipleEffectEvaporatorSteamEconomyCsv,
} from '../../src/features/material-energy-balances/multiple-effect-evaporator-steam-economy/engine.ts'

import {
  calculateEvaporatorSteamRequirementEconomy,
} from '../../src/features/material-energy-balances/evaporator-steam-requirement-economy/engine.ts'

const CALCULATOR_ID =
  'multipleEffectEvaporatorSteamEconomy'

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

  effectCount: 3,
  vaporReuseEfficiency: 0.90,
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
  'reuses Calculator 397 as the single-effect reference',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'multipleEffectEvaporatorSteamEconomy',
    )

    const result =
      calculateMultipleEffectEvaporatorSteamEconomy(
        input,
      )

    const single =
      calculateEvaporatorSteamRequirementEconomy(
        input,
      )

    closeTo(
      result.singleEffectRequiredSteamMassFlowRate,
      single.requiredSteamMassFlowRate,
    )

    closeTo(
      result.productMassFlowRate,
      single.productMassFlowRate,
    )

    closeTo(
      result.evaporatedWaterMassFlowRate,
      single.evaporatedWaterMassFlowRate,
    )

    closeTo(
      result.massBalanceClosurePercent,
      0,
      1e-12,
    )
  },
)

test(
  'calculates three-effect vapor-reuse amplification',
  () => {
    const result =
      calculateMultipleEffectEvaporatorSteamEconomy(
        input,
      )

    closeTo(
      result.latentHeatAmplificationFactor,
      2.71,
    )

    closeTo(
      result.equivalentVaporizationLatentHeat,
      Number('848.7084870848708'),
    )

    closeTo(
      result.actualEvaporationHeatDuty,
      1725000,
    )

    closeTo(
      result.effectiveEvaporationHeatDuty,
      636531.3653136531,
    )
  },
)

test(
  'calculates multiple-effect steam demand and economy',
  () => {
    const result =
      calculateMultipleEffectEvaporatorSteamEconomy(
        input,
      )

    closeTo(
      result.requiredSteamMassFlowRate,
      432.59159864325915,
    )

    closeTo(
      result.steamEconomy,
      1.733736860244701,
    )

    closeTo(
      result.singleEffectRequiredSteamMassFlowRate,
      982.3232323232323,
    )

    closeTo(
      result.steamSavingsMassFlowRate,
      549.7316336799731,
    )

    closeTo(
      result.steamReductionPercent,
      55.96239767024919,
    )
  },
)

test(
  'recovers ideal three-effect amplification at perfect vapor reuse',
  () => {
    const result =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        vaporReuseEfficiency: 1,
      })

    closeTo(
      result.latentHeatAmplificationFactor,
      3,
    )

    closeTo(
      result.requiredSteamMassFlowRate,
      401.5151515151515,
    )

    closeTo(
      result.steamEconomy,
      1.8679245283018868,
    )

    closeTo(
      result.idealizedEffectUtilizationPercent,
      100,
    )
  },
)

test(
  'more effective stages reduce external steam demand',
  () => {
    const twoEffect =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        effectCount: 2,
      })

    const fourEffect =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        effectCount: 4,
      })

    assert.ok(
      fourEffect.requiredSteamMassFlowRate <
      twoEffect.requiredSteamMassFlowRate,
    )

    assert.ok(
      fourEffect.steamEconomy >
      twoEffect.steamEconomy,
    )
  },
)

test(
  'rejects invalid effect count and vapor-reuse efficiency',
  () => {
    assert.throws(
      () =>
        calculateMultipleEffectEvaporatorSteamEconomy({
          ...input,

          effectCount: 1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MultipleEffectEvaporatorSteamEconomyError &&
        error.code ===
          'INVALID_EFFECT_COUNT',
    )

    assert.throws(
      () =>
        calculateMultipleEffectEvaporatorSteamEconomy({
          ...input,

          vaporReuseEfficiency: 1.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MultipleEffectEvaporatorSteamEconomyError &&
        error.code ===
          'INVALID_VAPOR_REUSE_EFFICIENCY',
    )
  },
)

test(
  'exports multiple-effect results as CSV',
  () => {
    const result =
      calculateMultipleEffectEvaporatorSteamEconomy(
        input,
      )

    const csv =
      createMultipleEffectEvaporatorSteamEconomyCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Multiple-Effect Evaporator Steam Economy/,
    )

    assert.match(
      csv,
      /Steam savings/,
    )

    assert.match(
      csv,
      /Latent-heat amplification factor/,
    )
  },
)
