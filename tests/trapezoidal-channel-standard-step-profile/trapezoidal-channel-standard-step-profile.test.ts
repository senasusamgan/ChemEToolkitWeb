import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelStandardStepProfileError,
  calculateTrapezoidalChannelStandardStepProfile,
  createTrapezoidalChannelStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-standard-step-profile/engine.ts'

import {
  calculateTrapezoidalChannelStandardStep,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-standard-step/engine.ts'

import {
  calculateTrapezoidalChannelGvfProfileRk4,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelStandardStepProfile'

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
  'calculates a ten-reach M1 standard-step profile',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelStandardStepProfile',
    )

    const result =
      calculateTrapezoidalChannelStandardStepProfile(
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

    closeTo(
      result.finalFlowDepth,
      1.5513281356840372,
      2e-7,
    )
  },
)

test(
  'creates one profile station per segment boundary',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    assert.equal(
      result.profilePoints.length,
      11,
    )

    assert.equal(
      result.profilePoints[0].stepIndex,
      0,
    )

    assert.equal(
      result.profilePoints[10].stepIndex,
      10,
    )

    closeTo(
      result.profilePoints[0].distance,
      0,
      1e-12,
    )

    closeTo(
      result.profilePoints[10].distance,
      100,
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
  'reports expected endpoint hydraulics',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    closeTo(
      result.startFlowArea,
      6.75,
      1e-12,
    )

    closeTo(
      result.finalFlowArea,
      7.060603391617022,
      2e-7,
    )

    closeTo(
      result.startVelocity,
      0.7407407407407407,
      1e-12,
    )

    closeTo(
      result.finalVelocity,
      0.7081547741282913,
      2e-7,
    )

    closeTo(
      result.startFroudeNumber,
      0.2230127188897716,
      1e-9,
    )

    closeTo(
      result.finalFroudeNumber,
      0.21023566633770005,
      2e-7,
    )
  },
)

test(
  'accumulates segment friction and closes total energy',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    closeTo(
      result.totalFrictionHeadLoss,
      0.05107909108922552,
      2e-7,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0005107909108922552,
      2e-9,
    )

    closeTo(
      result.startSpecificEnergy,
      1.5279757534424672,
      1e-10,
    )

    closeTo(
      result.finalSpecificEnergy,
      1.5768966623532203,
      2e-7,
    )

    assert.ok(
      Math.abs(
        result.cumulativeSegmentEnergyResidual,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.totalEnergyClosureResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'reports bed water-surface and power terms',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    closeTo(
      result.depthChange,
      0.0513281356840372,
      2e-7,
    )

    closeTo(
      result.bedElevationChange,
      -0.1,
      1e-12,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.04867186431596285,
      2e-7,
    )

    closeTo(
      result.hydraulicPowerDissipated,
      2499.5646954644653,
      0.02,
    )

    closeTo(
      result.massFlowRate,
      4990,
      1e-10,
    )
  },
)

test(
  'one profile step reproduces Calculator 450 exactly',
  () => {
    const profile =
      calculateTrapezoidalChannelStandardStepProfile({
        ...input,

        numberOfSteps:
          1,
      })

    const single =
      calculateTrapezoidalChannelStandardStep({
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

        startDepth:
          input.initialFlowDepth,

        downstreamReachLength:
          input.totalReachLength,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      profile.finalFlowDepth,
      single.endDepth,
      1e-10,
    )

    closeTo(
      profile.totalFrictionHeadLoss,
      single.frictionHeadLoss,
      1e-10,
    )
  },
)

test(
  'standard-step profile agrees closely with RK4 GVF endpoint',
  () => {
    const standard =
      calculateTrapezoidalChannelStandardStepProfile(
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
          1000,

        fluidDensity:
          input.fluidDensity,
      })

    assert.ok(
      Math.abs(
        standard.finalFlowDepth -
        rk4.finalFlowDepth,
      ) <
      1e-5,
    )
  },
)

test(
  'standard-step refinement converges toward RK4 profile',
  () => {
    const coarse =
      calculateTrapezoidalChannelStandardStepProfile({
        ...input,

        numberOfSteps:
          5,
      })

    const refined =
      calculateTrapezoidalChannelStandardStepProfile({
        ...input,

        numberOfSteps:
          20,
      })

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
          1500,

        fluidDensity:
          input.fluidDensity,
      })

    assert.ok(
      Math.abs(
        refined.finalFlowDepth -
        rk4.finalFlowDepth,
      ) <
      Math.abs(
        coarse.finalFlowDepth -
        rk4.finalFlowDepth,
      ),
    )

    closeTo(
      refined.finalFlowDepth,
      1.5513282656539316,
      2e-7,
    )
  },
)

test(
  'solves a multi-reach M2 drawdown profile',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile({
        ...input,

        initialFlowDepth:
          1,

        totalReachLength:
          20,

        numberOfSteps:
          4,
      })

    assert.equal(
      result.startProfileClassification,
      'M2',
    )

    assert.equal(
      result.endProfileClassification,
      'M2',
    )

    assert.equal(
      result.profileTrend,
      'Flow depth decreases downstream',
    )

    closeTo(
      result.finalFlowDepth,
      0.9624417809015688,
      2e-7,
    )

    assert.ok(
      result.finalFroudeNumber >
      result.startFroudeNumber,
    )
  },
)

test(
  'density changes mass and power but not hydraulic profile',
  () => {
    const base =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    const denser =
      calculateTrapezoidalChannelStandardStepProfile({
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
  'rejects non-integer number of standard steps',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelStandardStepProfile({
          ...input,

          numberOfSteps:
            10.5,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelStandardStepProfileError &&
        error.code ===
          'INVALID_NUMBER_OF_STEPS',
    )
  },
)

test(
  'rejects zero total reach length',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelStandardStepProfile({
          ...input,

          totalReachLength:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelStandardStepProfileError &&
        error.code ===
          'INVALID_REACH_LENGTH',
    )
  },
)

test(
  'exports full standard-step profile table as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStepProfile(
        input,
      )

    const csv =
      createTrapezoidalChannelStandardStepProfileCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Final flow depth/,
    )

    assert.match(
      csv,
      /Total friction head loss/,
    )

    assert.match(
      csv,
      /Cumulative Friction Head/,
    )

    assert.match(
      csv,
      /Hydraulic power dissipated/,
    )
  },
)
