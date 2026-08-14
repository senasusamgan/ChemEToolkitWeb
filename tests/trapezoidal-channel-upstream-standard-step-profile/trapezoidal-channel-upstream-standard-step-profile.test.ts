import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelUpstreamStandardStepProfileError,
  calculateTrapezoidalChannelUpstreamStandardStepProfile,
  createTrapezoidalChannelUpstreamStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelStandardStepProfile,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-standard-step-profile/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelUpstreamStandardStepProfile'

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

  numberOfSteps:
    10,

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
  'recovers upstream M1 boundary depth from a known downstream control',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelUpstreamStandardStepProfile',
    )

    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
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

    closeTo(
      result.upstreamBoundaryDepth,
      1.5,
      2e-7,
    )

    closeTo(
      result.downstreamControlDepth,
      input.downstreamControlDepth,
      1e-12,
    )
  },
)


test(
  'builds ordered upstream-to-downstream profile stations',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    assert.equal(
      result.profilePoints.length,
      11,
    )

    closeTo(
      result.profilePoints[0].distanceFromUpstream,
      0,
      1e-12,
    )

    closeTo(
      result.profilePoints[0].distanceFromDownstream,
      100,
      1e-12,
    )

    closeTo(
      result.profilePoints.at(-1)!.distanceFromUpstream,
      100,
      1e-12,
    )

    closeTo(
      result.profilePoints.at(-1)!.distanceFromDownstream,
      0,
      1e-12,
    )

    for (
      let index = 1;
      index <
      result.profilePoints.length;
      index += 1
    ) {
      assert.ok(
        result.profilePoints[index].flowDepth >
        result.profilePoints[index - 1].flowDepth,
      )

      assert.ok(
        result.profilePoints[index]
          .cumulativeFrictionHeadLoss >
        result.profilePoints[index - 1]
          .cumulativeFrictionHeadLoss,
      )
    }
  },
)


test(
  'reports M1 endpoint hydraulic states',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      6.75,
      2e-7,
    )

    closeTo(
      result.upstreamVelocity,
      0.7407407407407407,
      2e-7,
    )

    closeTo(
      result.upstreamFroudeNumber,
      0.2230127188897716,
      2e-7,
    )

    closeTo(
      result.downstreamFroudeNumber,
      0.21023566633770005,
      2e-7,
    )

    assert.ok(
      result.upstreamFroudeNumber <
      1,
    )

    assert.ok(
      result.downstreamFroudeNumber <
      1,
    )
  },
)


test(
  'closes total reverse standard-step energy balance',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy,
      1.5279757534424672,
      2e-7,
    )

    closeTo(
      result.downstreamSpecificEnergy,
      1.5768966623532203,
      2e-7,
    )

    closeTo(
      result.totalFrictionHeadLoss,
      0.0510790910892276,
      3e-7,
    )

    assert.ok(
      Math.abs(
        result.cumulativeSegmentEnergyResidual,
      ) <
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.totalEnergyClosureResidual,
      ) <
      1e-8,
    )
  },
)


test(
  'Calculator 451 forward profile closes the reverse calculation',
  () => {
    const reverse =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    const forward =
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
          reverse.upstreamBoundaryDepth,

        totalReachLength:
          input.upstreamReachLength,

        numberOfSteps:
          input.numberOfSteps,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      forward.finalFlowDepth,
      input.downstreamControlDepth,
      2e-6,
    )

    closeTo(
      forward.totalFrictionHeadLoss,
      reverse.totalFrictionHeadLoss,
      2e-6,
    )
  },
)


test(
  'recovers an upstream M2 boundary depth',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile({
        ...input,

        downstreamControlDepth:
          0.9624417809015688,

        upstreamReachLength:
          20,

        numberOfSteps:
          4,
      })

    assert.equal(
      result.profileClassification,
      'M2',
    )

    assert.equal(
      result.profileTrendDownstream,
      'Flow depth decreases downstream',
    )

    closeTo(
      result.upstreamBoundaryDepth,
      1,
      2e-7,
    )

    assert.ok(
      result.downstreamFroudeNumber >
      result.upstreamFroudeNumber,
    )
  },
)


test(
  'M2 reverse-forward closure reproduces downstream boundary',
  () => {
    const reverse =
      calculateTrapezoidalChannelUpstreamStandardStepProfile({
        ...input,

        downstreamControlDepth:
          0.9624417809015688,

        upstreamReachLength:
          20,

        numberOfSteps:
          4,
      })

    const forward =
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
          reverse.upstreamBoundaryDepth,

        totalReachLength:
          20,

        numberOfSteps:
          4,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      forward.finalFlowDepth,
      0.9624417809015688,
      2e-6,
    )
  },
)


test(
  'density changes mass and power but not reverse hydraulic profile',
  () => {
    const base =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    const denser =
      calculateTrapezoidalChannelUpstreamStandardStepProfile({
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
  'reports bed and water-surface changes downstream',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    closeTo(
      result.downstreamDepthChange,
      0.0513281356840372,
      3e-7,
    )

    closeTo(
      result.bedElevationChangeDownstream,
      -0.1,
      1e-12,
    )

    closeTo(
      result.waterSurfaceElevationChangeDownstream,
      -0.0486718643159628,
      3e-7,
    )

    assert.ok(
      result.hydraulicPowerDissipated >
      0,
    )
  },
)


test(
  'rejects downstream boundary at normal-depth asymptote',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelUpstreamStandardStepProfile({
          ...input,

          downstreamControlDepth:
            1.2673820928126296,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelUpstreamStandardStepProfileError &&
        error.code ===
          'BOUNDARY_AT_ASYMPTOTE',
    )
  },
)


test(
  'rejects non-integer number of reverse steps',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelUpstreamStandardStepProfile({
          ...input,

          numberOfSteps:
            10.5,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_NUMBER_OF_STEPS',
    )
  },
)


test(
  'exports reverse standard-step profile as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelUpstreamStandardStepProfile(
        input,
      )

    const csv =
      createTrapezoidalChannelUpstreamStandardStepProfileCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Upstream boundary depth/,
    )

    assert.match(
      csv,
      /Distance from Downstream/,
    )

    assert.match(
      csv,
      /Total friction head loss/,
    )

    assert.match(
      csv,
      /Cumulative Friction Head/,
    )
  },
)
