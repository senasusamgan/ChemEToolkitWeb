import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelGvfSlopeError,
  calculatePartiallyFullCircularChannelGvfSlope,
  createPartiallyFullCircularChannelGvfSlopeCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-gvf-slope/engine.ts'

import {
  calculatePartiallyFullCircularChannelDirectStep,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-direct-step/engine.ts'


const calculatorId =
  'partiallyFullCircularChannelGvfSlope'


const exampleInput = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    0.6,

  manningRoughness:
    0.013,

  channelSlope:
    0.001,

  flowDepth:
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
  'exposes Calculator 462 direct-test signal',
  () => {
    assert.equal(
      calculatorId,
      'partiallyFullCircularChannelGvfSlope',
    )
  },
)


test(
  'evaluates reference circular-channel geometry',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfSlope(
        exampleInput,
      )

    closeTo(
      result.centralAngleDegrees,
      160.81186354627908,
      1e-10,
    )

    closeTo(
      result.flowArea,
      0.4460445712960784,
      1e-12,
    )

    closeTo(
      result.topWidth,
      1.1832159566199232,
      1e-12,
    )

    closeTo(
      result.wettedPerimeter,
      1.6840178970902486,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      0.2648692582583487,
      1e-12,
    )

    closeTo(
      result.hydraulicDepth,
      0.37697646722943784,
      1e-12,
    )
  },
)


test(
  'evaluates subcritical GVF differential slope',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfSlope(
        exampleInput,
      )

    closeTo(
      result.meanVelocity,
      1.3451570506879413,
      1e-12,
    )

    closeTo(
      result.froudeNumber,
      0.6996092363256958,
      1e-12,
    )

    closeTo(
      result.specificEnergy,
      0.592256147156036,
      1e-12,
    )

    closeTo(
      result.frictionSlope,
      0.0017977278598395822,
      1e-14,
    )

    closeTo(
      result.slopeNumerator,
      -0.0007977278598395822,
      1e-14,
    )

    closeTo(
      result.froudeDenominator,
      0.5105469164477767,
      1e-12,
    )

    closeTo(
      result.depthGradient,
      -0.001562496675897916,
      1e-14,
    )

    closeTo(
      result.depthChangePer100m,
      -0.1562496675897916,
      1e-12,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )

    assert.equal(
      result.localProfileTrend,
      'Depth decreases downstream',
    )

    assert.equal(
      result.slopeBalance,
      'Friction slope exceeds bed slope',
    )
  },
)


test(
  'Calculator 457 critical depth separates the local regime',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfSlope(
        exampleInput,
      )

    closeTo(
      result.criticalDepth,
      0.41526533730881154,
      1e-8,
    )

    assert.ok(
      result.flowDepth >
        result.criticalDepth,
    )

    assert.ok(
      result.criticalDepthDifference >
        0,
    )

    assert.ok(
      result.froudeNumber <
        1,
    )
  },
)


test(
  'evaluates a supercritical circular-channel GVF state',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfSlope({
        ...exampleInput,

        flowDepth:
          0.35,
      })

    closeTo(
      result.froudeNumber,
      1.39213395428884,
      1e-12,
    )

    closeTo(
      result.frictionSlope,
      0.00688911063956407,
      1e-14,
    )

    closeTo(
      result.froudeDenominator,
      -0.938036946683882,
      1e-12,
    )

    closeTo(
      result.depthGradient,
      0.006278122264142221,
      1e-14,
    )

    assert.equal(
      result.flowRegime,
      'Supercritical',
    )

    assert.equal(
      result.localProfileTrend,
      'Depth increases downstream',
    )
  },
)


test(
  'agrees locally with Calculator 461 direct-step method',
  () => {
    const local =
      calculatePartiallyFullCircularChannelGvfSlope(
        exampleInput,
      )

    const deltaDepth =
      0.0001

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
          exampleInput.flowDepth,

        state2FlowDepth:
          exampleInput.flowDepth +
          deltaDepth,
      })

    const finiteDifferenceGradient =
      deltaDepth /
      direct.signedDistance

    closeTo(
      finiteDifferenceGradient,
      local.depthGradient,
      2e-6,
    )
  },
)


test(
  'rejects the critical-flow singularity',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfSlope({
          ...exampleInput,

          flowDepth:
            0.41526533730881154,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfSlopeError &&
        error.code ===
          'NEAR_CRITICAL_FLOW',
    )
  },
)


test(
  'rejects non-positive bed slope',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfSlope({
          ...exampleInput,

          channelSlope:
            0,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfSlopeError &&
        error.code ===
          'INVALID_CHANNEL_SLOPE',
    )
  },
)


test(
  'rejects a flow depth at the conduit crown',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelGvfSlope({
          ...exampleInput,

          flowDepth:
            exampleInput.pipeDiameter,
        }),
      error =>
        error instanceof
          PartiallyFullCircularChannelGvfSlopeError &&
        error.code ===
          'INVALID_FLOW_DEPTH',
    )
  },
)


test(
  'exports GVF slope data as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelGvfSlope(
        exampleInput,
      )

    const csv =
      createPartiallyFullCircularChannelGvfSlopeCsv(
        exampleInput,
        result,
      )

    assert.match(
      csv,
      /Partially Full Circular Channel GVF Differential Slope/,
    )

    assert.match(
      csv,
      /Friction Slope/,
    )

    assert.match(
      csv,
      /1 - Fr\^2/,
    )

    assert.match(
      csv,
      /Depth Change per 100 m/,
    )
  },
)
