import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MaximumMinorLossCoefficientError,
  PipeHydraulicsCoreError,
  calculateMaximumMinorLossCoefficient,
  calculatePipeHydraulicsState,
  createMaximumMinorLossCoefficientCsv,
} from '../../src/features/fluid-mechanics/maximum-minor-loss-coefficient/engine.ts'

const CALCULATOR_ID =
  'maximumMinorLossCoefficient'

const input = {
  diameter: 0.08,
  volumetricFlowRate: 0.01,
  pipeLength: 100,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,

  availablePressureDrop: 100000,
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
  'calculates maximum allowable total minor-loss coefficient',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'maximumMinorLossCoefficient',
    )

    const result =
      calculateMaximumMinorLossCoefficient(
        input,
      )

    closeTo(
      result.maximumMinorLossCoefficient,
      26.456256583277664,
      1e-12,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-8,
    )

    closeTo(
      result.frictionPressureDrop,
      47749.647005868006,
      1e-8,
    )

    closeTo(
      result.minorPressureDrop,
      52250.352994131994,
      1e-8,
    )
  },
)

test(
  'returns expected hydraulic state and budget split',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient(
        input,
      )

    closeTo(
      result.velocity,
      1.989436788648692,
      1e-12,
    )

    closeTo(
      result.reynoldsNumber,
      158836.63320571155,
      1e-8,
    )

    closeTo(
      result.frictionFactor,
      0.019341908187147414,
      1e-14,
    )

    closeTo(
      result.frictionBudgetPercent,
      47.74964700586801,
      1e-10,
    )

    closeTo(
      result.minorLossBudgetPercent,
      52.25035299413199,
      1e-10,
    )
  },
)

test(
  'reuses shared pipe-hydraulics core for solved K value',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient(
        input,
      )

    const direct =
      calculatePipeHydraulicsState({
        diameter:
          input.diameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        pipeLength:
          input.pipeLength,

        fluidDensity:
          input.fluidDensity,

        dynamicViscosity:
          input.dynamicViscosity,

        absoluteRoughness:
          input.absoluteRoughness,

        minorLossCoefficient:
          result.maximumMinorLossCoefficient,
      })

    closeTo(
      result.totalPressureDrop,
      direct.totalPressureDrop,
      1e-9,
    )

    closeTo(
      result.minorPressureDrop,
      direct.minorPressureDrop,
      1e-9,
    )

    closeTo(
      result.frictionFactor,
      direct.frictionFactor,
      1e-14,
    )
  },
)

test(
  'recovers Calculator 403 K equals five design point',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient({
        ...input,

        pipeLength:
          188.74514913698212,
      })

    closeTo(
      result.maximumMinorLossCoefficient,
      5,
      1e-10,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-8,
    )
  },
)

test(
  'larger pressure budget permits more fittings loss',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient({
        ...input,

        availablePressureDrop:
          150000,
      })

    closeTo(
      result.maximumMinorLossCoefficient,
      51.77307749188363,
      1e-12,
    )

    assert.ok(
      result.maximumMinorLossCoefficient >
      26.456256583277664,
    )
  },
)

test(
  'longer pipe leaves a smaller fittings budget',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient({
        ...input,

        pipeLength:
          150,
      })

    closeTo(
      result.maximumMinorLossCoefficient,
      14.367563966310529,
      1e-12,
    )

    assert.ok(
      result.maximumMinorLossCoefficient <
      26.456256583277664,
    )
  },
)

test(
  'shorter pipe leaves a larger fittings budget',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient({
        ...input,

        pipeLength:
          50,
      })

    closeTo(
      result.maximumMinorLossCoefficient,
      38.5449492002448,
      1e-12,
    )
  },
)

test(
  'rejects pressure budget already consumed by straight-pipe friction',
  () => {
    assert.throws(
      () =>
        calculateMaximumMinorLossCoefficient({
          ...input,

          availablePressureDrop:
            40000,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumMinorLossCoefficientError &&
        error.code ===
          'NO_MINOR_LOSS_BUDGET',
    )
  },
)

test(
  'rejects invalid shared hydraulic inputs',
  () => {
    assert.throws(
      () =>
        calculateMaximumMinorLossCoefficient({
          ...input,

          diameter:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PipeHydraulicsCoreError &&
        error.code ===
          'INVALID_DIAMETER',
    )
  },
)

test(
  'exports fittings budget as CSV',
  () => {
    const result =
      calculateMaximumMinorLossCoefficient(
        input,
      )

    const csv =
      createMaximumMinorLossCoefficientCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum total minor-loss coefficient/,
    )

    assert.match(
      csv,
      /Pressure available for minor losses/,
    )

    assert.match(
      csv,
      /Minor-loss budget/,
    )
  },
)
