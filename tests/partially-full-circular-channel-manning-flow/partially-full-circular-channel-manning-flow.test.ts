import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelManningFlowError,
  calculatePartiallyFullCircularChannelManningFlow,
  createPartiallyFullCircularChannelManningFlowCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-manning-flow/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelManningFlow'

const input = {
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
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-9,
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
  'solves the half-full circular-channel reference case',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelManningFlow',
    )

    const result =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    closeTo(
      result.depthRatio,
      0.5,
      1e-12,
    )

    closeTo(
      result.centralAngleRadians,
      Math.PI,
      1e-12,
    )

    closeTo(
      result.centralAngleDegrees,
      180,
      1e-12,
    )

    closeTo(
      result.flowArea,
      0.5654866776461628,
      1e-12,
    )

    closeTo(
      result.wettedPerimeter,
      1.8849555921538759,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      0.3,
      1e-12,
    )
  },
)


test(
  'half-full section carries exactly half the full Manning flow at equal velocity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    closeTo(
      result.volumetricFlowRate,
      0.871782592967186,
      1e-12,
    )

    closeTo(
      result.fullFlowVolumetricFlowRate,
      1.743565185934372,
      1e-12,
    )

    closeTo(
      result.flowRateRatioToFull,
      0.5,
      1e-12,
    )

    closeTo(
      result.velocityRatioToFull,
      1,
      1e-12,
    )
  },
)


test(
  'reports half-full velocity hydraulic depth and Froude number',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    closeTo(
      result.topWidth,
      1.2,
      1e-12,
    )

    closeTo(
      result.hydraulicDepth,
      0.471238898038469,
      1e-12,
    )

    closeTo(
      result.meanVelocity,
      1.5416500996910827,
      1e-12,
    )

    closeTo(
      result.froudeNumber,
      0.7171415931598403,
      1e-12,
    )

    assert.equal(
      result.flowRegime,
      'Subcritical',
    )
  },
)


test(
  'shallow thirty-percent-full channel has lower capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow({
        ...input,

        flowDepth:
          0.36,
      })

    closeTo(
      result.depthRatio,
      0.3,
      1e-12,
    )

    closeTo(
      result.flowRateRatioToFull,
      0.19583118810179856,
      1e-12,
    )

    assert.ok(
      result.volumetricFlowRate <
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      ).volumetricFlowRate,
    )
  },
)


test(
  'deep partially full channel can exceed nominal full-flow Manning capacity',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow({
        ...input,

        flowDepth:
          1.128,
      })

    closeTo(
      result.depthRatio,
      0.94,
      1e-12,
    )

    assert.ok(
      result.flowRateRatioToFull >
      1,
    )

    closeTo(
      result.flowRateRatioToFull,
      1.0756794411849153,
      1e-10,
    )

    assert.ok(
      result.velocityRatioToFull >
      1,
    )
  },
)


test(
  'reports boundary shear and power dissipation',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    closeTo(
      result.averageBoundaryShearStress,
      5.87222202,
      1e-8,
    )

    closeTo(
      result.hydraulicPowerDissipationPerUnitLength,
      17.06433646358202,
      1e-9,
    )

    closeTo(
      result.massFlowRate,
      870.0390277812515,
      1e-9,
    )
  },
)


test(
  'density changes mass shear and power but not hydraulic flow solution',
  () => {
    const base =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    const doubleDensity =
      calculatePartiallyFullCircularChannelManningFlow({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      doubleDensity.volumetricFlowRate,
      base.volumetricFlowRate,
      1e-12,
    )

    closeTo(
      doubleDensity.meanVelocity,
      base.meanVelocity,
      1e-12,
    )

    closeTo(
      doubleDensity.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      doubleDensity.averageBoundaryShearStress /
      base.averageBoundaryShearStress,
      2,
      1e-12,
    )

    closeTo(
      doubleDensity.hydraulicPowerDissipationPerUnitLength /
      base.hydraulicPowerDissipationPerUnitLength,
      2,
      1e-12,
    )
  },
)


test(
  'Manning flow scales with square root of slope',
  () => {
    const base =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    const steeper =
      calculatePartiallyFullCircularChannelManningFlow({
        ...input,

        channelSlope:
          input.channelSlope *
          4,
      })

    closeTo(
      steeper.volumetricFlowRate /
      base.volumetricFlowRate,
      2,
      1e-12,
    )

    closeTo(
      steeper.meanVelocity /
      base.meanVelocity,
      2,
      1e-12,
    )

    closeTo(
      steeper.hydraulicPowerDissipationPerUnitLength /
      base.hydraulicPowerDissipationPerUnitLength,
      8,
      1e-10,
    )
  },
)


test(
  'rejects zero flow depth',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelManningFlow({
          ...input,

          flowDepth:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelManningFlowError &&
        error.code ===
          'INVALID_FLOW_DEPTH',
    )
  },
)


test(
  'rejects full-pipe depth because pressure-flow is outside the model',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelManningFlow({
          ...input,

          flowDepth:
            input.pipeDiameter,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelManningFlowError &&
        error.code ===
          'INVALID_FLOW_DEPTH',
    )
  },
)


test(
  'rejects non-positive Manning roughness',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelManningFlow({
          ...input,

          manningRoughness:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelManningFlowError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)


test(
  'exports circular-channel calculation as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelManningFlow(
        input,
      )

    const csv =
      createPartiallyFullCircularChannelManningFlowCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Central angle/,
    )

    assert.match(
      csv,
      /Flow-rate ratio to full/,
    )

    assert.match(
      csv,
      /Average boundary shear stress/,
    )

    assert.match(
      csv,
      /Hydraulic power dissipation per unit length/,
    )
  },
)
