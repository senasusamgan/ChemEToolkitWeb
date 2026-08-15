import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelGvfProfileError,
  calculatePartiallyFullCircularChannelGvfProfile,
  createPartiallyFullCircularChannelGvfProfileCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfSlope,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelGvfProfile'


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

  maximumStepLength:
    2,
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
  'exposes Calculator 463 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelGvfProfile',
    )
  },
)


test(
  'integrates the reference subcritical profile with RK4',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfProfile(
        exampleInput,
      )

    assert.equal(
      result.numberOfSteps,
      50,
    )

    assert.equal(
      result.profilePoints.length,
      51,
    )

    closeTo(
      result.actualStepLength,
      2,
      1e-14,
    )

    closeTo(
      result.finalState.distance,
      100,
      1e-12,
    )

    closeTo(
      result.finalState.flowDepth,
      0.6099148716875815,
      2e-10,
    )

    closeTo(
      result.totalDepthChange,
      0.009914871687581539,
      2e-10,
    )

    closeTo(
      result.finalState.froudeNumber,
      0.478359921907676,
      2e-10,
    )

    closeTo(
      result.finalState.frictionSlope,
      0.0008962622268191577,
      2e-13,
    )

    closeTo(
      result.finalDepthGradient,
      0.0001345196688772933,
      2e-12,
    )

    assert.equal(
      result.integrationDirection,
      'Downstream integration',
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )
  },
)


test(
  'starts from the exact Calculator 462 local slope',
  () => {
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

    const profile =
      calculatePartiallyFullCircularChannelGvfProfile(
        exampleInput,
      )

    closeTo(
      profile.initialDepthGradient,
      local.depthGradient,
      1e-14,
    )

    closeTo(
      profile.initialState.froudeNumber,
      local.froudeNumber,
      1e-14,
    )

    closeTo(
      profile.criticalDepth,
      local.criticalDepth,
      1e-10,
    )
  },
)


test(
  'preserves the subcritical regime along the reference profile',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfProfile(
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

    closeTo(
      result.minimumDepth,
      0.6,
      1e-12,
    )

    closeTo(
      result.maximumDepth,
      0.6099148716875815,
      2e-10,
    )
  },
)


test(
  'closes the longitudinal energy balance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfProfile(
        exampleInput,
      )

    closeTo(
      result.frictionHeadLossMagnitude,
      0.09242614838749351,
      2e-8,
    )

    closeTo(
      result.totalHeadChange,
      -0.0924262461398393,
      2e-8,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <
        2e-7,
    )
  },
)


test(
  'converges as RK4 step length is reduced',
  () => {
    const coarse =
      calculatePartiallyFullCircularChannelGvfProfile({
        ...exampleInput,

        maximumStepLength:
          10,
      })

    const reference =
      calculatePartiallyFullCircularChannelGvfProfile({
        ...exampleInput,

        maximumStepLength:
          1,
      })

    assert.ok(
      Math.abs(
        coarse.finalState.flowDepth -
        reference.finalState.flowDepth,
      ) <
        5e-8,
    )
  },
)


test(
  'supports upstream integration with negative distance',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfProfile({
        ...exampleInput,

        integrationDistance:
          -50,

        maximumStepLength:
          2,
      })

    assert.equal(
      result.integrationDirection,
      'Upstream integration',
    )

    closeTo(
      result.finalState.distance,
      -50,
      1e-12,
    )

    closeTo(
      result.finalState.flowDepth,
      0.5970664489235831,
      2e-10,
    )

    assert.ok(
      result.signedFrictionHeadChange <
        0,
    )

    assert.ok(
      result.totalHeadChange >
        0,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <
        1e-7,
    )
  },
)


test(
  'stops a profile that reaches the critical-flow singularity',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfProfile({
          ...exampleInput,

          initialFlowDepth:
            0.5,

          integrationDistance:
            30,

          maximumStepLength:
            0.1,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfProfileError &&
        (
          error.code ===
            'PROFILE_APPROACHES_CRITICAL_FLOW' ||
          error.code ===
            'PROFILE_CROSSES_CRITICAL_DEPTH'
        ),
    )
  },
)


test(
  'rejects an excessive number of RK4 steps',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfProfile({
          ...exampleInput,

          maximumStepLength:
            0.001,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfProfileError &&
        error.code ===
          'TOO_MANY_STEPS',
    )
  },
)


test(
  'rejects zero integration distance',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfProfile({
          ...exampleInput,

          integrationDistance:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfProfileError &&
        error.code ===
          'INVALID_INTEGRATION_DISTANCE',
    )
  },
)


test(
  'rejects invalid RK4 step length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfProfile({
          ...exampleInput,

          maximumStepLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfProfileError &&
        error.code ===
          'INVALID_STEP_LENGTH',
    )
  },
)


test(
  'exports the full RK4 profile as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfProfile(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelGvfProfileCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Partially Full Circular Channel GVF Profile/,
    )

    assert.match(
      csv,
      /Number of RK4 Steps/,
    )

    assert.match(
      csv,
      /Profile Point,Distance,Flow Depth/,
    )

    assert.match(
      csv,
      /Energy Closure Residual/,
    )
  },
)
