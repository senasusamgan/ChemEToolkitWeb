import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumDischargeSpecificEnergyError,
  calculateTrapezoidalMaximumDischargeSpecificEnergy,
  createTrapezoidalMaximumDischargeSpecificEnergyCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumDischargeSpecificEnergy'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  availableSpecificEnergy:
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
  'calculates maximum trapezoidal discharge for available specific energy',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumDischargeSpecificEnergy',
    )

    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.867117014340245,
      1e-9,
    )

    closeTo(
      result.criticalFlowArea,
      2.4861259452388307,
      1e-9,
    )

    closeTo(
      result.criticalTopWidth,
      3.73423402868049,
      1e-9,
    )

    closeTo(
      result.maximumVolumetricFlowRate,
      6.352493956102899,
      1e-9,
    )
  },
)

test(
  'critical control section has Froude number equal to one',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    closeTo(
      result.criticalHydraulicDepth,
      0.6657659713195093,
      1e-10,
    )

    closeTo(
      result.criticalVelocity,
      2.555177853426345,
      1e-10,
    )

    closeTo(
      result.criticalFroudeNumber,
      1,
      1e-12,
    )
  },
)

test(
  'critical state recovers the specified specific energy',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    closeTo(
      result.criticalVelocityHead,
      0.33288298565975466,
      1e-10,
    )

    closeTo(
      result.recoveredSpecificEnergy,
      input.availableSpecificEnergy,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.specificEnergyResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'closes the general trapezoidal critical-flow condition',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    assert.ok(
      Math.abs(
        result.criticalConditionResidual,
      ) <=
      1e-12,
    )

    closeTo(
      result.forwardCriticalDepth,
      result.criticalDepth,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.criticalDepthClosureResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'rectangular limit matches the analytical two-thirds-energy critical depth',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy({
        ...input,

        sideSlopeHorizontalPerVertical:
          0,
      })

    const expectedCriticalDepth =
      (
        2 /
        3
      ) *
      input.availableSpecificEnergy

    const expectedDischarge =
      input.bottomWidth *
      Math.sqrt(
        9.80665,
      ) *
      expectedCriticalDepth **
        (
          3 / 2
        )

    closeTo(
      result.criticalDepth,
      expectedCriticalDepth,
      1e-10,
    )

    closeTo(
      result.maximumVolumetricFlowRate,
      expectedDischarge,
      1e-9,
    )
  },
)

test(
  'more available specific energy increases maximum discharge',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    const higher =
      calculateTrapezoidalMaximumDischargeSpecificEnergy({
        ...input,

        availableSpecificEnergy:
          2,
      })

    assert.ok(
      higher.criticalDepth >
      base.criticalDepth,
    )

    assert.ok(
      higher.maximumVolumetricFlowRate >
      base.maximumVolumetricFlowRate,
    )

    closeTo(
      higher.maximumVolumetricFlowRate,
      16.448192099016868,
      1e-8,
    )
  },
)

test(
  'a wider channel carries more maximum discharge at the same energy',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    const wider =
      calculateTrapezoidalMaximumDischargeSpecificEnergy({
        ...input,

        bottomWidth:
          4,
      })

    assert.ok(
      wider.maximumVolumetricFlowRate >
      base.maximumVolumetricFlowRate,
    )

    closeTo(
      wider.maximumVolumetricFlowRate,
      10.803238743336614,
      1e-8,
    )
  },
)

test(
  'density affects mass capacity but not volumetric critical state',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumDischargeSpecificEnergy({
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
      denser.maximumVolumetricFlowRate,
      base.maximumVolumetricFlowRate,
      1e-10,
    )

    closeTo(
      denser.maximumMassFlowRate /
      base.maximumMassFlowRate,
      2,
      1e-12,
    )
  },
)

test(
  'reports maximum mass-flow capacity',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    closeTo(
      result.maximumMassFlowRate,
      6339.788968190694,
      1e-8,
    )

    closeTo(
      result.dischargePerUnitTopWidth,
      1.7011504654804896,
      1e-10,
    )
  },
)

test(
  'rejects zero specific energy',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumDischargeSpecificEnergy({
          ...input,

          availableSpecificEnergy:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeSpecificEnergyError &&
        error.code ===
          'INVALID_SPECIFIC_ENERGY',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumDischargeSpecificEnergy({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeSpecificEnergyError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports maximum-discharge results as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeSpecificEnergy(
        input,
      )

    const csv =
      createTrapezoidalMaximumDischargeSpecificEnergyCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum volumetric flow rate/,
    )

    assert.match(
      csv,
      /Critical condition residual/,
    )

    assert.match(
      csv,
      /Forward critical depth/,
    )
  },
)
