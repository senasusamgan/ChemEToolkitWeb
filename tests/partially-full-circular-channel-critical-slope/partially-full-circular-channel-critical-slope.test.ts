import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PartiallyFullCircularChannelCriticalSlopeError,
  calculatePartiallyFullCircularChannelCriticalSlope,
  createPartiallyFullCircularChannelCriticalSlopeCsv,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-slope/engine.ts'

import {
  calculatePartiallyFullCircularChannelManningFlow,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-manning-flow/engine.ts'

import {
  calculatePartiallyFullCircularChannelNormalDepth,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-normal-depth/engine.ts'

import {
  calculatePartiallyFullCircularChannelCriticalDepth,
} from '../../src/features/fluid-mechanics/partially-full-circular-channel-critical-depth/engine.ts'

const CALCULATOR_ID =
  'partiallyFullCircularChannelCriticalSlope'

const input = {
  pipeDiameter:
    1.2,

  volumetricFlowRate:
    1.2,

  manningRoughness:
    0.013,

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
  'solves circular-channel critical-slope reference case',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'partiallyFullCircularChannelCriticalSlope',
    )

    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    closeTo(
      result.criticalSlope,
      Number('0.0038777963811781114'),
      2e-12,
    )

    closeTo(
      result.criticalSlopePercent,
      Number('0.38777963811781114'),
      2e-10,
    )

    closeTo(
      result.criticalSlopePerMille,
      Number('3.8777963811781114'),
      2e-9,
    )
  },
)


test(
  'Calculator 457 critical geometry is preserved exactly',
  () => {
    const slope =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const critical =
      calculatePartiallyFullCircularChannelCriticalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      slope.criticalDepth,
      critical.criticalDepth,
      1e-12,
    )

    closeTo(
      slope.criticalFlowArea,
      critical.criticalFlowArea,
      1e-12,
    )

    closeTo(
      slope.criticalHydraulicRadius,
      critical.criticalHydraulicRadius,
      1e-12,
    )

    closeTo(
      slope.criticalFroudeNumber,
      1,
      1e-9,
    )
  },
)


test(
  'Calculator 455 Manning flow closes at the critical depth and slope',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const forward =
      calculatePartiallyFullCircularChannelManningFlow({
        pipeDiameter:
          input.pipeDiameter,

        flowDepth:
          result.criticalDepth,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          result.criticalSlope,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      forward.volumetricFlowRate,
      input.volumetricFlowRate,
      1e-9,
    )

    closeTo(
      forward.froudeNumber,
      1,
      1e-8,
    )
  },
)


test(
  'Calculator 456 normal depth equals critical depth at critical slope',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const normal =
      calculatePartiallyFullCircularChannelNormalDepth({
        pipeDiameter:
          input.pipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        manningRoughness:
          input.manningRoughness,

        channelSlope:
          result.criticalSlope,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      normal.shallowSolution.flowDepth,
      result.criticalDepth,
      2e-8,
    )

    assert.equal(
      normal.solutionMultiplicity,
      'Single normal depth',
    )
  },
)


test(
  'reports critical shear stress and hydraulic power dissipation',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    closeTo(
      result.averageBoundaryShearStress,
      11.336468550882422,
      2e-9,
    )

    closeTo(
      result.hydraulicPowerDissipationPerUnitLength,
      45.54256259726083,
      2e-9,
    )

    closeTo(
      result.massFlowRate,
      1197.6,
      1e-10,
    )
  },
)


test(
  'reports full-flow capacity at the critical slope',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    closeTo(
      result.fullFlowCapacityAtCriticalSlope,
      2.42781556539836,
      2e-10,
    )

    closeTo(
      result.flowToFullCapacityRatio,
      0.4942714830165042,
      2e-10,
    )

    assert.ok(
      result.fullFlowCapacityAtCriticalSlope >
      input.volumetricFlowRate,
    )
  },
)


test(
  'critical slope scales with Manning roughness squared',
  () => {
    const base =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const rougher =
      calculatePartiallyFullCircularChannelCriticalSlope({
        ...input,

        manningRoughness:
          input.manningRoughness *
          2,
      })

    closeTo(
      rougher.criticalDepth,
      base.criticalDepth,
      1e-12,
    )

    closeTo(
      rougher.criticalSlope /
      base.criticalSlope,
      4,
      1e-10,
    )
  },
)


test(
  'density changes mass shear and power but not critical slope',
  () => {
    const base =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const denser =
      calculatePartiallyFullCircularChannelCriticalSlope({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.criticalSlope,
      base.criticalSlope,
      1e-12,
    )

    closeTo(
      denser.criticalDepth,
      base.criticalDepth,
      1e-12,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.averageBoundaryShearStress /
      base.averageBoundaryShearStress,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipationPerUnitLength /
      base.hydraulicPowerDissipationPerUnitLength,
      2,
      1e-12,
    )
  },
)


test(
  'provides mild critical steep slope classification rule',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    assert.match(
      result.slopeClassificationRule,
      /S0 < Sc gives a mild slope/,
    )

    assert.match(
      result.slopeClassificationRule,
      /S0 > Sc gives a steep slope/,
    )
  },
)


test(
  'rejects non-positive Manning roughness',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCriticalSlope({
          ...input,

          manningRoughness:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelCriticalSlopeError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)


test(
  'rejects non-positive diameter',
  () => {
    assert.throws(
      () =>
        calculatePartiallyFullCircularChannelCriticalSlope({
          ...input,

          pipeDiameter:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PartiallyFullCircularChannelCriticalSlopeError &&
        error.code ===
          'INVALID_DIAMETER',
    )
  },
)


test(
  'exports circular critical slope as CSV',
  () => {
    const result =
      calculatePartiallyFullCircularChannelCriticalSlope(
        input,
      )

    const csv =
      createPartiallyFullCircularChannelCriticalSlopeCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Critical slope/,
    )

    assert.match(
      csv,
      /Manning conveyance/,
    )

    assert.match(
      csv,
      /Full-flow capacity at critical slope/,
    )

    assert.match(
      csv,
      /Slope classification rule/,
    )
  },
)
