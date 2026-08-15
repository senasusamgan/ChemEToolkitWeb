import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelUpstreamStandardStepProfileError,
  calculatePartiallyFullCircularChannelUpstreamStandardStepProfile,
  createPartiallyFullCircularChannelUpstreamStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-upstream-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelStandardStepProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelUpstreamStandardStepProfile'


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

  maximumReachLength:
    20,
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
    ) <= tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 468 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelUpstreamStandardStepProfile',
    )
  },
)


test(
  'solves upstream profile from downstream boundary',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
        exampleInput,
      )

    assert.equal(
      result.numberOfReaches,
      5,
    )

    assert.equal(
      result.profilePoints.length,
      6,
    )

    closeTo(
      result.upstreamEndpoint.upstreamDistance,
      100,
      1e-10,
    )

    closeTo(
      result.downstreamBoundary.flowDepth,
      exampleInput.downstreamBoundaryDepth,
      1e-14,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.ok(
      result.upstreamEndpoint.flowDepth <
        result.downstreamBoundary.flowDepth,
    )
  },
)


test(
  'is exactly the upstream orientation of Calculator 466',
  () => {
    const upstream =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
        exampleInput,
      )

    const base =
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
          exampleInput.downstreamBoundaryDepth,

        signedProfileLength:
          -exampleInput.upstreamProfileLength,

        maximumReachLength:
          exampleInput.maximumReachLength,
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
      upstream.numberOfReaches,
      base.numberOfReaches,
    )
  },
)


test(
  'reports positive distance monotonically upstream',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
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
    }
  },
)


test(
  'agrees with fine upstream RK4 integration',
  () => {
    const standard =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile({
        ...exampleInput,

        maximumReachLength:
          5,
      })

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
          exampleInput.downstreamBoundaryDepth,

        integrationDistance:
          -exampleInput.upstreamProfileLength,

        maximumStepLength:
          0.25,
      })

    closeTo(
      standard.upstreamEndpoint.flowDepth,
      rk4.finalState.flowDepth,
      5e-5,
    )
  },
)


test(
  'preserves subcritical flow over reference backwater profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
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
  'reports upstream bed rise and head rise consistently',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
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
          1e-7,
          result.frictionHeadLossMagnitude *
          1e-6,
        ),
    )
  },
)


test(
  'one reach remains equivalent to upstream Calculator 465 chain',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile({
        ...exampleInput,

        maximumReachLength:
          exampleInput.upstreamProfileLength,
      })

    assert.equal(
      result.numberOfReaches,
      1,
    )

    assert.equal(
      result.profilePoints.length,
      2,
    )

    closeTo(
      result.upstreamEndpoint.upstreamDistance,
      exampleInput.upstreamProfileLength,
      1e-10,
    )
  },
)


test(
  'rejects invalid downstream boundary depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelUpstreamStandardStepProfile({
          ...exampleInput,

          downstreamBoundaryDepth:
            exampleInput.pipeDiameter,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_DOWNSTREAM_BOUNDARY_DEPTH',
    )
  },
)


test(
  'rejects zero upstream profile length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelUpstreamStandardStepProfile({
          ...exampleInput,

          upstreamProfileLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelUpstreamStandardStepProfileError &&
        error.code ===
          'INVALID_UPSTREAM_LENGTH',
    )
  },
)


test(
  'exports upstream backwater profile as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelUpstreamStandardStepProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Upstream Standard-Step GVF Profile/,
    )

    assert.match(
      csv,
      /Downstream Boundary Depth/,
    )

    assert.match(
      csv,
      /Upstream Distance/,
    )

    assert.match(
      csv,
      /Total Head Rise Moving Upstream/,
    )
  },
)
