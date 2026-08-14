import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelNormalDepthError,
  calculatePartiallyFullCircularChannelNormalDepth,
  createPartiallyFullCircularChannelNormalDepthCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-normal-depth/engine.ts'

import {
  calculatePartiallyFullCircularChannelManningFlow,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-manning-flow/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelNormalDepth'

const input = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    1.2,

  manningRoughness:
    0.013,

  channelSlope:
    0.002,

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
  'solves a single circular-channel normal depth below full-flow capacity',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelNormalDepth',
    )

    const result =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    assert.equal(
      result.solutionMultiplicity,
      'Single normal depth',
    )

    assert.equal(
      result.deepSolution,
      null,
    )

    closeTo(
      result.shallowSolution.flowDepth,
      0.7315077496206753,
      2e-8,
    )

    closeTo(
      result.shallowSolution.depthRatio,
      0.6095897913505628,
      2e-8,
    )
  },
)


test(
  'Calculator 455 forward model closes the solved shallow normal depth',
  () => {
    const result =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    const forward =
      calculatePartiallyFullCircularChannelManningFlow({
        pipeDiameter:
          input.pipeDiameter,

        flowDepth:
          result.shallowSolution.flowDepth,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          input.channelSlope,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      forward.volumetricFlowRate,
      input.volumetricFlowRate,
      1e-8,
    )

    closeTo(
      result.shallowSolution.meanVelocity,
      1.6619964702454184,
      2e-8,
    )

    closeTo(
      result.shallowSolution.froudeNumber,
      0.6758331935693921,
      2e-8,
    )
  },
)


test(
  'recovers exactly half-full depth from Calculator 455 half-full flow',
  () => {
    const halfFull =
      calculatePartiallyFullCircularChannelManningFlow({
        pipeDiameter:
          1.2,

        flowDepth:
          0.6,

        manningRoughness:
          0.013,

        channelSlope:
          0.002,

        fluidDensity:
          998,
      })

    const inverse =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        volumetricFlowRate:
          halfFull.volumetricFlowRate,
      })

    closeTo(
      inverse.shallowSolution.flowDepth,
      0.6,
      2e-9,
    )

    closeTo(
      inverse.shallowSolution.depthRatio,
      0.5,
      2e-9,
    )
  },
)


test(
  'finds the maximum partially full Manning capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    closeTo(
      result.maximumCapacityDepthRatio,
      0.9381812138077288,
      2e-7,
    )

    closeTo(
      result.maximumPartialFlowCapacity,
      1.8755637575188648,
      2e-8,
    )

    closeTo(
      result.fullFlowCapacity,
      1.743565185934372,
      2e-9,
    )

    closeTo(
      result.maximumCapacityRatioToFull,
      1.0757061294004648,
      2e-8,
    )
  },
)


test(
  'returns two normal depths between full-flow and maximum partial-flow capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        volumetricFlowRate:
          1.8,
      })

    assert.equal(
      result.solutionMultiplicity,
      'Two normal depths',
    )

    assert.ok(
      result.deepSolution,
    )

    closeTo(
      result.shallowSolution.flowDepth,
      1.0225802295486814,
      3e-8,
    )

    closeTo(
      result.deepSolution!.flowDepth,
      1.1930685709297224,
      3e-8,
    )

    assert.ok(
      result.deepSolution!.flowDepth >
      result.shallowSolution.flowDepth,
    )
  },
)


test(
  'both dual normal-depth roots close Calculator 455 forward flow',
  () => {
    const result =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        volumetricFlowRate:
          1.8,
      })

    assert.ok(
      result.deepSolution,
    )

    for (
      const depth of [
        result.shallowSolution.flowDepth,
        result.deepSolution!.flowDepth,
      ]
    ) {
      const forward =
        calculatePartiallyFullCircularChannelManningFlow({
          pipeDiameter:
            input.pipeDiameter,

          flowDepth:
            depth,

          manningRoughness:
            input.manningRoughness,

          channelSlope:
            input.channelSlope,

          fluidDensity:
            input.fluidDensity,
        })

      closeTo(
        forward.volumetricFlowRate,
        1.8,
        2e-8,
      )
    }
  },
)


test(
  'rougher channel requires greater shallow normal depth for the same flow',
  () => {
    const base =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    const rougher =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        manningRoughness:
          0.015,
      })

    assert.ok(
      rougher.shallowSolution.flowDepth >
      base.shallowSolution.flowDepth,
    )
  },
)


test(
  'steeper channel requires smaller shallow normal depth for the same flow',
  () => {
    const base =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    const steeper =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        channelSlope:
          0.004,
      })

    assert.ok(
      steeper.shallowSolution.flowDepth <
      base.shallowSolution.flowDepth,
    )
  },
)


test(
  'density changes mass flow but not normal-depth hydraulics',
  () => {
    const base =
      calculatePartiallyFullCircularChannelNormalDepth(
        input,
      )

    const denser =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.shallowSolution.flowDepth,
      base.shallowSolution.flowDepth,
      1e-10,
    )

    closeTo(
      denser.maximumPartialFlowCapacity,
      base.maximumPartialFlowCapacity,
      1e-10,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )
  },
)


test(
  'rejects flow above maximum free-surface Manning capacity',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelNormalDepth({
          ...input,

          volumetricFlowRate:
            2,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelNormalDepthError &&
        error.code ===
          'FLOW_EXCEEDS_MAXIMUM_CAPACITY',
    )
  },
)


test(
  'rejects non-positive requested flow',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelNormalDepth({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelNormalDepthError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)


test(
  'exports single and dual normal-depth information as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelNormalDepth({
        ...input,

        volumetricFlowRate:
          1.8,
      })

    const csv =
      createPartiallyFullCircularChannelNormalDepthCsv(
        {
          ...input,

          volumetricFlowRate:
            1.8,
        },
        result,
      )

    assert.match(
      csv,
      /Solution multiplicity/,
    )

    assert.match(
      csv,
      /Maximum partial-flow capacity/,
    )

    assert.match(
      csv,
      /Shallow Solution/,
    )

    assert.match(
      csv,
      /Deep Solution/,
    )
  },
)
