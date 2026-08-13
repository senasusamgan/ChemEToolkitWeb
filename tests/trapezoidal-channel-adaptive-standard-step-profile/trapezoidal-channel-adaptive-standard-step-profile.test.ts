import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelAdaptiveStandardStepProfileError,
  calculateTrapezoidalChannelAdaptiveStandardStepProfile,
  createTrapezoidalChannelAdaptiveStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelStandardStepProfile,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelGvfProfileRk4,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelAdaptiveStandardStepProfile'

const input = {
  bottomWidth:
    3,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  manningRoughness:
    0.03,

  channelSlope:
    0.001,

  initialFlowDepth:
    1.5,

  totalReachLength:
    100,

  maximumStepLength:
    25,

  maximumDepthChangePerStep:
    0.008,

  minimumStepLength:
    0.1,

  fluidDensity:
    998,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-8,
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
  'generates an adaptive M1 standard-step profile',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelAdaptiveStandardStepProfile',
    )

    const result =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    assert.equal(
      result.channelSlopeClass,
      'mild',
    )

    assert.equal(
      result.startProfileClassification,
      'M1',
    )

    assert.equal(
      result.endProfileClassification,
      'M1',
    )

    assert.equal(
      result.profileTrend,
      'Flow depth increases downstream',
    )

    assert.ok(
      result.finalFlowDepth >
      input.initialFlowDepth,
    )

    closeTo(
      result.profilePoints.at(-1)!.distance,
      input.totalReachLength,
      1e-10,
    )
  },
)

test(
  'automatically reduces oversized candidate steps',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    assert.ok(
      result.adaptiveReductionCount >
      0,
    )

    assert.ok(
      result.attemptedStepCount >
      result.acceptedStepCount,
    )

    assert.ok(
      result.maximumAcceptedStepLength <=
      input.maximumStepLength +
      1e-12,
    )

    assert.ok(
      result.maximumDepthChangeObserved <=
      input.maximumDepthChangePerStep +
      1e-9,
    )
  },
)

test(
  'profile station count equals accepted segments plus one',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    assert.equal(
      result.profilePoints.length,
      result.acceptedStepCount +
      1,
    )

    assert.equal(
      result.profilePoints[0].stepIndex,
      0,
    )

    assert.equal(
      result.profilePoints[0].distance,
      0,
    )

    for (
      let index = 1;
      index <
      result.profilePoints.length;
      index += 1
    ) {
      assert.ok(
        result.profilePoints[index].distance >
        result.profilePoints[index - 1].distance,
      )

      assert.ok(
        Math.abs(
          result.profilePoints[index]
            .depthChangeFromPrevious,
        ) <=
        input.maximumDepthChangePerStep +
        1e-9,
      )
    }
  },
)

test(
  'loose adaptive criterion reproduces Calculator 451 fixed ten-step profile',
  () => {
    const adaptive =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
        ...input,

        maximumStepLength:
          10,

        maximumDepthChangePerStep:
          1,
      })

    const fixed =
      calculateTrapezoidalChannelStandardStepProfile({
        bottomWidth:
          input.bottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          input.channelSlope,

        initialFlowDepth:
          input.initialFlowDepth,

        totalReachLength:
          input.totalReachLength,

        numberOfSteps:
          10,

        fluidDensity:
          input.fluidDensity,
      })

    assert.equal(
      adaptive.acceptedStepCount,
      10,
    )

    assert.equal(
      adaptive.adaptiveReductionCount,
      0,
    )

    closeTo(
      adaptive.finalFlowDepth,
      fixed.finalFlowDepth,
      1e-10,
    )

    closeTo(
      adaptive.totalFrictionHeadLoss,
      fixed.totalFrictionHeadLoss,
      1e-10,
    )
  },
)

test(
  'adaptive endpoint agrees closely with RK4 GVF profile',
  () => {
    const adaptive =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    const rk4 =
      calculateTrapezoidalChannelGvfProfileRk4({
        bottomWidth:
          input.bottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          input.channelSlope,

        initialFlowDepth:
          input.initialFlowDepth,

        downstreamReachLength:
          input.totalReachLength,

        integrationSteps:
          1200,

        fluidDensity:
          input.fluidDensity,
      })

    assert.ok(
      Math.abs(
        adaptive.finalFlowDepth -
        rk4.finalFlowDepth,
      ) <
      2e-4,
    )
  },
)

