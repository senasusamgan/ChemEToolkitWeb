import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalCriticalControlWidthError,
  calculateTrapezoidalCriticalControlWidth,
  createTrapezoidalCriticalControlWidthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-critical-control-width/engine.ts'

const CALCULATOR_ID =
  'trapezoidalCriticalControlWidth'

const input = {
  volumetricFlowRate:
    5,

  availableSpecificEnergy:
    1.2,

  sideSlopeHorizontalPerVertical:
    1,

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
  'solves required trapezoidal critical-control bottom width',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalCriticalControlWidth',
    )

    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    closeTo(
      result.requiredBottomWidth,
      1.387929600220732,
      2e-8,
    )

    closeTo(
      result.criticalDepth,
      0.882311449061699,
      2e-8,
    )

    closeTo(
      result.criticalFlowArea,
      2.0030596699117336,
      3e-8,
    )

    closeTo(
      result.criticalTopWidth,
      3.15255249834413,
      3e-8,
    )
  },
)

test(
  'designed control section operates at critical flow',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    closeTo(
      result.criticalHydraulicDepth,
      0.6353771018766017,
      3e-8,
    )

    closeTo(
      result.criticalVelocity,
      2.496181254660441,
      3e-8,
    )

    closeTo(
      result.criticalFroudeNumber,
      1,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.criticalConditionResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'forward Calculator 434 capacity closes to requested discharge',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    closeTo(
      result.reconstructedMaximumFlowRate,
      input.volumetricFlowRate,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.flowClosureResidual,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.relativeFlowClosureResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'critical state recovers available specific energy',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    closeTo(
      result.criticalVelocityHead,
      0.3176885509383008,
      3e-8,
    )

    closeTo(
      result.recoveredSpecificEnergy,
      input.availableSpecificEnergy,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.specificEnergyResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'reports zero-bottom-width triangular limiting capacity',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    closeTo(
      result.zeroBottomWidthCapacity,
      1.9995092729116108,
      1e-10,
    )

    closeTo(
      result.capacityMarginAboveZeroWidthLimit,
      3.000490727088389,
      1e-10,
    )
  },
)

test(
  'rectangular limit matches analytical critical-control width',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth({
        ...input,

        sideSlopeHorizontalPerVertical:
          0,
      })

    const criticalDepth =
      (
        2 /
        3
      ) *
      input.availableSpecificEnergy

    const expectedWidth =
      input.volumetricFlowRate /
      (
        Math.sqrt(
          9.80665,
        ) *
        criticalDepth **
          (
            3 / 2
          )
      )

    closeTo(
      result.criticalDepth,
      criticalDepth,
      2e-8,
    )

    closeTo(
      result.requiredBottomWidth,
      expectedWidth,
      2e-8,
    )

    closeTo(
      result.requiredBottomWidth,
      2.231385908170367,
      2e-8,
    )
  },
)

test(
  'higher required discharge needs a wider control section',
  () => {
    const base =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    const higher =
      calculateTrapezoidalCriticalControlWidth({
        ...input,

        volumetricFlowRate:
          7,
      })

    assert.ok(
      higher.requiredBottomWidth >
      base.requiredBottomWidth,
    )

    assert.ok(
      higher.reconstructedMaximumFlowRate >
      base.reconstructedMaximumFlowRate,
    )
  },
)

test(
  'more available specific energy reduces required width when a positive-width solution exists',
  () => {
    const base =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    const higherEnergy =
      calculateTrapezoidalCriticalControlWidth({
        ...input,

        availableSpecificEnergy:
          1.5,
      })

    assert.ok(
      higherEnergy.requiredBottomWidth <
      base.requiredBottomWidth,
    )

    closeTo(
      higherEnergy.requiredBottomWidth,
      0.5091434767971925,
      3e-8,
    )
  },
)

test(
  'density changes mass flow but not required control geometry',
  () => {
    const base =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    const denser =
      calculateTrapezoidalCriticalControlWidth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.requiredBottomWidth,
      base.requiredBottomWidth,
      1e-8,
    )

    closeTo(
      denser.criticalDepth,
      base.criticalDepth,
      1e-8,
    )

    closeTo(
      denser.designMassFlowRate /
      base.designMassFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'reports positive solver iterations',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    assert.ok(
      result.solverIterations >
      0,
    )

    assert.ok(
      result.solverIterations <=
      200,
    )
  },
)

test(
  'rejects flow below the triangular zero-bottom-width capacity',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalCriticalControlWidth({
          ...input,

          volumetricFlowRate:
            1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalCriticalControlWidthError &&
        error.code ===
          'FLOW_BELOW_ZERO_WIDTH_LIMIT',
    )
  },
)

test(
  'rejects zero available specific energy',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalCriticalControlWidth({
          ...input,

          availableSpecificEnergy:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalCriticalControlWidthError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)

test(
  'exports critical-control width results as CSV',
  () => {
    const result =
      calculateTrapezoidalCriticalControlWidth(
        input,
      )

    const csv =
      createTrapezoidalCriticalControlWidthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required bottom width/,
    )

    assert.match(
      csv,
      /Zero-bottom-width limiting capacity/,
    )

    assert.match(
      csv,
      /Reconstructed maximum flow rate/,
    )

    assert.match(
      csv,
      /Critical condition residual/,
    )
  },
)
