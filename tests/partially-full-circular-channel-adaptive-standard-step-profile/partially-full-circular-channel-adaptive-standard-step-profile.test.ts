import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelAdaptiveStandardStepProfileError,
  calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile,
  createPartiallyFullCircularChannelAdaptiveStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelStandardStepProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveStandardStepProfile'


const exampleInput = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    0.6,

  manningRoughness:
    0.013,

  channelSlope:
    0.001,

  initialFlowDepth:
    0.6,

  signedProfileLength:
    100,

  initialReachLength:
    40,

  minimumReachLength:
    1,

  maximumReachLength:
    50,

  absoluteTolerance:
    1e-6,

  relativeTolerance:
    1e-6,
}


function closeTo(
  actual: number,
  expected: number,
  tolerance: number,
) {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <=
      tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 467 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelAdaptiveStandardStepProfile',
    )
  },
)


test(
  'solves an adaptive downstream standard-step profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    assert.ok(
      result.acceptedReaches >
        0,
    )

    assert.equal(
      result.profilePoints.length,
      result.acceptedReaches +
        1,
    )

    assert.equal(
      result.attemptedTrials,
      result.acceptedReaches +
        result.rejectedTrials,
    )

    closeTo(
      result.finalState.distance,
      100,
      1e-10,
    )

    assert.ok(
      result.finalState.flowDepth >
        exampleInput.initialFlowDepth,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.equal(
      result.profileDirection,
      'Downstream adaptive profile',
    )

    assert.ok(
      result.maximumAcceptedErrorRatio <=
        1 +
        1e-12,
    )
  },
)


test(
  'automatically varies accepted reach length',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    assert.ok(
      result.maximumAcceptedReachLength >
        result.minimumAcceptedReachLength,
    )

    assert.ok(
      result.maximumAcceptedReachLength <=
        exampleInput.maximumReachLength +
        1e-12,
    )

    assert.ok(
      result.minimumAcceptedReachLength >
        0,
    )
  },
)


test(
  'agrees with a refined Calculator 466 standard-step profile',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    const refined =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        initialFlowDepth:
          exampleInput.initialFlowDepth,

        signedProfileLength:
          exampleInput.signedProfileLength,

        maximumReachLength:
          2,
      })

    closeTo(
      adaptive.finalState.flowDepth,
      refined.finalState.flowDepth,
      3e-5,
    )
  },
)


test(
  'agrees with fine Calculator 463 RK4 profile',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    const rk4 =
      calculatePartiallyFullCircularChannelGvfProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        initialFlowDepth:
          exampleInput.initialFlowDepth,

        integrationDistance:
          exampleInput.signedProfileLength,

        maximumStepLength:
          0.25,
      })

    closeTo(
      adaptive.finalState.flowDepth,
      rk4.finalState.flowDepth,
      3e-5,
    )
  },
)


test(
  'tighter tolerance uses at least as many accepted reaches as loose tolerance',
  () => {
    const loose =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
        ...exampleInput,

        absoluteTolerance:
          1e-4,

        relativeTolerance:
          1e-4,
      })

    const tight =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
        ...exampleInput,

        absoluteTolerance:
          1e-7,

        relativeTolerance:
          1e-7,
      })

    assert.ok(
      tight.acceptedReaches >=
        loose.acceptedReaches,
    )

    closeTo(
      tight.finalState.flowDepth,
      loose.finalState.flowDepth,
      2e-4,
    )
  },
)


test(
  'preserves subcritical flow throughout the accepted profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    for (
      const point of
        result.profilePoints
    ) {
      assert.ok(
        point.flowDepth >
          result.criticalDepth,
      )

      assert.ok(
        point.flowDepth <
          exampleInput.pipeDiameter,
      )

      assert.ok(
        point.froudeNumber <
          1,
      )

      assert.ok(
        point.errorRatio <=
          1 +
          1e-12,
      )
    }
  },
)


test(
  'supports an adaptive upstream standard-step profile',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
        ...exampleInput,

        signedProfileLength:
          -50,
      })

    const reference =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        initialFlowDepth:
          exampleInput.initialFlowDepth,

        signedProfileLength:
          -50,

        maximumReachLength:
          2,
      })

    assert.equal(
      adaptive.profileDirection,
      'Upstream adaptive profile',
    )

    closeTo(
      adaptive.finalState.distance,
      -50,
      1e-10,
    )

    closeTo(
      adaptive.finalState.flowDepth,
      reference.finalState.flowDepth,
      3e-5,
    )

    assert.ok(
      adaptive.signedFrictionHeadChange <
        0,
    )
  },
)


test(
  'closes longitudinal energy balance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    assert.ok(
      result.frictionHeadLossMagnitude >
        0,
    )

    assert.ok(
      result.totalHeadChange <
        0,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <
        Math.max(
          1e-6,
          result.frictionHeadLossMagnitude *
          1e-5,
        ),
    )
  },
)


test(
  'rejects invalid adaptive reach range',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
          ...exampleInput,

          minimumReachLength:
            20,

          initialReachLength:
            10,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveStandardStepProfileError &&
        error.code ===
          'INVALID_REACH_RANGE',
    )
  },
)


test(
  'rejects unattainable tolerance at fixed large minimum reach',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
          ...exampleInput,

          initialReachLength:
            40,

          minimumReachLength:
            40,

          maximumReachLength:
            40,

          absoluteTolerance:
            1e-12,

          relativeTolerance:
            1e-12,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveStandardStepProfileError &&
        error.code ===
          'TOLERANCE_NOT_ACHIEVABLE',
    )
  },
)


test(
  'exports adaptive standard-step diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelAdaptiveStandardStepProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Adaptive Standard-Step GVF Profile/,
    )

    assert.match(
      csv,
      /Accepted Reaches/,
    )

    assert.match(
      csv,
      /Rejected Trials/,
    )

    assert.match(
      csv,
      /Local Error Estimate/,
    )

    assert.match(
      csv,
      /Trial Root Iterations/,
    )
  },
)
