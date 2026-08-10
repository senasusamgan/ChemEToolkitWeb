import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelCriticalSlopeError,
  calculateTrapezoidalChannelCriticalSlope,
  createTrapezoidalChannelCriticalSlopeCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-critical-slope/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelCriticalSlope'

const input = {
  bottomWidth:
    2,

  volumetricFlowRate:
    5,

  sideSlopeHorizontalPerVertical:
    1,

  manningRoughness:
    0.015,

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
  'calculates trapezoidal critical slope',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelCriticalSlope',
    )

    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605138,
      1e-9,
    )

    closeTo(
      result.criticalSlope,
      0.0032698435232697593,
      1e-10,
    )

    closeTo(
      result.criticalSlopePercent,
      0.3269843523269759,
      1e-8,
    )

    closeTo(
      result.criticalSlopeAngleDegrees,
      0.18734756585442547,
      1e-8,
    )
  },
)

test(
  'critical slope reproduces target Manning discharge',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    closeTo(
      result.reconstructedVolumetricFlowRate,
      input.volumetricFlowRate,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.relativeDischargeResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'critical slope state closes at Froude number one',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    closeTo(
      result.froudeNumber,
      1,
      1e-8,
    )
  },
)

test(
  'calculates critical geometry consistently',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    closeTo(
      result.flowArea,
      2.0755699681563082,
      1e-8,
    )

    closeTo(
      result.topWidth,
      3.5074606017210277,
      1e-8,
    )

    closeTo(
      result.hydraulicRadius,
      0.5023317169816994,
      1e-8,
    )

    closeTo(
      result.criticalVelocity,
      2.408976848148083,
      1e-8,
    )
  },
)

test(
  'doubling Manning roughness quadruples critical slope',
  () => {
    const base =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    const rougher =
      calculateTrapezoidalChannelCriticalSlope({
        ...input,

        manningRoughness:
          input.manningRoughness *
          2,
      })

    closeTo(
      rougher.criticalSlope /
      base.criticalSlope,
      4,
      1e-10,
    )

    closeTo(
      rougher.criticalDepth,
      base.criticalDepth,
      1e-10,
    )
  },
)

test(
  'rectangular-channel limit matches analytical critical-depth geometry',
  () => {
    const width =
      3

    const flow =
      6

    const roughness =
      0.015

    const unitDischarge =
      flow /
      width

    const criticalDepth =
      (
        unitDischarge *
        unitDischarge /
        9.80665
      ) **
      (
        1 / 3
      )

    const area =
      width *
      criticalDepth

    const perimeter =
      width +
      2 *
      criticalDepth

    const radius =
      area /
      perimeter

    const expectedSlope =
      (
        (
          flow *
          roughness
        ) /
        (
          area *
          radius **
            (
              2 / 3
            )
        )
      ) **
      2

    const result =
      calculateTrapezoidalChannelCriticalSlope({
        bottomWidth:
          width,

        volumetricFlowRate:
          flow,

        sideSlopeHorizontalPerVertical:
          0,

        manningRoughness:
          roughness,

        fluidDensity:
          998,
      })

    closeTo(
      result.criticalDepth,
      criticalDepth,
      1e-9,
    )

    closeTo(
      result.criticalSlope,
      expectedSlope,
      1e-10,
    )
  },
)

test(
  'density changes mass flow and shear but not critical slope',
  () => {
    const base =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    const denser =
      calculateTrapezoidalChannelCriticalSlope({
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
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.boundaryShearStress /
      base.boundaryShearStress,
      2,
      1e-12,
    )
  },
)

test(
  'reports bed drop consistently with critical slope',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    closeTo(
      result.bedDropPer100m,
      result.criticalSlope *
      100,
      1e-12,
    )

    closeTo(
      result.criticalSlopePercent,
      result.bedDropPer100m,
      1e-12,
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelCriticalSlope({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelCriticalSlopeError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'rejects zero Manning roughness',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelCriticalSlope({
          ...input,

          manningRoughness:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelCriticalSlopeError &&
        error.code ===
          'INVALID_MANNING_ROUGHNESS',
    )
  },
)

test(
  'exports critical-slope results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalSlope(
        input,
      )

    const csv =
      createTrapezoidalChannelCriticalSlopeCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Critical slope/,
    )

    assert.match(
      csv,
      /Bed drop per 100 m/,
    )

    assert.match(
      csv,
      /Boundary shear stress/,
    )
  },
)
