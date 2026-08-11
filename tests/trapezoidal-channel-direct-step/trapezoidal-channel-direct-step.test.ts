import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelDirectStepError,
  calculateTrapezoidalChannelDirectStep,
  createTrapezoidalChannelDirectStepCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-direct-step/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelDirectStep'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  manningRoughness:
    0.015,

  channelSlope:
    0.0015,

  startDepth:
    1.2,

  endDepth:
    1.4,

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
  'calculates a trapezoidal direct-step reach',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelDirectStep',
    )

    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-8,
    )

    closeTo(
      result.normalDepth,
      0.9361220828666974,
      1e-8,
    )

    closeTo(
      result.signedDistance,
      164.48135906855597,
      1e-6,
    )

    closeTo(
      result.reachLength,
      164.48135906855597,
      1e-6,
    )
  },
)

test(
  'classifies the reference reach as a mild-slope M1 profile',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    assert.equal(
      result.channelSlopeClass,
      'mild',
    )

    assert.equal(
      result.profileClassification,
      'M1',
    )

    assert.ok(
      input.startDepth >
      result.normalDepth,
    )

    assert.ok(
      input.endDepth >
      result.normalDepth,
    )
  },
)

test(
  'calculates section energies and friction slopes',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    closeTo(
      result.startSpecificEnergy,
      1.2864424144302307,
      1e-11,
    )

    closeTo(
      result.endSpecificEnergy,
      1.456256852721489,
      1e-11,
    )

    closeTo(
      result.startFrictionSlope,
      0.0006001296961063016,
      1e-14,
    )

    closeTo(
      result.endFrictionSlope,
      0.0003350230865202147,
      1e-14,
    )

    closeTo(
      result.averageFrictionSlope,
      0.0004675763913132582,
      1e-14,
    )
  },
)

test(
  'closes the direct-step energy equation',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    closeTo(
      result.specificEnergyChange,
      0.1698144382912583,
      1e-11,
    )

    closeTo(
      result.slopeDifference,
      0.0010324236086867418,
      1e-14,
    )

    closeTo(
      result.frictionHeadLoss,
      0.07690760031157566,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-11,
    )
  },
)

test(
  'reports bed and water-surface elevation changes',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    closeTo(
      result.bedElevationChange,
      -0.24672203860283395,
      1e-9,
    )

    closeTo(
      result.waterSurfaceElevationChange,
      -0.046722038602834,
      1e-9,
    )

    closeTo(
      result.energyGradeLineChange,
      -0.07690760031157566,
      1e-10,
    )
  },
)

test(
  'reversing endpoint order reverses signed distance but not reach length',
  () => {
    const forward =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    const reverse =
      calculateTrapezoidalChannelDirectStep({
        ...input,

        startDepth:
          input.endDepth,

        endDepth:
          input.startDepth,
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

    closeTo(
      reverse.frictionHeadLoss,
      forward.frictionHeadLoss,
      1e-10,
    )
  },
)

test(
  'density changes power and mass flow but not hydraulic reach length',
  () => {
    const base =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    const denser =
      calculateTrapezoidalChannelDirectStep({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.reachLength,
      base.reachLength,
      1e-9,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipated /
      base.hydraulicPowerDissipated,
      2,
      1e-12,
    )
  },
)

test(
  'calculates frictional hydraulic power dissipation',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    closeTo(
      result.massFlowRate,
      4990,
      1e-12,
    )

    closeTo(
      result.hydraulicPowerDissipated,
      3763.4875337916114,
      1e-7,
    )
  },
)

test(
  'rejects reaches that cross a GVF profile boundary',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelDirectStep({
          ...input,

          startDepth:
            0.9,

          endDepth:
            1.2,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelDirectStepError &&
        error.code ===
          'PROFILE_ZONE_CROSSING',
    )
  },
)

test(
  'rejects identical endpoint depths',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelDirectStep({
          ...input,

          endDepth:
            input.startDepth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelDirectStepError &&
        error.code ===
          'IDENTICAL_DEPTHS',
    )
  },
)

test(
  'rejects negative Manning roughness',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelDirectStep({
          ...input,

          manningRoughness:
            -0.015,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelDirectStepError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)

test(
  'exports direct-step results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelDirectStep(
        input,
      )

    const csv =
      createTrapezoidalChannelDirectStepCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /GVF profile classification/,
    )

    assert.match(
      csv,
      /Signed direct-step distance/,
    )

    assert.match(
      csv,
      /Friction head loss/,
    )

    assert.match(
      csv,
      /Energy closure residual/,
    )
  },
)
