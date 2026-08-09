import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MaximumPipeLengthFromPressureDropError,
  PipeHydraulicsCoreError,
  calculateMaximumPipeLengthFromPressureDrop,
  calculatePipeHydraulicsState,
  createMaximumPipeLengthFromPressureDropCsv,
} from '../../src/features/fluid-mechanics/maximum-pipe-length-pressure-drop/engine.ts'

const CALCULATOR_ID =
  'maximumPipeLengthFromPressureDrop'

const input = {
  diameter: 0.08,
  volumetricFlowRate: 0.01,

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
  'solves maximum pipe length from pressure-drop budget',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'maximumPipeLengthFromPressureDrop',
    )

    const result =
      calculateMaximumPipeLengthFromPressureDrop(
        input,
      )

    closeTo(
      result.maximumPipeLength,
      188.74514913698212,
      1e-9,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-8,
    )

    closeTo(
      result.totalHeadLoss,
      10.21759732442814,
      1e-10,
    )

    assert.equal(
      result.flowRegime,
      'turbulent',
    )
  },
)

test(
  'returns expected hydraulic design state',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop(
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
      result.frictionPressureDropPerUnitLength,
      477.4964700586801,
      1e-9,
    )

    closeTo(
      result.minorPressureDrop,
      9874.857546391906,
      1e-9,
    )

    closeTo(
      result.pressureAvailableForPipeFriction,
      90125.1424536081,
      1e-9,
    )
  },
)

test(
  'reuses shared pipe-hydraulics core for final verification',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop(
        input,
      )

    const direct =
      calculatePipeHydraulicsState({
        diameter:
          input.diameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        pipeLength:
          result.maximumPipeLength,

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
      1e-14,
    )
  },
)

test(
  'recovers Calculator 401 hundred-meter design point',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop({
        ...input,

        diameter:
          0.07146391866649002,
      })

    closeTo(
      result.maximumPipeLength,
      100,
      1e-9,
    )

    closeTo(
      result.totalPressureDrop,
      100000,
      1e-8,
    )
  },
)

test(
  'larger pressure-drop budget allows longer pipe',
  () => {
    const base =
      calculateMaximumPipeLengthFromPressureDrop(
        input,
      )

    const largerBudget =
      calculateMaximumPipeLengthFromPressureDrop({
        ...input,

        availablePressureDrop:
          150000,
      })

    closeTo(
      largerBudget.maximumPipeLength,
      293.4579651162405,
      1e-9,
    )

    assert.ok(
      largerBudget.maximumPipeLength >
      base.maximumPipeLength,
    )
  },
)

test(
  'removing minor losses increases allowable pipe length',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop({
        ...input,

        minorLossCoefficient:
          0,
      })

    closeTo(
      result.maximumPipeLength,
      209.42563195851665,
      1e-9,
    )

    assert.ok(
      result.maximumPipeLength >
      188.74514913698212,
    )
  },
)

test(
  'higher flow rate reduces allowable pipe length',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop({
        ...input,

        volumetricFlowRate:
          0.015,
      })

    closeTo(
      result.maximumPipeLength,
      74.84773092333485,
      1e-9,
    )

    assert.ok(
      result.maximumPipeLength <
      188.74514913698212,
    )
  },
)

test(
  'rejects pressure budget consumed by minor losses',
  () => {
    assert.throws(
      () =>
        calculateMaximumPipeLengthFromPressureDrop({
          ...input,

          availablePressureDrop:
            9000,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumPipeLengthFromPressureDropError &&
        error.code ===
          'PRESSURE_BUDGET_CONSUMED_BY_MINOR_LOSSES',
    )
  },
)

test(
  'rejects invalid shared hydraulic input',
  () => {
    assert.throws(
      () =>
        calculateMaximumPipeLengthFromPressureDrop({
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
  'exports pipe-length result as CSV',
  () => {
    const result =
      calculateMaximumPipeLengthFromPressureDrop(
        input,
      )

    const csv =
      createMaximumPipeLengthFromPressureDropCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum pipe length/,
    )

    assert.match(
      csv,
      /Pressure available for pipe friction/,
    )

    assert.match(
      csv,
      /Friction pressure drop per unit length/,
    )
  },
)
