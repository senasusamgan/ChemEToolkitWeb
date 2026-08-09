import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PipeFlowRateFromPressureDropError,
  PipeHydraulicsCoreError,
  calculatePipeFlowRateFromPressureDrop,
  calculatePipeHydraulicsState,
  createPipeFlowRateFromPressureDropCsv,
} from '../../src/features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/engine.ts'

const CALCULATOR_ID =
  'pipeFlowRateFromPressureDrop'

const input = {
  diameter: 0.08,
  pipeLength: 100,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,
  minorLossCoefficient: 5,

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
  'solves flow rate from available pressure drop',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'pipeFlowRateFromPressureDrop',
    )

    const result =
      calculatePipeFlowRateFromPressureDrop(
        input,
      )

    closeTo(
      result.volumetricFlowRate,
      0.01330674313176243,
      1e-11,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      47.90427527434475,
      1e-8,
    )

    closeTo(
      result.volumetricFlowRateLitersPerSecond,
      13.30674313176243,
      1e-8,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-6,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'returns expected hydraulic state at solved flow',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop(
        input,
      )

    closeTo(
      result.velocity,
      2.6472924323426485,
      1e-9,
    )

    closeTo(
      result.reynoldsNumber,
      211359.82779823706,
      1e-6,
    )

    closeTo(
      result.frictionFactor,
      0.01887629061339257,
      1e-12,
    )

    closeTo(
      result.frictionPressureDrop,
      82514.64773026506,
      1e-6,
    )

    closeTo(
      result.minorPressureDrop,
      17485.352269734947,
      1e-6,
    )
  },
)

test(
  'reuses shared pipe-hydraulics core',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop(
        input,
      )

    const direct =
      calculatePipeHydraulicsState({
        diameter:
          input.diameter,

        volumetricFlowRate:
          result.volumetricFlowRate,

        pipeLength:
          input.pipeLength,

        fluidDensity:
          input.fluidDensity,

        dynamicViscosity:
          input.dynamicViscosity,

        absoluteRoughness:
          input.absoluteRoughness,

        minorLossCoefficient:
          input.minorLossCoefficient,
      })

    closeTo(
      result.totalPressureDrop,
      direct.totalPressureDrop,
      1e-9,
    )

    closeTo(
      result.reynoldsNumber,
      direct.reynoldsNumber,
      1e-9,
    )

    closeTo(
      result.frictionFactor,
      direct.frictionFactor,
      1e-12,
    )
  },
)

test(
  'recovers Calculator 401 design point',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop({
        ...input,

        diameter:
          0.07146391866649002,
      })

    closeTo(
      result.volumetricFlowRate,
      0.01,
      1e-11,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-6,
    )
  },
)

test(
  'lower available pressure drop reduces flow rate',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop({
        ...input,

        availablePressureDrop:
          50000,
      })

    closeTo(
      result.volumetricFlowRate,
      0.009287776827891975,
      1e-11,
    )

    assert.ok(
      result.volumetricFlowRate <
      0.01330674313176243,
    )
  },
)

test(
  'removing minor losses increases allowable flow',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop({
        ...input,

        minorLossCoefficient:
          0,
      })

    closeTo(
      result.volumetricFlowRate,
      0.01470384645310875,
      1e-11,
    )

    assert.ok(
      result.volumetricFlowRate >
      0.01330674313176243,
    )
  },
)

test(
  'rejects invalid available pressure drop',
  () => {
    assert.throws(
      () =>
        calculatePipeFlowRateFromPressureDrop({
          ...input,

          availablePressureDrop:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PipeFlowRateFromPressureDropError &&
        error.code ===
          'INVALID_AVAILABLE_PRESSURE_DROP',
    )
  },
)

test(
  'rejects invalid shared hydraulic inputs',
  () => {
    assert.throws(
      () =>
        calculatePipeFlowRateFromPressureDrop({
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
  'exports flow-rate design as CSV',
  () => {
    const result =
      calculatePipeFlowRateFromPressureDrop(
        input,
      )

    const csv =
      createPipeFlowRateFromPressureDropCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Volumetric flow rate/,
    )

    assert.match(
      csv,
      /Available pressure drop/,
    )

    assert.match(
      csv,
      /Darcy friction factor/,
    )
  },
)