test(
  'tighter depth-change criterion creates more accepted steps',
  () => {
    const loose =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
        ...input,

        maximumDepthChangePerStep:
          0.02,
      })

    const tight =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
        ...input,

        maximumDepthChangePerStep:
          0.004,
      })

    assert.ok(
      tight.acceptedStepCount >
      loose.acceptedStepCount,
    )

    assert.ok(
      tight.maximumDepthChangeObserved <=
      0.004 +
      1e-9,
    )
  },
)

test(
  'cumulative friction and energy equations close',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    assert.ok(
      result.totalFrictionHeadLoss >
      0,
    )

    assert.ok(
      result.averageFrictionSlope >
      0,
    )

    assert.ok(
      Math.abs(
        result.cumulativeSegmentEnergyResidual,
      ) <
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.totalEnergyClosureResidual,
      ) <
      1e-7,
    )

    closeTo(
      result.averageAcceptedStepLength *
      result.acceptedStepCount,
      input.totalReachLength,
      1e-8,
    )
  },
)

test(
  'solves an adaptive M2 drawdown profile',
  () => {
    const m2Input = {
      ...input,

      initialFlowDepth:
        1,

      totalReachLength:
        20,

      maximumStepLength:
        10,

      maximumDepthChangePerStep:
        0.01,
    }

    const adaptive =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        m2Input,
      )

    const rk4 =
      calculateTrapezoidalChannelGvfProfileRk4({
        bottomWidth:
          m2Input.bottomWidth,

        sideSlopeHorizontalPerVertical:
          m2Input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          m2Input.volumetricFlowRate,

        manningRoughness:
          m2Input.manningRoughness,

        channelSlope:
          m2Input.channelSlope,

        initialFlowDepth:
          m2Input.initialFlowDepth,

        downstreamReachLength:
          m2Input.totalReachLength,

        integrationSteps:
          1000,

        fluidDensity:
          m2Input.fluidDensity,
      })

    assert.equal(
      adaptive.startProfileClassification,
      'M2',
    )

    assert.equal(
      adaptive.endProfileClassification,
      'M2',
    )

    assert.equal(
      adaptive.profileTrend,
      'Flow depth decreases downstream',
    )

    assert.ok(
      adaptive.finalFlowDepth <
      m2Input.initialFlowDepth,
    )

    assert.ok(
      Math.abs(
        adaptive.finalFlowDepth -
        rk4.finalFlowDepth,
      ) <
      2e-4,
    )
  },
)

test(
  'density changes mass and power but not adaptive hydraulic profile',
  () => {
    const base =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    const denser =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.finalFlowDepth,
      base.finalFlowDepth,
      1e-10,
    )

    assert.equal(
      denser.acceptedStepCount,
      base.acceptedStepCount,
    )

    closeTo(
      denser.totalFrictionHeadLoss,
      base.totalFrictionHeadLoss,
      1e-10,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipated /
      base.hydraulicPowerDissipated,
      2,
      1e-12,
    )
  },
)

test(
  'rejects non-positive maximum depth change',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelAdaptiveStandardStepProfile({
          ...input,

          maximumDepthChangePerStep:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelAdaptiveStandardStepProfileError &&
        error.code ===
          'INVALID_MAXIMUM_DEPTH_CHANGE',
    )
  },
)

test(
  'rejects minimum step longer than maximum step',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelAdaptiveStandardStepProfile({
          ...input,

          maximumStepLength:
            5,

          minimumStepLength:
            10,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelAdaptiveStandardStepProfileError &&
        error.code ===
          'INVALID_STEP_LIMITS',
    )
  },
)

test(
  'exports adaptive profile stations as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile(
        input,
      )

    const csv =
      createTrapezoidalChannelAdaptiveStandardStepProfileCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Adaptive reductions/,
    )

    assert.match(
      csv,
      /Maximum depth change observed/,
    )

    assert.match(
      csv,
      /Accepted dx/,
    )

    assert.match(
      csv,
      /Cumulative Friction Head/,
    )
  },
)
