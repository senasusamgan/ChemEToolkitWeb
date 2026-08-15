import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelStandardStepError,
  calculatePartiallyFullCircularChannelStandardStep,
  createPartiallyFullCircularChannelStandardStepCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-standard-step/engine.ts'

import {
  calculatePartiallyFullCircularChannelDirectStep,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-direct-step/engine.ts'

import {
  calculatePartiallyFullCircularChannelGvfProfile,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-profile/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelStandardStep'


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

  signedReachLength:
    100,
}


function closeTo(
  actual: number,
  expected: number,
  tolerance: number,
) {
  assert.ok(
    Math.abs(
      actual -
      expected
    ) <= tolerance,
    `Expected ${actual} within ${tolerance} of ${expected}`,
  )
}


test(
  'exposes Calculator 465 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelStandardStep',
    )
  },
)


test(
  'solves reference downstream standard-step depth',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    closeTo(
      result.solvedState.flowDepth,
      0.6103822008001334,
      3e-9,
    )

    closeTo(
      result.localLinearDepthPrediction,
      0.6069590695243299,
      2e-10,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0009206569884103902,
      2e-12,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.equal(
      result.reachDirection,
      'Downstream standard step',
    )
  },
)


test(
  'selects the root continuous with the local GVF trend',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    assert.ok(
      result.rootCandidatesFound >= 2,
    )

    assert.ok(
      result.directionalCandidatesFound >= 1,
    )

    assert.ok(
      result.solvedState.flowDepth >
        exampleInput.initialFlowDepth,
    )

    assert.ok(
      Math.abs(
        result.solvedState.flowDepth -
        result.localLinearDepthPrediction
      ) <
      0.01,
    )
  },
)


test(
  'exactly inverts Calculator 461 direct-step distance',
  () => {
    const standard =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    const direct =
      calculatePartiallyFullCircularChannelDirectStep({
        pipeDiameter:
          exampleInput.pipeDiameter,

        volumetricFlowRate:
          exampleInput.volumetricFlowRate,

        manningRoughness:
          exampleInput.manningRoughness,

        channelSlope:
          exampleInput.channelSlope,

        state1FlowDepth:
          exampleInput.initialFlowDepth,

        state2FlowDepth:
          standard.solvedState.flowDepth,
      })

    closeTo(
      direct.signedDistance,
      exampleInput.signedReachLength,
      2e-6,
    )

    closeTo(
      standard.equivalentDirectStepDistance,
      exampleInput.signedReachLength,
      2e-6,
    )
  },
)


test(
  'closes the standard-step energy equation',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    closeTo(
      result.bedElevationChange,
      -0.1,
      1e-12,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.0896177991998666,
      3e-9,
    )

    closeTo(
      result.frictionHeadLossMagnitude,
      0.09206569884103902,
      3e-9,
    )

    assert.ok(
      Math.abs(
        result.energyResidual
      ) <
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.distanceClosureResidual
      ) <
      2e-5,
    )
  },
)


test(
  'supports upstream standard-step solution',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep({
        ...exampleInput,

        signedReachLength:
          -50,
      })

    closeTo(
      result.solvedState.flowDepth,
      0.5970418710543952,
      3e-9,
    )

    assert.equal(
      result.reachDirection,
      'Upstream standard step',
    )

    assert.ok(
      result.solvedDepthChange <
      0,
    )

    closeTo(
      result.equivalentDirectStepDistance,
      -50,
      2e-6,
    )
  },
)


test(
  'remains close to fine fixed-step RK4 over reference reach',
  () => {
    const standard =
      calculatePartiallyFullCircularChannelStandardStep(
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
          exampleInput.signedReachLength,

        maximumStepLength:
          0.5,
      })

    assert.ok(
      Math.abs(
        standard.solvedState.flowDepth -
        rk4.finalState.flowDepth
      ) <
      0.001,
    )
  },
)


test(
  'preserves the initial critical-flow regime',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    assert.ok(
      result.initialState.flowDepth >
        result.criticalDepth,
    )

    assert.ok(
      result.solvedState.flowDepth >
        result.criticalDepth,
    )

    assert.ok(
      result.initialState.froudeNumber <
        1,
    )

    assert.ok(
      result.solvedState.froudeNumber <
        1,
    )
  },
)


test(
  'rejects zero reach length',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelStandardStep({
          ...exampleInput,

          signedReachLength:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelStandardStepError &&
        error.code ===
          'INVALID_REACH_LENGTH',
    )
  },
)


test(
  'rejects invalid initial depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelStandardStep({
          ...exampleInput,

          initialFlowDepth:
            exampleInput.pipeDiameter,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelStandardStepError &&
        error.code ===
          'INVALID_INITIAL_DEPTH',
    )
  },
)


test(
  'exports standard-step diagnostics as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelStandardStep(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelStandardStepCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Standard-Step Method/,
    )

    assert.match(
      csv,
      /Equivalent Direct-Step Distance/,
    )

    assert.match(
      csv,
      /Root Candidates Found/,
    )

    assert.match(
      csv,
      /Energy Residual/,
    )
  },
)
