import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelNormalDepthError,
  calculateTrapezoidalChannelNormalDepth,
  createTrapezoidalChannelNormalDepthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-normal-depth/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelNormalDepth'

const referenceFlow =
  4.605113920246504

const input = {
  bottomWidth:
    2,

  targetVolumetricFlowRate:
    referenceFlow,

  sideSlopeHorizontalPerVertical:
    1,

  channelSlope:
    0.001,

  manningRoughness:
    0.015,

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
  'recovers one-meter normal depth from known Manning discharge',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelNormalDepth',
    )

    const result =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    closeTo(
      result.normalDepth,
      1,
      1e-9,
    )

    closeTo(
      result.calculatedVolumetricFlowRate,
      referenceFlow,
      1e-9,
    )
  },
)

test(
  'closes the target-discharge residual',
  () => {
    const result =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    assert.ok(
      Math.abs(
        result.dischargeResidual,
      ) <=
      referenceFlow *
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.relativeDischargeResidual,
      ) <=
      1e-10,
    )

    assert.ok(
      result.solverIterations >
      0,
    )
  },
)

test(
  'recovers known trapezoidal geometry at one-meter depth',
  () => {
    const result =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    closeTo(
      result.flowArea,
      3,
      1e-8,
    )

    closeTo(
      result.topWidth,
      4,
      1e-8,
    )

    closeTo(
      result.wettedPerimeter,
      2 +
      2 *
      Math.sqrt(2),
      1e-8,
    )
  },
)

test(
  'higher target discharge requires greater normal depth',
  () => {
    const base =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    const higherFlow =
      calculateTrapezoidalChannelNormalDepth({
        ...input,

        targetVolumetricFlowRate:
          input.targetVolumetricFlowRate *
          2,
      })

    assert.ok(
      higherFlow.normalDepth >
      base.normalDepth,
    )
  },
)

test(
  'greater Manning roughness requires greater normal depth',
  () => {
    const base =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    const rougher =
      calculateTrapezoidalChannelNormalDepth({
        ...input,

        manningRoughness:
          input.manningRoughness *
          1.5,
      })

    assert.ok(
      rougher.normalDepth >
      base.normalDepth,
    )
  },
)

test(
  'steeper channel requires less normal depth for the same flow',
  () => {
    const base =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    const steeper =
      calculateTrapezoidalChannelNormalDepth({
        ...input,

        channelSlope:
          input.channelSlope *
          4,
      })

    assert.ok(
      steeper.normalDepth <
      base.normalDepth,
    )
  },
)

test(
  'supports rectangular-channel limit with zero side slope',
  () => {
    const width =
      2

    const depth =
      0.8

    const slope =
      0.001

    const roughness =
      0.015

    const area =
      width *
      depth

    const perimeter =
      width +
      2 *
      depth

    const radius =
      area /
      perimeter

    const target =
      (
        1 /
        roughness
      ) *
      area *
      radius **
        (
          2 / 3
        ) *
      Math.sqrt(
        slope,
      )

    const result =
      calculateTrapezoidalChannelNormalDepth({
        bottomWidth:
          width,

        targetVolumetricFlowRate:
          target,

        sideSlopeHorizontalPerVertical:
          0,

        channelSlope:
          slope,

        manningRoughness:
          roughness,

        fluidDensity:
          998,
      })

    closeTo(
      result.normalDepth,
      depth,
      1e-9,
    )

    closeTo(
      result.topWidth,
      width,
      1e-12,
    )
  },
)

test(
  'reports Froude regime and specific energy',
  () => {
    const result =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    assert.ok(
      result.froudeNumber >
      0,
    )

    assert.ok(
      [
        'subcritical',
        'critical',
        'supercritical',
      ].includes(
        result.flowRegime,
      ),
    )

    closeTo(
      result.specificEnergy,
      result.normalDepth +
      result.velocityHead,
      1e-10,
    )
  },
)

test(
  'rejects zero target discharge',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelNormalDepth({
          ...input,

          targetVolumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelNormalDepthError &&
        error.code ===
          'INVALID_TARGET_FLOW',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelNormalDepth({
          ...input,

          sideSlopeHorizontalPerVertical:
            -0.5,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelNormalDepthError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports normal-depth solution as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelNormalDepth(
        input,
      )

    const csv =
      createTrapezoidalChannelNormalDepthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Normal depth/,
    )

    assert.match(
      csv,
      /Discharge residual/,
    )

    assert.match(
      csv,
      /Solver iterations/,
    )
  },
)
