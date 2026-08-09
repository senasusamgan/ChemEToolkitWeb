import assert from 'node:assert/strict'
import test from 'node:test'

import {
  EvaporatorTargetSteamEconomyEffectCountError,
  calculateEvaporatorTargetSteamEconomyEffectCount,
  createEvaporatorTargetSteamEconomyEffectCountCsv,
} from '../../src/features/material-energy-balances/evaporator-target-steam-economy-effect-count/engine.ts'

import {
  calculateMultipleEffectEvaporatorSteamEconomy,
} from '../../src/features/material-energy-balances/multiple-effect-evaporator-steam-economy/engine.ts'

const CALCULATOR_ID =
  'evaporatorTargetSteamEconomyEffectCount'

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

  vaporReuseEfficiency: 0.90,

  targetSteamEconomy: 2.0,
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
  'finds the minimum effect count meeting the target',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'evaporatorTargetSteamEconomyEffectCount',
    )

    const result =
      calculateEvaporatorTargetSteamEconomyEffectCount(
        input,
      )

    assert.equal(
      result.requiredEffectCount,
      4,
    )

    closeTo(
      result.steamEconomy,
      2.057928819542388,
    )

    closeTo(
      result.previousEffectSteamEconomy ?? 0,
      1.733736860244701,
    )

    closeTo(
      result.economyMargin,
      0.057928819542388155,
    )
  },
)

test(
  'reuses Calculator 398 at the selected effect count',
  () => {
    const result =
      calculateEvaporatorTargetSteamEconomyEffectCount(
        input,
      )

    const direct =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        effectCount:
          result.requiredEffectCount,
      })

    closeTo(
      result.steamEconomy,
      direct.steamEconomy,
    )

    closeTo(
      result.requiredSteamMassFlowRate,
      direct.requiredSteamMassFlowRate,
    )

    closeTo(
      result.evaporatedWaterMassFlowRate,
      direct.evaporatedWaterMassFlowRate,
    )
  },
)

test(
  'selects six effects for a target economy of 2.5',
  () => {
    const result =
      calculateEvaporatorTargetSteamEconomyEffectCount({
        ...input,

        targetSteamEconomy: 2.5,
      })

    assert.equal(
      result.requiredEffectCount,
      6,
    )

    closeTo(
      result.steamEconomy,
      2.524866067563389,
    )

    closeTo(
      result.previousEffectSteamEconomy ?? 0,
      2.315843159088503,
    )
  },
)

test(
  'returns two effects when the first multiple-effect candidate already meets target',
  () => {
    const result =
      calculateEvaporatorTargetSteamEconomyEffectCount({
        ...input,

        targetSteamEconomy: 1.2,
      })

    assert.equal(
      result.requiredEffectCount,
      2,
    )

    assert.equal(
      result.previousEffectSteamEconomy,
      null,
    )

    closeTo(
      result.steamEconomy,
      1.31661222585161,
    )
  },
)

test(
  'rejects an unreachable target within ten effects',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorTargetSteamEconomyEffectCount({
          ...input,

          targetSteamEconomy: 3.2,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorTargetSteamEconomyEffectCountError &&
        error.code ===
          'TARGET_NOT_ACHIEVABLE',
    )
  },
)

test(
  'rejects invalid target economy',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorTargetSteamEconomyEffectCount({
          ...input,

          targetSteamEconomy: 0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorTargetSteamEconomyEffectCountError &&
        error.code ===
          'INVALID_TARGET_STEAM_ECONOMY',
    )
  },
)

test(
  'exports the selected design as CSV',
  () => {
    const result =
      calculateEvaporatorTargetSteamEconomyEffectCount(
        input,
      )

    const csv =
      createEvaporatorTargetSteamEconomyEffectCountCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required number of effects/,
    )

    assert.match(
      csv,
      /Target steam economy/,
    )

    assert.match(
      csv,
      /Economy margin above target/,
    )
  },
)
