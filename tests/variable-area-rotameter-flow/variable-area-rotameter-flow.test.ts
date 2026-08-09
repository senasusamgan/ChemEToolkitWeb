import assert from 'node:assert/strict'
import test from 'node:test'

import {
  VariableAreaRotameterFlowError,
  calculateVariableAreaRotameterFlow,
  createVariableAreaRotameterFlowCsv,
} from '../../src/features/fluid-mechanics/variable-area-rotameter-flow/engine.ts'

const CALCULATOR_ID =
  'variableAreaRotameterFlow'

const input = {
  fluidDensity:
    998,

  floatDensity:
    7800,

  floatVolume:
    1.2e-5,

  floatProjectedArea:
    3e-4,

  annularFlowArea:
    5e-4,

  dragCoefficient:
    0.9,
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
  'calculates variable-area rotameter flow from float force balance',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'variableAreaRotameterFlow',
    )

    const result =
      calculateVariableAreaRotameterFlow(
        input,
      )

    closeTo(
      result.effectiveFloatWeight,
      0.8004579996,
      1e-12,
    )

    closeTo(
      result.equilibriumVelocity,
      2.4374578801264106,
      1e-12,
    )

    closeTo(
      result.volumetricFlowRate,
      0.0012187289400632053,
      1e-15,
    )

    closeTo(
      result.volumetricFlowRateCubicMetersPerHour,
      4.387424184227539,
      1e-12,
    )

    closeTo(
      result.massFlowRate,
      1.2162914821830788,
      1e-12,
    )
  },
)

test(
  'closes the float drag and effective-weight force balance',
  () => {
    const result =
      calculateVariableAreaRotameterFlow(
        input,
      )

    closeTo(
      result.dragForce,
      result.effectiveFloatWeight,
      1e-12,
    )

    closeTo(
      result.forceBalanceResidual,
      0,
      1e-12,
    )
  },
)

test(
  'annular area scales flow linearly without changing equilibrium velocity',
  () => {
    const base =
      calculateVariableAreaRotameterFlow(
        input,
      )

    const doubledArea =
      calculateVariableAreaRotameterFlow({
        ...input,

        annularFlowArea:
          input.annularFlowArea *
          2,
      })

    closeTo(
      doubledArea.equilibriumVelocity,
      base.equilibriumVelocity,
      1e-12,
    )

    closeTo(
      doubledArea.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'four times float volume doubles equilibrium velocity',
  () => {
    const base =
      calculateVariableAreaRotameterFlow(
        input,
      )

    const largerFloatVolume =
      calculateVariableAreaRotameterFlow({
        ...input,

        floatVolume:
          input.floatVolume *
          4,
      })

    closeTo(
      largerFloatVolume.equilibriumVelocity /
      base.equilibriumVelocity,
      2,
      1e-12,
    )
  },
)

test(
  'four times drag coefficient halves equilibrium velocity',
  () => {
    const base =
      calculateVariableAreaRotameterFlow(
        input,
      )

    const higherDrag =
      calculateVariableAreaRotameterFlow({
        ...input,

        dragCoefficient:
          input.dragCoefficient *
          4,
      })

    closeTo(
      higherDrag.equilibriumVelocity /
      base.equilibriumVelocity,
      0.5,
      1e-12,
    )
  },
)

test(
  'denser float requires greater flow velocity',
  () => {
    const base =
      calculateVariableAreaRotameterFlow(
        input,
      )

    const denserFloat =
      calculateVariableAreaRotameterFlow({
        ...input,

        floatDensity:
          9000,
      })

    assert.ok(
      denserFloat.equilibriumVelocity >
      base.equilibriumVelocity,
    )

    assert.ok(
      denserFloat.volumetricFlowRate >
      base.volumetricFlowRate,
    )
  },
)

test(
  'rejects float density not greater than fluid density',
  () => {
    assert.throws(
      () =>
        calculateVariableAreaRotameterFlow({
          ...input,

          floatDensity:
            input.fluidDensity,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VariableAreaRotameterFlowError &&
        error.code ===
          'FLOAT_NOT_DENSER_THAN_FLUID',
    )
  },
)

test(
  'rejects invalid annular flow area',
  () => {
    assert.throws(
      () =>
        calculateVariableAreaRotameterFlow({
          ...input,

          annularFlowArea:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          VariableAreaRotameterFlowError &&
        error.code ===
          'INVALID_ANNULAR_FLOW_AREA',
    )
  },
)

test(
  'exports rotameter force-balance results as CSV',
  () => {
    const result =
      calculateVariableAreaRotameterFlow(
        input,
      )

    const csv =
      createVariableAreaRotameterFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Effective float weight/,
    )

    assert.match(
      csv,
      /Equilibrium annular velocity/,
    )

    assert.match(
      csv,
      /Force-balance residual/,
    )
  },
)
