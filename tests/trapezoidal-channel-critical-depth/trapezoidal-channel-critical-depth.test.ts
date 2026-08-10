import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelCriticalDepthError,
  calculateTrapezoidalChannelCriticalDepth,
  createTrapezoidalChannelCriticalDepthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-critical-depth/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelCriticalDepth'

const input = {
  bottomWidth:
    2,

  volumetricFlowRate:
    5,

  sideSlopeHorizontalPerVertical:
    1,

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
  'solves trapezoidal critical depth',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelCriticalDepth',
    )

    const result =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-9,
    )

    closeTo(
      result.flowArea,
      2.075569968156301,
      1e-8,
    )

    closeTo(
      result.topWidth,
      3.5074606017210237,
      1e-8,
    )
  },
)

test(
  'critical solution closes at Froude number one',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    closeTo(
      result.froudeNumber,
      1,
      1e-8,
    )

    closeTo(
      result.criticalVelocity,
      result.gravityWaveCelerity,
      1e-8,
    )
  },
)

test(
  'reconstructs the target discharge from critical geometry',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalDepth(
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
      1e-8,
    )
  },
)

test(
  'rectangular-channel limit matches analytical critical depth',
  () => {
    const width =
      3

    const flow =
      6

    const unitDischarge =
      flow /
      width

    const analyticalDepth =
      (
        unitDischarge *
        unitDischarge /
        9.80665
      ) **
      (
        1 / 3
      )

    const result =
      calculateTrapezoidalChannelCriticalDepth({
        bottomWidth:
          width,

        volumetricFlowRate:
          flow,

        sideSlopeHorizontalPerVertical:
          0,

        fluidDensity:
          998,
      })

    closeTo(
      result.criticalDepth,
      analyticalDepth,
      1e-9,
    )

    closeTo(
      result.specificEnergyToDepthRatio,
      1.5,
      1e-8,
    )
  },
)

test(
  'higher discharge requires greater critical depth',
  () => {
    const base =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    const higher =
      calculateTrapezoidalChannelCriticalDepth({
        ...input,

        volumetricFlowRate:
          8,
      })

    assert.ok(
      higher.criticalDepth >
      base.criticalDepth,
    )
  },
)

test(
  'wider bottom lowers critical depth for fixed discharge',
  () => {
    const base =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    const wider =
      calculateTrapezoidalChannelCriticalDepth({
        ...input,

        bottomWidth:
          3,
      })

    assert.ok(
      wider.criticalDepth <
      base.criticalDepth,
    )
  },
)

test(
  'larger side slope lowers critical depth for fixed flow',
  () => {
    const narrow =
      calculateTrapezoidalChannelCriticalDepth({
        ...input,

        sideSlopeHorizontalPerVertical:
          0.5,
      })

    const wide =
      calculateTrapezoidalChannelCriticalDepth({
        ...input,

        sideSlopeHorizontalPerVertical:
          2,
      })

    assert.ok(
      wide.criticalDepth <
      narrow.criticalDepth,
    )
  },
)

test(
  'density changes mass flow but not critical depth',
  () => {
    const base =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    const denser =
      calculateTrapezoidalChannelCriticalDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.criticalDepth,
      base.criticalDepth,
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
  'reports positive specific energy and solver iterations',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    assert.ok(
      result.specificEnergy >
      result.criticalDepth,
    )

    assert.ok(
      result.velocityHead >
      0,
    )

    assert.ok(
      result.solverIterations >
      0,
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelCriticalDepth({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelCriticalDepthError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'rejects zero discharge',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelCriticalDepth({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelCriticalDepthError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)

test(
  'exports critical-depth solution as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelCriticalDepth(
        input,
      )

    const csv =
      createTrapezoidalChannelCriticalDepthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Critical depth/,
    )

    assert.match(
      csv,
      /Gravity-wave celerity/,
    )

    assert.match(
      csv,
      /Relative discharge residual/,
    )
  },
)
