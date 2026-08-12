import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMinimumUpstreamDepthBedRiseError,
  calculateTrapezoidalMinimumUpstreamDepthBedRise,
  createTrapezoidalMinimumUpstreamDepthBedRiseCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMinimumUpstreamDepthBedRise'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  bedRise:
    0.1,

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
  'solves minimum subcritical upstream depth for a specified bed rise',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMinimumUpstreamDepthBedRise',
    )

    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-8,
    )

    closeTo(
      result.criticalSpecificEnergy,
      1.0496095998521915,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamSpecificEnergy,
      1.1496095998521916,
      1e-8,
    )

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      1.0126594983639374,
      1e-8,
    )
  },
)

test(
  'reports the alternate supercritical upstream-energy root',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.alternateSupercriticalDepth,
      0.5797357496064219,
      1e-8,
    )

    closeTo(
      result.alternateVelocity,
      3.3432180286402735,
      1e-8,
    )

    closeTo(
      result.alternateFroudeNumber,
      1.5517041843193924,
      1e-8,
    )

    assert.ok(
      result.alternateFroudeNumber >
      1,
    )
  },
)

test(
  'required upstream state is subcritical',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      3.050798256354576,
      1e-8,
    )

    closeTo(
      result.upstreamVelocity,
      1.6389153198135562,
      1e-8,
    )

    closeTo(
      result.upstreamFroudeNumber,
      0.601159318881481,
      1e-8,
    )

    assert.ok(
      result.upstreamFroudeNumber <
      1,
    )
  },
)

test(
  'required upstream energy is critical energy plus bed rise',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.requiredUpstreamSpecificEnergy -
      result.criticalSpecificEnergy,
      input.bedRise,
      1e-10,
    )

    closeTo(
      result.upstreamVelocityHead,
      0.13695010148825415,
      1e-8,
    )
  },
)

test(
  'Calculator 436 forward choking result closes to specified bed rise',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.forwardMaximumBedRise,
      input.bedRise,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.bedRiseClosureResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'both alternate-depth branches close to required upstream energy',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    assert.ok(
      Math.abs(
        result.upstreamEnergyResidual,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.alternateEnergyResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'reports water-surface change at the critical crest',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationChange,
      -0.1589291975034256,
      1e-8,
    )

    closeTo(
      result.upstreamDepthToCriticalDepthRatio,
      1.3435303014988433,
      1e-8,
    )
  },
)

test(
  'a taller hump requires a deeper upstream subcritical state',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    const taller =
      calculateTrapezoidalMinimumUpstreamDepthBedRise({
        ...input,

        bedRise:
          0.2,
      })

    assert.ok(
      taller.minimumSubcriticalUpstreamDepth >
      base.minimumSubcriticalUpstreamDepth,
    )

    closeTo(
      taller.minimumSubcriticalUpstreamDepth,
      1.153212440217684,
      1e-8,
    )
  },
)

test(
  'smaller hump requires an upstream state closer to critical depth',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise({
        ...input,

        bedRise:
          0.05,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      0.9259644793454405,
      1e-8,
    )

    assert.ok(
      result.minimumSubcriticalUpstreamDepth >
      result.criticalDepth,
    )
  },
)

test(
  'density changes mass flow but not required hydraulic depth',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    const denser =
      calculateTrapezoidalMinimumUpstreamDepthBedRise({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.minimumSubcriticalUpstreamDepth,
      base.minimumSubcriticalUpstreamDepth,
      1e-8,
    )

    closeTo(
      denser.criticalDepth,
      base.criticalDepth,
      1e-8,
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
  'rejects zero bed rise because two distinct upstream energy roots would collapse at critical flow',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumUpstreamDepthBedRise({
          ...input,

          bedRise:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthBedRiseError &&
        error.code ===
          'INVALID_BED_RISE',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumUpstreamDepthBedRise({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthBedRiseError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports minimum upstream-depth design as CSV',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRise(
        input,
      )

    const csv =
      createTrapezoidalMinimumUpstreamDepthBedRiseCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Minimum subcritical upstream depth/,
    )

    assert.match(
      csv,
      /Alternate supercritical depth/,
    )

    assert.match(
      csv,
      /Forward maximum bed rise/,
    )

    assert.match(
      csv,
      /Bed-rise closure residual/,
    )
  },
)
