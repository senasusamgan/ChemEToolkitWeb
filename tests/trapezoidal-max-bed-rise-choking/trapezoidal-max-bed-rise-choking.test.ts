import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumBedRiseBeforeChokingError,
  calculateTrapezoidalMaximumBedRiseBeforeChoking,
  createTrapezoidalMaximumBedRiseBeforeChokingCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-choking/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumBedRiseBeforeChoking'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
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
  'calculates maximum bed rise before trapezoidal-channel choking',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumBedRiseBeforeChoking',
    )

    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2864424144302307,
      1e-12,
    )

    closeTo(
      result.criticalSpecificEnergy,
      1.0496095998521915,
      1e-9,
    )

    closeTo(
      result.maximumBedRise,
      0.23683281457803917,
      1e-9,
    )
  },
)

test(
  'reference upstream state is subcritical',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      3.84,
      1e-12,
    )

    closeTo(
      result.upstreamVelocity,
      1.3020833333333335,
      1e-12,
    )

    closeTo(
      result.upstreamFroudeNumber,
      0.4450811159057926,
      1e-12,
    )

    assert.ok(
      result.upstreamFroudeNumber <
      1,
    )
  },
)

test(
  'crest choking state has Froude number equal to one',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-9,
    )

    closeTo(
      result.criticalFlowArea,
      2.075569968156301,
      1e-9,
    )

    closeTo(
      result.criticalVelocity,
      2.408976848148091,
      1e-9,
    )

    closeTo(
      result.criticalFroudeNumber,
      1,
      1e-8,
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
  'bed rise removes exactly the available specific-energy margin',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy -
      result.maximumBedRise,
      result.criticalSpecificEnergy,
      1e-10,
    )

    assert.ok(
      Math.abs(
        result.specificEnergyClosureResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'reports crest water-surface elevation at choking',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.990563115438551,
      1e-9,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtChoking,
      -0.20943688456144893,
      1e-9,
    )
  },
)

test(
  'rectangular limit matches analytical critical depth and energy',
  () => {
    const rectangular =
      calculateTrapezoidalMaximumBedRiseBeforeChoking({
        bottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          4,

        upstreamFlowDepth:
          1.5,

        fluidDensity:
          998,
      })

    const unitDischarge =
      4 /
      2

    const expectedCriticalDepth =
      (
        unitDischarge *
        unitDischarge /
        9.80665
      ) **
      (
        1 / 3
      )

    const expectedCriticalEnergy =
      1.5 *
      expectedCriticalDepth

    closeTo(
      rectangular.criticalDepth,
      expectedCriticalDepth,
      1e-9,
    )

    closeTo(
      rectangular.criticalSpecificEnergy,
      expectedCriticalEnergy,
      1e-9,
    )
  },
)

test(
  'deeper subcritical approach flow provides more hump margin',
  () => {
    const base =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    const deeper =
      calculateTrapezoidalMaximumBedRiseBeforeChoking({
        ...input,

        upstreamFlowDepth:
          1.4,
      })

    assert.ok(
      deeper.maximumBedRise >
      base.maximumBedRise,
    )

    assert.ok(
      deeper.upstreamFroudeNumber <
      base.upstreamFroudeNumber,
    )
  },
)

test(
  'density changes mass flow but not choking geometry',
  () => {
    const base =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumBedRiseBeforeChoking({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.maximumBedRise,
      base.maximumBedRise,
      1e-10,
    )

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
  'rejects a supercritical upstream approach state',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumBedRiseBeforeChoking({
          ...input,

          upstreamFlowDepth:
            0.4,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumBedRiseBeforeChokingError &&
        error.code ===
          'UPSTREAM_NOT_SUBCRITICAL',
    )
  },
)

test(
  'rejects zero volumetric flow rate',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumBedRiseBeforeChoking({
          ...input,

          volumetricFlowRate:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumBedRiseBeforeChokingError &&
        error.code ===
          'INVALID_FLOW_RATE',
    )
  },
)

test(
  'exports hump-choking results as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseBeforeChoking(
        input,
      )

    const csv =
      createTrapezoidalMaximumBedRiseBeforeChokingCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum bed rise before choking/,
    )

    assert.match(
      csv,
      /Critical Froude number/,
    )

    assert.match(
      csv,
      /Specific-energy closure residual/,
    )

    assert.match(
      csv,
      /Water-surface elevation change at choking/,
    )
  },
)
