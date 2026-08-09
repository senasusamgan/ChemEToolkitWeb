import assert from 'node:assert/strict'
import test from 'node:test'

import {
  EvaporatorRequiredVaporReuseEfficiencyError,
  calculateEvaporatorRequiredVaporReuseEfficiency,
  createEvaporatorRequiredVaporReuseEfficiencyCsv,
} from '../../src/features/material-energy-balances/evaporator-required-vapor-reuse-efficiency/engine.ts'

import {
  calculateMultipleEffectEvaporatorSteamEconomy,
} from '../../src/features/material-energy-balances/multiple-effect-evaporator-steam-economy/engine.ts'

const CALCULATOR_ID =
  'evaporatorRequiredVaporReuseEfficiency'

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

  effectCount: 4,

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
  'solves the required vapor-reuse efficiency',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'evaporatorRequiredVaporReuseEfficiency',
    )

    const result =
      calculateEvaporatorRequiredVaporReuseEfficiency(
        input,
      )

    closeTo(
      result.requiredVaporReuseEfficiency,
      0.8731922856655013,
      1e-9,
    )

    closeTo(
      result.requiredVaporReuseEfficiencyPercent,
      87.31922856655013,
      1e-7,
    )

    closeTo(
      result.steamEconomy,
      2.0,
      1e-12,
    )

    closeTo(
      result.requiredSteamMassFlowRate,
      375,
      1e-9,
    )

    assert.equal(
      result.iterationCount,
      80,
    )
  },
)

test(
  'reuses Calculator 398 at the solved efficiency',
  () => {
    const result =
      calculateEvaporatorRequiredVaporReuseEfficiency(
        input,
      )

    const direct =
      calculateMultipleEffectEvaporatorSteamEconomy({
        ...input,

        vaporReuseEfficiency:
          result.requiredVaporReuseEfficiency,
      })

    closeTo(
      result.steamEconomy,
      direct.steamEconomy,
      1e-12,
    )

    closeTo(
      result.requiredSteamMassFlowRate,
      direct.requiredSteamMassFlowRate,
      1e-12,
    )

    closeTo(
      result.latentHeatAmplificationFactor,
      direct.latentHeatAmplificationFactor,
      1e-12,
    )
  },
)

test(
  'recovers 90 percent reuse for the known four-effect design point',
  () => {
    const result =
      calculateEvaporatorRequiredVaporReuseEfficiency({
        ...input,

        targetSteamEconomy:
          2.057928819542388,
      })

    closeTo(
      result.requiredVaporReuseEfficiency,
      0.9,
      1e-10,
    )
  },
)

test(
  'higher target economy requires higher reuse efficiency',
  () => {
    const lowerTarget =
      calculateEvaporatorRequiredVaporReuseEfficiency({
        ...input,

        targetSteamEconomy:
          1.5,
      })

    const higherTarget =
      calculateEvaporatorRequiredVaporReuseEfficiency({
        ...input,

        targetSteamEconomy:
          2.0,
      })

    assert.ok(
      higherTarget.requiredVaporReuseEfficiency >
      lowerTarget.requiredVaporReuseEfficiency,
    )

    closeTo(
      lowerTarget.requiredVaporReuseEfficiency,
      0.6192721400076813,
      1e-9,
    )
  },
)

test(
  'rejects target above perfect-reuse capability',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorRequiredVaporReuseEfficiency({
          ...input,

          targetSteamEconomy:
            2.5,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorRequiredVaporReuseEfficiencyError &&
        error.code ===
          'TARGET_NOT_ACHIEVABLE',
    )
  },
)

test(
  'rejects target already met at negligible reuse',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorRequiredVaporReuseEfficiency({
          ...input,

          targetSteamEconomy:
            0.7,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorRequiredVaporReuseEfficiencyError &&
        error.code ===
          'TARGET_ALREADY_MET_AT_MINIMUM_REUSE',
    )
  },
)

test(
  'rejects invalid target economy',
  () => {
    assert.throws(
      () =>
        calculateEvaporatorRequiredVaporReuseEfficiency({
          ...input,

          targetSteamEconomy:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          EvaporatorRequiredVaporReuseEfficiencyError &&
        error.code ===
          'INVALID_TARGET_STEAM_ECONOMY',
    )
  },
)

test(
  'exports inverse-design result as CSV',
  () => {
    const result =
      calculateEvaporatorRequiredVaporReuseEfficiency(
        input,
      )

    const csv =
      createEvaporatorRequiredVaporReuseEfficiencyCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required vapor-reuse efficiency/,
    )

    assert.match(
      csv,
      /Target steam economy/,
    )

    assert.match(
      csv,
      /Maximum economy at perfect reuse/,
    )
  },
)
