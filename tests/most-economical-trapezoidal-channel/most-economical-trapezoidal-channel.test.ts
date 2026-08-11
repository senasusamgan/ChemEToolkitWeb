import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MostEconomicalTrapezoidalChannelError,
  calculateMostEconomicalTrapezoidalChannel,
  createMostEconomicalTrapezoidalChannelCsv,
} from '../../src/features/fluid-mechanics/most-economical-trapezoidal-channel/engine.ts'

const CALCULATOR_ID =
  'mostEconomicalTrapezoidalChannelDesign'

const input = {
  volumetricFlowRate:
    5,

  channelSlope:
    0.002,

  manningRoughness:
    0.015,

  sideSlopeHorizontalPerVertical:
    1,

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
  'designs the most economical trapezoidal Manning section',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'mostEconomicalTrapezoidalChannelDesign',
    )

    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    closeTo(
      result.flowDepth,
      1.1512860110748115,
      1e-11,
    )

    closeTo(
      result.bottomWidth,
      0.9537565599152167,
      1e-11,
    )

    closeTo(
      result.flowArea,
      2.4235060646977753,
      1e-11,
    )

    closeTo(
      result.wettedPerimeter,
      4.2100851419800565,
      1e-11,
    )
  },
)

test(
  'satisfies the best-hydraulic trapezoid geometry condition',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    closeTo(
      result.halfTopWidth,
      result.sideLength,
      1e-12,
    )

    assert.ok(
      Math.abs(
        result.optimumGeometryResidual,
      ) <=
      1e-12,
    )
  },
)

test(
  'hydraulic radius equals one-half flow depth',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    closeTo(
      result.hydraulicRadius,
      result.flowDepth /
      2,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      0.5756430055374058,
      1e-11,
    )

    assert.ok(
      Math.abs(
        result.hydraulicRadiusResidual,
      ) <=
      1e-12,
    )
  },
)

test(
  'forward Manning solver reconstructs the design flow',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    closeTo(
      result.reconstructedFlowRate,
      input.volumetricFlowRate,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.flowClosureResidual,
      ) <=
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.relativeFlowClosureResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'reports velocity Froude number and hydraulic depth',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    closeTo(
      result.meanVelocity,
      2.0631266712441785,
      1e-11,
    )

    closeTo(
      result.hydraulicDepth,
      0.7442449383167066,
      1e-11,
    )

    closeTo(
      result.froudeNumber,
      0.7636733071342928,
      1e-11,
    )

    assert.equal(
      result.flowRegime,
      'subcritical',
    )
  },
)

test(
  'flow depth scales with discharge to the three-eighths power',
  () => {
    const base =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    const doubledFlow =
      calculateMostEconomicalTrapezoidalChannel({
        ...input,

        volumetricFlowRate:
          input.volumetricFlowRate *
          2,
      })

    closeTo(
      doubledFlow.flowDepth /
      base.flowDepth,
      2 **
        (
          3 / 8
        ),
      1e-12,
    )
  },
)

test(
  'flow depth scales with Manning roughness to the three-eighths power',
  () => {
    const base =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    const doubledRoughness =
      calculateMostEconomicalTrapezoidalChannel({
        ...input,

        manningRoughness:
          input.manningRoughness *
          2,
      })

    closeTo(
      doubledRoughness.flowDepth /
      base.flowDepth,
      2 **
        (
          3 / 8
        ),
      1e-12,
    )
  },
)

test(
  'rectangular limit gives bottom width equal to twice the depth',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel({
        ...input,

        sideSlopeHorizontalPerVertical:
          0,
      })

    closeTo(
      result.bottomWidth,
      2 *
      result.flowDepth,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      result.flowDepth /
      2,
      1e-12,
    )
  },
)

test(
  'density affects shear mass flow and dissipation but not geometry',
  () => {
    const base =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    const denser =
      calculateMostEconomicalTrapezoidalChannel({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.flowDepth,
      base.flowDepth,
      1e-12,
    )

    closeTo(
      denser.bottomWidth,
      base.bottomWidth,
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
  'rejects zero design flow',
  () => {
    assert.throws(
      () =>
        calculateMostEconomicalTrapezoidalChannel({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MostEconomicalTrapezoidalChannelError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateMostEconomicalTrapezoidalChannel({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MostEconomicalTrapezoidalChannelError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports economical-channel design as CSV',
  () => {
    const result =
      calculateMostEconomicalTrapezoidalChannel(
        input,
      )

    const csv =
      createMostEconomicalTrapezoidalChannelCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Optimal flow depth/,
    )

    assert.match(
      csv,
      /Optimal bottom width/,
    )

    assert.match(
      csv,
      /Optimum geometry residual/,
    )

    assert.match(
      csv,
      /Reconstructed flow rate/,
    )
  },
)
