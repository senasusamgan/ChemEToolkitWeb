import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError,
  calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile,
  createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelUpstreamStandardStepProfile,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelAdaptiveStandardStepProfile,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelAdaptiveUpstreamStandardStepProfile'

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

  downstreamControlDepth:
    1.5513281356840372,

  upstreamReachLength:
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
  'generates adaptive reverse M1 profile',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelAdaptiveUpstreamStandardStepProfile',
    )

    const result =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
        input,
      )

    assert.equal(
      result.channelSlopeClass,
      'mild',
    )

    assert.equal(
      result.profileClassification,
      'M1',
    )

    assert.equal(
      result.profileTrendDownstream,
      'Flow depth increases downstream',
    )

    assert.ok(
      result.upstreamBoundaryDepth <
      result.downstreamControlDepth,
    )

    assert.ok(
      Math.abs(
        result.upstreamBoundaryDepth -
        1.5
      ) <
      5e-4,
    )
  },
)


test(
  'automatically reduces oversized reverse steps',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
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
  'orders adaptive stations upstream to downstream',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
        input,
      )

    assert.equal(
      result.profilePoints.length,
      result.acceptedStepCount +
      1,
    )

    closeTo(
      result.profilePoints[0]
        .distanceFromUpstream,
      0,
      1e-8,
    )

    closeTo(
      result.profilePoints[0]
        .distanceFromDownstream,
      input.upstreamReachLength,
      1e-8,
    )

    closeTo(
      result.profilePoints.at(-1)!
        .distanceFromUpstream,
      input.upstreamReachLength,
      1e-8,
    )

    closeTo(
      result.profilePoints.at(-1)!
        .distanceFromDownstream,
      0,
      1e-8,
    )

    for (
      let index = 1;
      index <
      result.profilePoints.length;
      index += 1
    ) {
      assert.ok(
        result.profilePoints[index]
          .distanceFromUpstream >
        result.profilePoints[index - 1]
          .distanceFromUpstream,
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
  'loose adaptive criterion reproduces Calculator 453 fixed profile',
  () => {
    const adaptive =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
        ...input,

        maximumStepLength:
          10,

        maximumDepthChangePerStep:
          1,
      })

    const fixed =
      calculateTrapezoidalChannelUpstreamStandardStepProfile({
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

        downstreamControlDepth:
          input.downstreamControlDepth,

        upstreamReachLength:
          input.upstreamReachLength,

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
      adaptive.upstreamBoundaryDepth,
      fixed.upstreamBoundaryDepth,
      1e-9,
    )

    closeTo(
      adaptive.totalFrictionHeadLoss,
      fixed.totalFrictionHeadLoss,
      1e-9,
    )
  },
)


test(
  'Calculator 452 forward adaptive profile closes reverse profile',
  () => {
    const forward =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
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
          1.5,

        totalReachLength:
          input.upstreamReachLength,

        maximumStepLength:
          input.maximumStepLength,

        maximumDepthChangePerStep:
          input.maximumDepthChangePerStep,

        minimumStepLength:
          input.minimumStepLength,

        fluidDensity:
          input.fluidDensity,
      })

    const reverse =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
        ...input,

        downstreamControlDepth:
          forward.finalFlowDepth,
      })

    assert.ok(
      Math.abs(
        reverse.upstreamBoundaryDepth -
        1.5
      ) <
      5e-4,
    )
  },
)


test(
  'tighter depth-change criterion creates more reverse steps',
  () => {
    const loose =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
        ...input,

        maximumDepthChangePerStep:
          0.02,
      })

    const tight =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
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
  'solves adaptive reverse M2 profile',
  () => {
    const forward =
      calculateTrapezoidalChannelAdaptiveStandardStepProfile({
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
          1,

        totalReachLength:
          20,

        maximumStepLength:
          10,

        maximumDepthChangePerStep:
          0.01,

        minimumStepLength:
          0.1,

        fluidDensity:
          998,
      })

    const reverse =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
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

        downstreamControlDepth:
          forward.finalFlowDepth,

        upstreamReachLength:
          20,

        maximumStepLength:
          10,

        maximumDepthChangePerStep:
          0.01,

        minimumStepLength:
          0.1,

        fluidDensity:
          998,
      })

    assert.equal(
      reverse.profileClassification,
      'M2',
    )

    assert.equal(
      reverse.profileTrendDownstream,
      'Flow depth decreases downstream',
    )

    assert.ok(
      Math.abs(
        reverse.upstreamBoundaryDepth -
        1
      ) <
      5e-4,
    )

    assert.ok(
      reverse.downstreamFroudeNumber >
      reverse.upstreamFroudeNumber,
    )
  },
)


test(
  'closes cumulative hydraulic energy equation',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
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
      input.upstreamReachLength,
      1e-8,
    )
  },
)


test(
  'density changes mass and power but not reverse hydraulics',
  () => {
    const base =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
        input,
      )

    const denser =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.upstreamBoundaryDepth,
      base.upstreamBoundaryDepth,
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
  'rejects invalid adaptive step limits',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile({
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
          TrapezoidalChannelAdaptiveUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_STEP_LIMITS',
    )
  },
)


test(
  'exports adaptive upstream profile CSV',
  () => {
    const result =
      calculateTrapezoidalChannelAdaptiveUpstreamStandardStepProfile(
        input,
      )

    const csv =
      createTrapezoidalChannelAdaptiveUpstreamStandardStepProfileCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Upstream boundary depth/,
    )

    assert.match(
      csv,
      /Adaptive reductions/,
    )

    assert.match(
      csv,
      /Distance from Downstream/,
    )

    assert.match(
      csv,
      /Cumulative Friction Head/,
    )
  },
)
