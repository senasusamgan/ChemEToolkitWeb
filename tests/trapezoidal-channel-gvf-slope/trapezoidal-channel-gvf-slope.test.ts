import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelGvfSlopeError,
  calculateTrapezoidalChannelGvfSlope,
  createTrapezoidalChannelGvfSlopeCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-gvf-slope/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelGvfSlope'

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

  flowDepth:
    1.2,

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
  'calculates local GVF differential slope',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelGvfSlope',
    )

    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    closeTo(
      result.flowArea,
      3.84,
      1e-12,
    )

    closeTo(
      result.hydraulicRadius,
      0.7118872594189419,
      1e-12,
    )

    closeTo(
      result.meanVelocity,
      1.3020833333333335,
      1e-12,
    )

    closeTo(
      result.froudeNumber,
      0.4450811159057926,
      1e-12,
    )

    closeTo(
      result.frictionSlope,
      0.0006001296961063016,
      1e-14,
    )

    closeTo(
      result.depthGradient,
      0.0011221688010035439,
      1e-13,
    )
  },
)

test(
  'identifies normal and critical depths',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
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

    assert.equal(
      result.channelSlopeClass,
      'mild',
    )
  },
)

test(
  'classifies the reference state as M1',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    assert.equal(
      result.profileClassification,
      'M1',
    )

    assert.equal(
      result.flowRegime,
      'subcritical',
    )

    assert.ok(
      input.flowDepth >
      result.normalDepth,
    )
  },
)

test(
  'closes the GVF differential equation',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    closeTo(
      result.energyGradient,
      0.0008998703038936984,
      1e-14,
    )

    closeTo(
      result.froudeDenominator,
      0.8019028002640545,
      1e-13,
    )

    assert.ok(
      Math.abs(
        result.differentialEquationResidual,
      ) <=
      1e-14,
    )
  },
)

test(
  'calculates water surface and energy grade line gradients',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    closeTo(
      result.waterSurfaceElevationGradient,
      -0.00037783119899645616,
      1e-13,
    )

    closeTo(
      result.energyGradeLineGradient,
      -0.0006001296961063016,
      1e-14,
    )

    closeTo(
      result.depthChangePer100m,
      Number('0.11221688010035439'),
      1e-11,
    )

    closeTo(
      result.waterSurfaceElevationChangePer100m,
      -0.03778311989964562,
      1e-11,
    )

    closeTo(
      result.frictionHeadLossPer100m,
      0.06001296961063016,
      1e-12,
    )
  },
)

test(
  'M2 profile has a negative downstream depth gradient',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope({
        ...input,

        flowDepth:
          0.85,
      })

    assert.equal(
      result.profileClassification,
      'M2',
    )

    assert.equal(
      result.flowRegime,
      'subcritical',
    )

    assert.ok(
      result.depthGradient <
      0,
    )

    closeTo(
      result.depthGradient,
      -0.0018626255025789738,
      1e-12,
    )
  },
)

test(
  'M3 profile is supercritical and has positive depth gradient',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope({
        ...input,

        flowDepth:
          0.5,
      })

    assert.equal(
      result.profileClassification,
      'M3',
    )

    assert.equal(
      result.flowRegime,
      'supercritical',
    )

    assert.ok(
      result.froudeNumber >
      1,
    )

    assert.ok(
      result.depthGradient >
      0,
    )

    closeTo(
      result.depthGradient,
      0.004199648180164462,
      1e-12,
    )
  },
)

test(
  'density changes shear and power but not GVF geometry',
  () => {
    const base =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    const denser =
      calculateTrapezoidalChannelGvfSlope({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.depthGradient,
      base.depthGradient,
      1e-12,
    )

    closeTo(
      denser.normalDepth,
      base.normalDepth,
      1e-10,
    )

    closeTo(
      denser.boundaryShearStress /
      base.boundaryShearStress,
      2,
      1e-12,
    )

    closeTo(
      denser.hydraulicPowerDissipationPerLength /
      base.hydraulicPowerDissipationPerLength,
      2,
      1e-12,
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
  'calculates local boundary shear and hydraulic power dissipation',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    closeTo(
      result.boundaryShearStress,
      4.181263667884353,
      1e-10,
    )

    closeTo(
      result.hydraulicPowerDissipationPerLength,
      29.3674568027611,
      1e-10,
    )

    closeTo(
      result.massFlowRate,
      4990,
      1e-12,
    )
  },
)

test(
  'rejects negative Manning roughness',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelGvfSlope({
          ...input,

          manningRoughness:
            -0.015,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelGvfSlopeError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)

test(
  'rejects zero channel slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelGvfSlope({
          ...input,

          channelSlope:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelGvfSlopeError &&
        error.code ===
          'INVALID_CHANNEL_SLOPE',
    )
  },
)

test(
  'exports GVF slope results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelGvfSlope(
        input,
      )

    const csv =
      createTrapezoidalChannelGvfSlopeCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /GVF profile classification/,
    )

    assert.match(
      csv,
      /Depth gradient dy\/dx/,
    )

    assert.match(
      csv,
      /Water-surface elevation gradient/,
    )

    assert.match(
      csv,
      /Differential equation residual/,
    )
  },
)
