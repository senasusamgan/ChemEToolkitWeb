import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelStandardStepError,
  calculateTrapezoidalChannelStandardStep,
  createTrapezoidalChannelStandardStepCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-standard-step/engine.ts'

import {
  calculateTrapezoidalChannelDirectStep,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-direct-step/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelStandardStep'

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

  startDepth:
    1.5,

  downstreamReachLength:
    100,

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
  'solves M1 downstream depth with the standard-step equation',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelStandardStep',
    )

    const result =
      calculateTrapezoidalChannelStandardStep(
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
      result.profileTrend,
      'Flow depth increases downstream',
    )

    closeTo(
      result.endDepth,
      1.551310742331566,
      1e-8,
    )
  },
)

test(
  'reports normal and critical reference depths',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    closeTo(
      result.normalDepth,
      1.2673820928126296,
      1e-8,
    )

    closeTo(
      result.criticalDepth,
      0.6114073321581264,
      1e-8,
    )

    assert.ok(
      result.startDepth >
      result.normalDepth,
    )

    assert.ok(
      result.endDepth >
      result.normalDepth,
    )
  },
)

test(
  'calculates endpoint hydraulic states',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    closeTo(
      result.startFlowArea,
      6.75,
      1e-12,
    )

    closeTo(
      result.endFlowArea,
      7.060497246268012,
      1e-8,
    )

    closeTo(
      result.startVelocity,
      0.7407407407407407,
      1e-12,
    )

    closeTo(
      result.endVelocity,
      0.7081654203098606,
      1e-8,
    )

    closeTo(
      result.startFroudeNumber,
      0.2230127188897716,
      1e-9,
    )

    closeTo(
      result.endFroudeNumber,
      0.2102398080703019,
      1e-9,
    )
  },
)

test(
  'closes the standard-step energy equation',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    closeTo(
      result.startSpecificEnergy,
      1.5279757534424672,
      1e-10,
    )

    closeTo(
      result.endSpecificEnergy,
      1.5768800377852958,
      1e-8,
    )

    closeTo(
      result.startFrictionSlope,
      0.0005424576798224931,
      1e-12,
    )

    closeTo(
      result.endFrictionSlope,
      0.000479456633320894,
      1e-12,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0005109571565716936,
      1e-12,
    )

    assert.ok(
      Math.abs(
        result.standardStepEnergyResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'Calculator 431 direct-step inverse closure recovers 100 metre reach',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    const direct =
      calculateTrapezoidalChannelDirectStep({
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
          input.startDepth,

        endDepth:
          result.endDepth,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      direct.signedDistance,
      input.downstreamReachLength,
      1e-5,
    )

    closeTo(
      direct.reachLength,
      input.downstreamReachLength,
      1e-5,
    )

    closeTo(
      result.equivalentDirectStepDistance,
      input.downstreamReachLength,
      1e-5,
    )
  },
)

test(
  'reports bed water-surface and friction-head changes',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    closeTo(
      result.depthChange,
      0.051310742331566,
      1e-8,
    )

    closeTo(
      result.bedElevationChange,
      -0.1,
      1e-12,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.048689257668434,
      1e-8,
    )

    closeTo(
      result.frictionHeadLoss,
      0.05109571565716936,
      1e-8,
    )
  },
)

test(
  'shorter M1 reach produces a smaller downstream depth change',
  () => {
    const full =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    const shorter =
      calculateTrapezoidalChannelStandardStep({
        ...input,

        downstreamReachLength:
          50,
      })

    closeTo(
      shorter.endDepth,
      1.5248727511439677,
      1e-8,
    )

    assert.ok(
      shorter.endDepth <
      full.endDepth,
    )

    assert.ok(
      shorter.endDepth >
      input.startDepth,
    )
  },
)

test(
  'solves a mild-slope M2 profile with decreasing downstream depth',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep({
        ...input,

        startDepth:
          1,

        downstreamReachLength:
          20,
      })

    assert.equal(
      result.profileClassification,
      'M2',
    )

    assert.equal(
      result.profileTrend,
      'Flow depth decreases downstream',
    )

    closeTo(
      result.endDepth,
      0.962110504406998,
      1e-8,
    )

    closeTo(
      result.startFroudeNumber,
      0.44627718163407326,
      1e-9,
    )

    closeTo(
      result.endFroudeNumber,
      0.47604841600423264,
      1e-9,
    )
  },
)

test(
  'rejects an overly long standard step with multiple same-zone roots',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelStandardStep({
          ...input,

          startDepth:
            1,

          downstreamReachLength:
            50,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelStandardStepError &&
        error.code ===
          'AMBIGUOUS_STANDARD_STEP',
    )
  },
)

test(
  'density changes mass and power but not hydraulic profile',
  () => {
    const base =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    const denser =
      calculateTrapezoidalChannelStandardStep({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.endDepth,
      base.endDepth,
      1e-10,
    )

    closeTo(
      denser.normalDepth,
      base.normalDepth,
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
  'reports hydraulic power dissipation',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    closeTo(
      result.massFlowRate,
      4990,
      1e-10,
    )

    closeTo(
      result.hydraulicPowerDissipated,
      2500.3782217474054,
      1e-5,
    )
  },
)

test(
  'rejects non-positive downstream reach length',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelStandardStep({
          ...input,

          downstreamReachLength:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelStandardStepError &&
        error.code ===
          'INVALID_REACH_LENGTH',
    )
  },
)

test(
  'exports standard-step GVF calculation as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelStandardStep(
        input,
      )

    const csv =
      createTrapezoidalChannelStandardStepCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Ending depth/,
    )

    assert.match(
      csv,
      /Equivalent direct-step distance/,
    )

    assert.match(
      csv,
      /Standard-step energy residual/,
    )

    assert.match(
      csv,
      /Hydraulic power dissipated/,
    )
  },
)
