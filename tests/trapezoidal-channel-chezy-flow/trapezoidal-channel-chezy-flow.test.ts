import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelChezyFlowError,
  calculateTrapezoidalChannelChezyFlow,
  createTrapezoidalChannelChezyFlowCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-chezy-flow/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelChezyFlow'

const input = {
  bottomWidth:
    2,

  flowDepth:
    1.2,

  sideSlopeHorizontalPerVertical:
    1,

  channelSlope:
    0.002,

  chezyCoefficient:
    50,

  fluidDensity:
    998,
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
  'calculates trapezoidal Chezy flow',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelChezyFlow',
    )

    const result =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    closeTo(
      result.flowArea,
      3.84,
      1e-12,
    )

    closeTo(
      result.wettedPerimeter,
      5.3941125496954285,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      0.7118872594189419,
      1e-12,
    )

    closeTo(
      result.meanVelocity,
      1.8866468395263354,
      1e-12,
    )

    closeTo(
      result.volumetricFlowRate,
      7.244723863781128,
      1e-11,
    )
  },
)

test(
  'reports hydraulic and flow-regime quantities',
  () => {
    const result =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    closeTo(
      result.hydraulicDepth,
      0.8727272727272726,
      1e-12,
    )

    closeTo(
      result.froudeNumber,
      0.6448979563442059,
      1e-12,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    closeTo(
      result.boundaryShearStress,
      13.93453346839121,
      1e-10,
    )
  },
)

test(
  'equivalent Manning roughness reproduces Chezy velocity and flow',
  () => {
    const result =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    closeTo(
      result.equivalentManningRoughness,
      0.018898697158632658,
      1e-12,
    )

    closeTo(
      result.reconstructedManningVelocity,
      result.meanVelocity,
      1e-11,
    )

    closeTo(
      result.reconstructedManningFlowRate,
      result.volumetricFlowRate,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.flowClosureResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'flow rate scales linearly with Chezy coefficient',
  () => {
    const base =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    const doubled =
      calculateTrapezoidalChannelChezyFlow({
        ...input,

        chezyCoefficient:
          input.chezyCoefficient *
          2,
      })

    closeTo(
      doubled.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'flow rate follows square-root slope scaling',
  () => {
    const base =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    const fourTimesSlope =
      calculateTrapezoidalChannelChezyFlow({
        ...input,

        channelSlope:
          input.channelSlope *
          4,
      })

    closeTo(
      fourTimesSlope.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'density affects mass flow, shear and dissipation but not volumetric flow',
  () => {
    const base =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    const denser =
      calculateTrapezoidalChannelChezyFlow({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.volumetricFlowRate,
      base.volumetricFlowRate,
      1e-12,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.boundaryShearStress /
      base.boundaryShearStress,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipationPerLength /
      base.hydraulicPowerDissipationPerLength,
      2,
      1e-12,
    )
  },
)

test(
  'rectangular limit uses correct geometry when side slope is zero',
  () => {
    const result =
      calculateTrapezoidalChannelChezyFlow({
        ...input,

        sideSlopeHorizontalPerVertical:
          0,
      })

    const expectedArea =
      input.bottomWidth *
      input.flowDepth

    const expectedPerimeter =
      input.bottomWidth +
      2 *
      input.flowDepth

    const expectedRadius =
      expectedArea /
      expectedPerimeter

    closeTo(
      result.flowArea,
      expectedArea,
      1e-12,
    )

    closeTo(
      result.wettedPerimeter,
      expectedPerimeter,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      expectedRadius,
      1e-12,
    )
  },
)

test(
  'specific energy contains depth and velocity head',
  () => {
    const result =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    const expected =
      input.flowDepth +
      result.meanVelocity *
      result.meanVelocity /
      (
        2 *
        9.80665
      )

    closeTo(
      result.specificEnergy,
      expected,
      1e-12,
    )
  },
)

test(
  'rejects zero Chezy coefficient',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelChezyFlow({
          ...input,

          chezyCoefficient:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelChezyFlowError &&
        error.code ===
          'INVALID_CHEZY_COEFFICIENT',
    )
  },
)

test(
  'rejects zero channel slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelChezyFlow({
          ...input,

          channelSlope:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelChezyFlowError &&
        error.code ===
          'INVALID_CHANNEL_SLOPE',
    )
  },
)

test(
  'exports Chezy-flow results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelChezyFlow(
        input,
      )

    const csv =
      createTrapezoidalChannelChezyFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Equivalent Manning roughness/,
    )

    assert.match(
      csv,
      /Boundary shear stress/,
    )

    assert.match(
      csv,
      /Hydraulic power dissipation per length/,
    )
  },
)
