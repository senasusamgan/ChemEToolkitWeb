import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelDirectStepError,
  calculatePartiallyFullCircularChannelDirectStep,
  createPartiallyFullCircularChannelDirectStepCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-direct-step/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelDirectStep'


const exampleInput = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    0.6,

  manningRoughness:
    0.013,

  channelSlope:
    0.001,

  state1FlowDepth:
    0.6,

  state2FlowDepth:
    0.5,
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
  'exposes Calculator 461 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelDirectStep',
    )
  },
)


test(
  'solves reference circular-channel direct-step reach',
  () => {
    const result =
      calculatePartiallyFullCircularChannelDirectStep(
        exampleInput,
      )

    closeTo(
      result.state1.flowArea,
      0.5654866776461628,
      1e-12,
    )

    closeTo(
      result.state2.flowArea,
      0.4460445712960784,
      1e-12,
    )

    closeTo(
      result.state1.meanVelocity,
      1.0610329539459689,
      1e-12,
    )

    closeTo(
      result.state2.meanVelocity,
      1.3451570506879413,
      1e-12,
    )

    closeTo(
      result.state1.froudeNumber,
      0.4935691069850257,
      1e-12,
    )

    closeTo(
      result.state2.froudeNumber,
      0.6996092363256958,
      1e-12,
    )

    closeTo(
      result.state1.specificEnergy,
      0.6573993631545588,
      1e-12,
    )

    closeTo(
      result.state2.specificEnergy,
      0.592256147156036,
      1e-12,
    )

    closeTo(
      result.state1.frictionSlope,
      0.0009473623262711614,
      1e-14,
    )

    closeTo(
      result.state2.frictionSlope,
      0.0017977278598395822,
      1e-14,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0013725450930553718,
      1e-14,
    )

    closeTo(
      result.specificEnergyChange,
      -0.0651432159985228,
      1e-12,
    )

    closeTo(
      result.bedSlopeMinusAverageFrictionSlope,
      -0.00037254509305537174,
      1e-14,
    )

    closeTo(
      result.signedDistance,
      174.85994907156245,
      1e-8,
    )

    closeTo(
      result.reachLength,
      174.85994907156245,
      1e-8,
    )
  },
)


test(
  'Calculator 457 critical depth remains below both subcritical states',
  () => {
    const result =
      calculatePartiallyFullCircularChannelDirectStep(
        exampleInput,
      )

    closeTo(
      result.criticalDepth,
      0.41526533730881154,
      1e-8,
    )

    assert.ok(
      result.state1.flowDepth >
        result.criticalDepth,
    )

    assert.ok(
      result.state2.flowDepth >
        result.criticalDepth,
    )

    assert.ok(
      result.state1.froudeNumber <
        1,
    )

    assert.ok(
      result.state2.froudeNumber <
        1,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical GVF segment',
    )
  },
)


test(
  'closes the direct-step energy equation',
  () => {
    const result =
      calculatePartiallyFullCircularChannelDirectStep(
        exampleInput,
      )

    closeTo(
      result.bedElevationChange,
      -0.17485994907156246,
      1e-10,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.2748599490715624,
      1e-10,
    )

    closeTo(
      result.frictionHeadLossMagnitude,
      0.24000316507008526,
      1e-10,
    )

    closeTo(
      result.totalHeadChange,
      -0.24000316507008526,
      1e-10,
    )

    closeTo(
      result.energyClosureResidual,
      0,
      1e-11,
    )
  },
)


test(
  'reversing endpoint order reverses signed distance but preserves reach length',
  () => {
    const forward =
      calculatePartiallyFullCircularChannelDirectStep(
        exampleInput,
      )

    const reverse =
      calculatePartiallyFullCircularChannelDirectStep({
        ...exampleInput,

        state1FlowDepth:
          exampleInput.state2FlowDepth,

        state2FlowDepth:
          exampleInput.state1FlowDepth,
      })

    closeTo(
      reverse.signedDistance,
      -forward.signedDistance,
      1e-8,
    )

    closeTo(
      reverse.reachLength,
      forward.reachLength,
      1e-8,
    )

    assert.equal(
      reverse.profileDirection,
      'State 2 lies upstream of State 1',
    )
  },
)


test(
  'rejects a direct-step reach crossing critical depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelDirectStep({
          ...exampleInput,

          state2FlowDepth:
            0.35,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelDirectStepError &&
        error.code ===
          'CROSSES_CRITICAL_DEPTH',
    )
  },
)


test(
  'rejects identical endpoint depths',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelDirectStep({
          ...exampleInput,

          state2FlowDepth:
            exampleInput.state1FlowDepth,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelDirectStepError &&
        error.code ===
          'IDENTICAL_DEPTHS',
    )
  },
)


test(
  'rejects near-uniform direct-step denominator',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelDirectStep({
          ...exampleInput,

          channelSlope:
            0.0013725450930553718,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelDirectStepError &&
        error.code ===
          'NEAR_UNIFORM_DENOMINATOR',
    )
  },
)


test(
  'rejects invalid negative bed slope',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelDirectStep({
          ...exampleInput,

          channelSlope:
            -0.001,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelDirectStepError &&
        error.code ===
          'INVALID_CHANNEL_SLOPE',
    )
  },
)


test(
  'rejects a depth at the conduit crown',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelDirectStep({
          ...exampleInput,

          state2FlowDepth:
            exampleInput.pipeDiameter,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelDirectStepError &&
        error.code ===
          'INVALID_STATE_2_DEPTH',
    )
  },
)


test(
  'exports direct-step geometry and energy data as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelDirectStep(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelDirectStepCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Partially Full Circular Channel Direct-Step Method/,
    )

    assert.match(
      csv,
      /Average Friction Slope/,
    )

    assert.match(
      csv,
      /Signed Distance/,
    )

    assert.match(
      csv,
      /Energy Closure Residual/,
    )
  },
)
