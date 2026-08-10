import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelManningFlowError,
  calculateTrapezoidalChannelManningFlow,
  createTrapezoidalChannelManningFlowCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-manning-flow/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelManningFlow'

const input = {
  bottomWidth:
    2,

  flowDepth:
    1,

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
  'calculates trapezoidal channel geometry and Manning discharge',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelManningFlow',
    )

    const result =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    const expectedArea =
      3

    const expectedPerimeter =
      2 +
      2 *
      Math.sqrt(2)

    const expectedRadius =
      expectedArea /
      expectedPerimeter

    const expectedFlow =
      (
        1 /
        input.manningRoughness
      ) *
      expectedArea *
      expectedRadius **
        (
          2 / 3
        ) *
      Math.sqrt(
        input.channelSlope,
      )

    closeTo(
      result.flowArea,
      expectedArea,
      1e-14,
    )

    closeTo(
      result.wettedPerimeter,
      expectedPerimeter,
      1e-14,
    )

    closeTo(
      result.hydraulicRadius,
      expectedRadius,
      1e-14,
    )

    closeTo(
      result.volumetricFlowRate,
      expectedFlow,
      1e-12,
    )
  },
)

test(
  'calculates top width and hydraulic depth',
  () => {
    const result =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    closeTo(
      result.topWidth,
      4,
      1e-14,
    )

    closeTo(
      result.hydraulicDepth,
      0.75,
      1e-14,
    )
  },
)

test(
  'recovers the Manning roughness coefficient',
  () => {
    const result =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    closeTo(
      result.recoveredManningRoughness,
      input.manningRoughness,
      1e-14,
    )

    closeTo(
      result.manningClosureResidual,
      0,
      1e-14,
    )
  },
)

test(
  'flow scales with square root of channel slope',
  () => {
    const base =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    const steeper =
      calculateTrapezoidalChannelManningFlow({
        ...input,

        channelSlope:
          input.channelSlope *
          4,
      })

    closeTo(
      steeper.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'doubling Manning roughness halves discharge',
  () => {
    const base =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    const rougher =
      calculateTrapezoidalChannelManningFlow({
        ...input,

        manningRoughness:
          input.manningRoughness *
          2,
      })

    closeTo(
      rougher.volumetricFlowRate /
      base.volumetricFlowRate,
      0.5,
      1e-12,
    )
  },
)

test(
  'greater flow depth increases channel discharge',
  () => {
    const shallow =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    const deeper =
      calculateTrapezoidalChannelManningFlow({
        ...input,

        flowDepth:
          1.5,
      })

    assert.ok(
      deeper.volumetricFlowRate >
      shallow.volumetricFlowRate,
    )

    assert.ok(
      deeper.hydraulicRadius >
      shallow.hydraulicRadius,
    )
  },
)

test(
  'zero side slope reduces geometry to a rectangular channel',
  () => {
    const result =
      calculateTrapezoidalChannelManningFlow({
        ...input,

        sideSlopeHorizontalPerVertical:
          0,
      })

    closeTo(
      result.flowArea,
      input.bottomWidth *
      input.flowDepth,
      1e-14,
    )

    closeTo(
      result.topWidth,
      input.bottomWidth,
      1e-14,
    )

    closeTo(
      result.wettedPerimeter,
      input.bottomWidth +
      2 *
      input.flowDepth,
      1e-14,
    )
  },
)

test(
  'reports Froude number and open-channel regime',
  () => {
    const result =
      calculateTrapezoidalChannelManningFlow(
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
      input.flowDepth +
      result.meanVelocity *
      result.meanVelocity /
      (
        2 *
        9.80665
      ),
      1e-12,
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelManningFlow({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelManningFlowError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'rejects zero Manning roughness',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelManningFlow({
          ...input,

          manningRoughness:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelManningFlowError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)

test(
  'exports Manning channel results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelManningFlow(
        input,
      )

    const csv =
      createTrapezoidalChannelManningFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Hydraulic radius/,
    )

    assert.match(
      csv,
      /Froude number/,
    )

    assert.match(
      csv,
      /Recovered Manning roughness/,
    )
  },
)
