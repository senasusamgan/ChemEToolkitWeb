import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelAdaptiveGvfProfileError,
  calculatePartiallyFullCircularChannelAdaptiveGvfProfile,
  createPartiallyFullCircularChannelAdaptiveGvfProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelAdaptiveGvfProfile'


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

  integrationDistance:
    100,

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
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 464 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelAdaptiveGvfProfile',
    )
  },
)


test(
  'integrates an adaptive circular-channel GVF profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
        exampleInput,
      )

    assert.ok(
      result.acceptedSteps >
        0,
    )

    assert.ok(
      result.rejectedSteps >=
        0,
    )

    assert.equal(
      result.profilePoints.length,
      result.acceptedSteps +
        1,
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
      result.integrationDirection,
      'Downstream integration',
    )

    assert.ok(
      result.maximumAcceptedErrorRatio <=
        1 +
        1e-12,
    )
  },
)


test(
  'agrees with Calculator 463 fine fixed-step RK4 profile',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
        exampleInput,
      )

    const fixed =
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
          exampleInput.integrationDistance,

        maximumStepLength:
          0.25,
      })

    closeTo(
      adaptive.finalState.flowDepth,
      fixed.finalState.flowDepth,
      2e-6,
    )
  },
)


test(
  'starts from Calculator 462 local differential slope',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
        exampleInput,
      )

    const local =
      calculatePartiallyFullCircularChannelGvfSlope({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        flowDepth:
          exampleInput.initialFlowDepth,
      })

    closeTo(
      adaptive.initialDepthGradient,
      local.depthGradient,
      1e-14,
    )

    closeTo(
      adaptive.criticalDepth,
      local.criticalDepth,
      1e-10,
    )
  },
)


test(
  'tight tolerance remains consistent with loose tolerance',
  () => {
    const loose =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
        ...exampleInput,

        absoluteTolerance:
          1e-5,

        relativeTolerance:
          1e-5,
      })

    const tight =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
        ...exampleInput,

        absoluteTolerance:
          1e-9,

        relativeTolerance:
          1e-9,
      })

    assert.ok(
      tight.acceptedSteps >=
        loose.acceptedSteps,
    )

    closeTo(
      tight.finalState.flowDepth,
      loose.finalState.flowDepth,
      5e-5,
    )
  },
)


test(
  'accepted steps remain within adaptive maximum and reach endpoint exactly',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
        exampleInput,
      )

    assert.ok(
      result.maximumAcceptedStepLength <=
        exampleInput.maximumStepLength +
        1e-12,
    )

    assert.ok(
      result.minimumAcceptedStepLength >
        0,
    )

    for (
      let index = 1;
      index <
        result.profilePoints.length;
      index +=
        1
    ) {
      assert.ok(
        result.profilePoints[index].distance >
          result.profilePoints[index - 1].distance,
      )

      assert.ok(
        result.profilePoints[index].errorRatio <=
          1 +
          1e-12,
      )
    }

    closeTo(
      result.finalState.distance,
      exampleInput.integrationDistance,
      1e-10,
    )
  },
)


test(
  'preserves subcritical regime throughout reference profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
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
  'supports adaptive upstream integration',
  () => {
    const adaptive =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
        ...exampleInput,

        integrationDistance:
          -50,
      })

    const fixed =
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
          -50,

        maximumStepLength:
          0.25,
      })

    assert.equal(
      adaptive.integrationDirection,
      'Upstream integration',
    )

    closeTo(
      adaptive.finalState.distance,
      -50,
      1e-10,
    )

    closeTo(
      adaptive.finalState.flowDepth,
      fixed.finalState.flowDepth,
      2e-6,
    )

    assert.ok(
      adaptive.signedFrictionHeadChange <
        0,
    )
  },
)


test(
  'maintains longitudinal energy consistency',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
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
          2e-5,
          result.frictionHeadLossMagnitude *
          0.005,
        ),
    )
  },
)


test(
  'rejects invalid adaptive step range',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
          ...exampleInput,

          minimumStepLength:
            5,

          initialStepLength:
            2,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveGvfProfileError &&
        error.code ===
          'INVALID_STEP_RANGE',
    )
  },
)


test(
  'rejects invalid tolerance',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
          ...exampleInput,

          absoluteTolerance:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveGvfProfileError &&
        error.code ===
          'INVALID_ABSOLUTE_TOLERANCE',
    )
  },
)


test(
  'protects against the critical-flow singularity',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelAdaptiveGvfProfile({
          ...exampleInput,

          initialFlowDepth:
            0.5,

          integrationDistance:
            30,

          initialStepLength:
            2,

          minimumStepLength:
            0.001,

          maximumStepLength:
            5,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelAdaptiveGvfProfileError &&
        (
          error.code ===
            'PROFILE_APPROACHES_CRITICAL_FLOW' ||
          error.code ===
            'PROFILE_CROSSES_CRITICAL_DEPTH' ||
          error.code ===
            'TOLERANCE_NOT_ACHIEVABLE'
        ),
    )
  },
)


test(
  'exports adaptive profile diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelAdaptiveGvfProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelAdaptiveGvfProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Adaptive GVF Profile/,
    )

    assert.match(
      csv,
      /Accepted Steps/,
    )

    assert.match(
      csv,
      /Rejected Steps/,
    )

    assert.match(
      csv,
      /Local Error Estimate/,
    )

    assert.match(
      csv,
      /Error Ratio/,
    )
  },
)
