import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelStandardStepProfileError,
  calculatePartiallyFullCircularChannelStandardStepProfile,
  createPartiallyFullCircularChannelStandardStepProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelStandardStep,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-standard-step/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelStandardStepProfile'


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
  'exposes Calculator 466 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelStandardStepProfile',
    )
  },
)


test(
  'solves a five-reach downstream standard-step profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStepProfile(
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
      result.actualReachLength,
      20,
      1e-12,
    )

    closeTo(
      result.finalState.distance,
      100,
      1e-10,
    )

    closeTo(
      result.finalState.flowDepth,
      0.6099325866041851,
      3e-8,
    )

    closeTo(
      result.totalDepthChange,
      0.0099325866041851,
      3e-8,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.equal(
      result.profileDirection,
      'Downstream profile',
    )
  },
)


test(
  'produces monotonic downstream profile points',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStepProfile(
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
        current.distance >
          previous.distance,
      )

      assert.ok(
        current.flowDepth >
          previous.flowDepth,
      )

      assert.ok(
        current.flowDepth >
          result.criticalDepth,
      )

      assert.ok(
        current.froudeNumber <
          1,
      )
    }
  },
)


test(
  'each reach is exactly Calculator 465 chained from previous depth',
  () => {
    const profile =
      calculatePartiallyFullCircularChannelStandardStepProfile(
        exampleInput,
      )

    let depth =
      exampleInput.initialFlowDepth

    for (
      let index = 1;
      index <
        profile.profilePoints.length;
      index +=
        1
    ) {
      const single =
        calculatePartiallyFullCircularChannelStandardStep({
          pipeDiameter:
            exampleInput.pipeDiameter,

          volumetricFlowRate:
            exampleInput.volumetricFlowRate,

          manningRoughness:
            exampleInput.manningRoughness,

          channelSlope:
            exampleInput.channelSlope,

          initialFlowDepth:
            depth,

          signedReachLength:
            profile.actualReachLength,
        })

      closeTo(
        profile.profilePoints[
          index
        ].flowDepth,
        single.solvedState.flowDepth,
        1e-11,
      )

      depth =
        single.solvedState.flowDepth
    }
  },
)


test(
  'approaches Calculator 463 fine RK4 solution',
  () => {
    const standard =
      calculatePartiallyFullCircularChannelStandardStepProfile(
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

    assert.ok(
      Math.abs(
        standard.finalState.flowDepth -
        rk4.finalState.flowDepth,
      ) <
        5e-5,
    )
  },
)


test(
  'refining reach length improves or preserves RK4 agreement',
  () => {
    const coarse =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        ...exampleInput,

        maximumReachLength:
          100,
      })

    const refined =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        ...exampleInput,

        maximumReachLength:
          10,
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
          exampleInput.initialFlowDepth,

        integrationDistance:
          exampleInput.signedProfileLength,

        maximumStepLength:
          0.25,
      })

    const coarseError =
      Math.abs(
        coarse.finalState.flowDepth -
        rk4.finalState.flowDepth,
      )

    const refinedError =
      Math.abs(
        refined.finalState.flowDepth -
        rk4.finalState.flowDepth,
      )

    assert.ok(
      refinedError <=
        coarseError,
    )
  },
)


test(
  'closes cumulative longitudinal energy balance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStepProfile(
        exampleInput,
      )

    closeTo(
      result.frictionHeadLossMagnitude,
      0.09241258467115673,
      3e-7,
    )

    closeTo(
      result.totalHeadChange,
      -0.09241258467116101,
      3e-7,
    )

    assert.ok(
      Math.abs(
        result.cumulativeEnergyResidual,
      ) <
        1e-7,
    )

    assert.ok(
      result.maximumSegmentEnergyResidual <
        1e-8,
    )
  },
)


test(
  'supports an upstream multi-reach profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        ...exampleInput,

        signedProfileLength:
          -50,

        maximumReachLength:
          10,
      })

    assert.equal(
      result.numberOfReaches,
      5,
    )

    assert.equal(
      result.profileDirection,
      'Upstream profile',
    )

    closeTo(
      result.finalState.distance,
      -50,
      1e-10,
    )

    closeTo(
      result.finalState.flowDepth,
      0.5970654802355937,
      3e-8,
    )

    assert.ok(
      result.totalDepthChange <
        0,
    )

    assert.ok(
      result.signedFrictionHeadChange <
        0,
    )
  },
)


test(
  'one reach reproduces Calculator 465',
  () => {
    const profile =
      calculatePartiallyFullCircularChannelStandardStepProfile({
        ...exampleInput,

        maximumReachLength:
          100,
      })

    const single =
      calculatePartiallyFullCircularChannelStandardStep({
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

        signedReachLength:
          exampleInput.signedProfileLength,
      })

    assert.equal(
      profile.numberOfReaches,
      1,
    )

    closeTo(
      profile.finalState.flowDepth,
      single.solvedState.flowDepth,
      1e-11,
    )
  },
)


test(
  'rejects zero profile length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelStandardStepProfile({
          ...exampleInput,

          signedProfileLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelStandardStepProfileError &&
        error.code ===
          'INVALID_PROFILE_LENGTH',
    )
  },
)


test(
  'rejects invalid reach length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelStandardStepProfile({
          ...exampleInput,

          maximumReachLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelStandardStepProfileError &&
        error.code ===
          'INVALID_REACH_LENGTH',
    )
  },
)


test(
  'rejects an excessive reach count',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelStandardStepProfile({
          ...exampleInput,

          maximumReachLength:
            0.001,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelStandardStepProfileError &&
        error.code ===
          'TOO_MANY_REACHES',
    )
  },
)


test(
  'exports the complete multi-reach profile as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStepProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelStandardStepProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Multi-Reach Standard-Step GVF Profile/,
    )

    assert.match(
      csv,
      /Number of Reaches/,
    )

    assert.match(
      csv,
      /Segment Energy Residual/,
    )

    assert.match(
      csv,
      /Root Iterations/,
    )
  },
)
