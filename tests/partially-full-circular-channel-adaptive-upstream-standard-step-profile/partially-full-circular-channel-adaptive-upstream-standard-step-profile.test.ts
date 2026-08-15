import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError,
  calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile,
  createPartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelUpstreamStandardStepProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-upstream-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelAdaptiveGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile'


const exampleInput = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    0.6,

  manningRoughness:
    0.013,

  channelSlope:
    0.001,

  downstreamBoundaryDepth:
    0.6,

  upstreamProfileLength:
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
  'exposes Calculator 469 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile',
    )
  },
)


test(
  'solves adaptive upstream backwater profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
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
      result.upstreamEndpoint.upstreamDistance,
      100,
      1e-10,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.ok(
      result.upstreamEndpoint.flowDepth <
        result.downstreamBoundary.flowDepth,
    )

    assert.ok(
      result.maximumAcceptedErrorRatio <=
        1 +
        1e-12,
    )
  },
)


test(
  'is exactly Calculator 467 reoriented from downstream boundary',
  () => {
    const upstream =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    const base =
      calculatePartiallyFullCircularChannelAdaptiveStandardStepProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        initialFlowDepth:
          exampleInput.downstreamBoundaryDepth,

        signedProfileLength:
          -exampleInput.upstreamProfileLength,

        initialReachLength:
          exampleInput.initialReachLength,

        minimumReachLength:
          exampleInput.minimumReachLength,

        maximumReachLength:
          exampleInput.maximumReachLength,

        absoluteTolerance:
          exampleInput.absoluteTolerance,

        relativeTolerance:
          exampleInput.relativeTolerance,
      })

    closeTo(
      upstream.upstreamEndpoint.flowDepth,
      base.finalState.flowDepth,
      1e-12,
    )

    closeTo(
      upstream.upstreamEndpoint.upstreamDistance,
      -base.finalState.distance,
      1e-12,
    )

    assert.equal(
      upstream.acceptedReaches,
      base.acceptedReaches,
    )

    assert.equal(
      upstream.rejectedTrials,
      base.rejectedTrials,
    )
  },
)


test(
  'reports monotonically increasing positive upstream distance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    for (
      let index = 1;
      index <
        result.profilePoints.length;
      index +=
        1
    ) {
      const previous =
        result.profilePoints[
          index - 1
        ]

      const current =
        result.profilePoints[
          index
        ]

      assert.ok(
        current.upstreamDistance >
          previous.upstreamDistance,
      )

      assert.ok(
        current.signedDistanceFromBoundary <
          previous.signedDistanceFromBoundary,
      )

      assert.ok(
        current.bedElevationRelativeToBoundary >
          previous.bedElevationRelativeToBoundary,
      )

      assert.ok(
        current.errorRatio <=
          1 +
          1e-12,
      )
    }
  },
)


test(
  'agrees with refined fixed-reach Calculator 468 profile',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    const fixed =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        downstreamBoundaryDepth:
          exampleInput.downstreamBoundaryDepth,

        upstreamProfileLength:
          exampleInput.upstreamProfileLength,

        maximumReachLength:
          2,
      })

    closeTo(
      adaptive.upstreamEndpoint.flowDepth,
      fixed.upstreamEndpoint.flowDepth,
      3e-5,
    )
  },
)


test(
  'agrees with adaptive RK4 upstream integration',
  () => {
    const standard =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    const rk4 =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        initialFlowDepth:
          exampleInput.downstreamBoundaryDepth,

        integrationDistance:
          -exampleInput.upstreamProfileLength,

        initialStepLength:
          10,

        minimumStepLength:
          0.05,

        maximumStepLength:
          20,

        absoluteTolerance:
          1e-8,

        relativeTolerance:
          1e-7,
      })

    closeTo(
      standard.upstreamEndpoint.flowDepth,
      rk4.finalState.flowDepth,
      5e-5,
    )
  },
)


test(
  'tighter tolerance does not use fewer accepted reaches',
  () => {
    const loose =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile({
        ...exampleInput,

        absoluteTolerance:
          1e-4,

        relativeTolerance:
          1e-4,
      })

    const tight =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile({
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
      tight.upstreamEndpoint.flowDepth,
      loose.upstreamEndpoint.flowDepth,
      2e-4,
    )
  },
)


test(
  'preserves subcritical regime throughout adaptive backwater profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
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
    }
  },
)


test(
  'reports upstream head rise equal to friction loss within tolerance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    closeTo(
      result.bedRiseToUpstreamEndpoint,
      exampleInput.channelSlope *
      exampleInput.upstreamProfileLength,
      1e-12,
    )

    assert.ok(
      result.totalHeadRiseMovingUpstream >
        0,
    )

    assert.ok(
      result.frictionHeadLossMagnitude >
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
        calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile({
          ...exampleInput,

          minimumReachLength:
            20,

          initialReachLength:
            10,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_REACH_RANGE',
    )
  },
)


test(
  'rejects invalid downstream boundary depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile({
          ...exampleInput,

          downstreamBoundaryDepth:
            exampleInput.pipeDiameter,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_DOWNSTREAM_BOUNDARY_DEPTH',
    )
  },
)


test(
  'rejects zero upstream length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile({
          ...exampleInput,

          upstreamProfileLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_UPSTREAM_LENGTH',
    )
  },
)


test(
  'exports adaptive upstream profile diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Adaptive Upstream Standard-Step GVF Profile/,
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
      /Upstream Distance/,
    )

    assert.match(
      csv,
      /Local Error Estimate/,
    )
  },
)
