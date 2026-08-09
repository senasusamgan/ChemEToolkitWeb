import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DarcyWeisbachPipeDiameterSizingError,
  PipeHydraulicsCoreError,
  calculateDarcyWeisbachPipeDiameterSizing,
  calculatePipeHydraulicsState,
  createDarcyWeisbachPipeDiameterSizingCsv,
} from '../../src/features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/engine.ts'

const CALCULATOR_ID =
  'darcyWeisbachPipeDiameterSizing'

const input = {
  volumetricFlowRate: 0.01,
  pipeLength: 100,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,
  minorLossCoefficient: 5,

  targetPressureDrop: 100000,
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
  'sizes the pipe diameter for the target pressure drop',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'darcyWeisbachPipeDiameterSizing',
    )

    const result =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    closeTo(
      result.requiredDiameter,
      0.07146391866649002,
      1e-10,
    )

    closeTo(
      result.requiredDiameterMillimeters,
      71.46391866649002,
      1e-7,
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
  'returns expected hydraulic state at the solved diameter',
  () => {
    const result =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    closeTo(
      result.velocity,
      2.4930814379591855,
      1e-9,
    )

    closeTo(
      result.reynoldsNumber,
      177809.03837302868,
      1e-6,
    )

    closeTo(
      result.frictionFactor,
      0.01946844213943808,
      1e-12,
    )
  },
)

test(
  'reuses the shared hydraulic state evaluator',
  () => {
    const result =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    const direct =
      calculatePipeHydraulicsState({
        diameter:
          result.requiredDiameter,

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
          input.minorLossCoefficient,
      })

    closeTo(
      result.totalPressureDrop,
      direct.totalPressureDrop,
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
  'higher flow rate requires a larger diameter',
  () => {
    const base =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    const higherFlow =
      calculateDarcyWeisbachPipeDiameterSizing({
        ...input,

        volumetricFlowRate:
          0.02,
      })

    assert.ok(
      higherFlow.requiredDiameter >
      base.requiredDiameter,
    )

    closeTo(
      higherFlow.requiredDiameter,
      0.09408477033784034,
      1e-10,
    )
  },
)

test(
  'minor losses increase the required diameter',
  () => {
    const withoutMinorLoss =
      calculateDarcyWeisbachPipeDiameterSizing({
        ...input,

        minorLossCoefficient:
          0,
      })

    const withMinorLoss =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    assert.ok(
      withMinorLoss.requiredDiameter >
      withoutMinorLoss.requiredDiameter,
    )

    closeTo(
      withoutMinorLoss.requiredDiameter,
      0.06912989108209723,
      1e-10,
    )
  },
)

test(
  'rejects invalid pressure-drop target',
  () => {
    assert.throws(
      () =>
        calculateDarcyWeisbachPipeDiameterSizing({
          ...input,

          targetPressureDrop:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          DarcyWeisbachPipeDiameterSizingError &&
        error.code ===
          'INVALID_TARGET_PRESSURE_DROP',
    )
  },
)

test(
  'rejects invalid hydraulic inputs',
  () => {
    assert.throws(
      () =>
        calculateDarcyWeisbachPipeDiameterSizing({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PipeHydraulicsCoreError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)

test(
  'exports pipe-sizing result as CSV',
  () => {
    const result =
      calculateDarcyWeisbachPipeDiameterSizing(
        input,
      )

    const csv =
      createDarcyWeisbachPipeDiameterSizingCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required diameter/,
    )

    assert.match(
      csv,
      /Reynolds number/,
    )

    assert.match(
      csv,
      /Total pressure drop/,
    )
  },
)
