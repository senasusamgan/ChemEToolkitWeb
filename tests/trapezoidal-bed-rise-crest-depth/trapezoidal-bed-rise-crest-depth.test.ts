import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelBedRiseCrestDepthError,
  calculateTrapezoidalChannelBedRiseCrestDepth,
  createTrapezoidalChannelBedRiseCrestDepthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelBedRiseCrestDepth'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
    1.2,

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
  'solves physical and alternate crest depths over a specified bed rise',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelBedRiseCrestDepth',
    )

    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    assert.equal(
      result.flowStatus,
      'Unchoked — subcritical crest solution available',
    )

    closeTo(
      result.subcriticalCrestDepth!,
      1.0675987165550374,
      1e-9,
    )

    closeTo(
      result.supercriticalAlternateDepth!,
      0.5563898395426796,
      1e-9,
    )
  },
)

test(
  'reports correct crest Froude regimes',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    closeTo(
      result.subcriticalCrestFroudeNumber!,
      0.5478326420957134,
      1e-9,
    )

    closeTo(
      result.supercriticalAlternateFroudeNumber!,
      1.660635997530364,
      1e-9,
    )

    assert.ok(
      result.subcriticalCrestFroudeNumber! <
      1,
    )

    assert.ok(
      result.supercriticalAlternateFroudeNumber! >
      1,
    )
  },
)

test(
  'uses Calculator 436 choking margin',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    closeTo(
      result.maximumBedRiseBeforeChoking,
      0.23683281457803917,
      1e-9,
    )

    closeTo(
      result.remainingBedRiseMargin,
      0.13683281457803917,
      1e-9,
    )

    assert.ok(
      result.bedRiseUtilizationRatio >
      0 &&
      result.bedRiseUtilizationRatio <
      1,
    )
  },
)

test(
  'both crest-depth branches satisfy the same specific-energy equation',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    closeTo(
      result.nominalCrestSpecificEnergy,
      Number('1.1864424144302307'),
      1e-12,
    )

    assert.ok(
      Math.abs(
        result.subcriticalEnergyResidual!,
      ) <=
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.alternateEnergyResidual!,
      ) <=
      1e-9,
    )
  },
)

test(
  'reports water-surface response over the hump',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationChange!,
      -0.032401283444962514,
      1e-9,
    )
  },
)

test(
  'zero bed rise recovers the upstream subcritical depth',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth({
        ...input,

        bedRise:
          0,
      })

    closeTo(
      result.subcriticalCrestDepth!,
      input.upstreamFlowDepth,
      1e-9,
    )

    closeTo(
      result.crestWaterSurfaceElevationChange!,
      0,
      1e-9,
    )
  },
)

test(
  'exact maximum bed rise reaches the critical choking threshold',
  () => {
    const base =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    const threshold =
      calculateTrapezoidalChannelBedRiseCrestDepth({
        ...input,

        bedRise:
          base.maximumBedRiseBeforeChoking,
      })

    assert.equal(
      threshold.flowStatus,
      'Critical choking threshold',
    )

    closeTo(
      threshold.subcriticalCrestDepth!,
      threshold.criticalDepth,
      1e-9,
    )

    closeTo(
      threshold.subcriticalCrestFroudeNumber!,
      1,
      1e-8,
    )
  },
)

test(
  'bed rise above maximum is reported as choked',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth({
        ...input,

        bedRise:
          0.3,
      })

    assert.equal(
      result.flowStatus,
      'Choked — upstream adjustment required',
    )

    assert.equal(
      result.subcriticalCrestDepth,
      null,
    )

    assert.equal(
      result.supercriticalAlternateDepth,
      null,
    )

    closeTo(
      result.additionalSpecificEnergyRequired,
      0.06316718542196081,
      1e-9,
    )
  },
)

test(
  'density affects mass flow but not crest hydraulics',
  () => {
    const base =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    const denser =
      calculateTrapezoidalChannelBedRiseCrestDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.subcriticalCrestDepth!,
      base.subcriticalCrestDepth!,
      1e-9,
    )

    closeTo(
      denser.maximumBedRiseBeforeChoking,
      base.maximumBedRiseBeforeChoking,
      1e-9,
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
  'rejects negative bed rise',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelBedRiseCrestDepth({
          ...input,

          bedRise:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelBedRiseCrestDepthError &&
        error.code ===
          'INVALID_BED_RISE',
    )
  },
)

test(
  'rejects supercritical upstream approach flow',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelBedRiseCrestDepth({
          ...input,

          upstreamFlowDepth:
            0.4,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelBedRiseCrestDepthError &&
        error.code ===
          'UPSTREAM_NOT_SUBCRITICAL',
    )
  },
)

test(
  'exports bed-rise crest analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelBedRiseCrestDepth(
        input,
      )

    const csv =
      createTrapezoidalChannelBedRiseCrestDepthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Flow status/,
    )

    assert.match(
      csv,
      /Maximum bed rise before choking/,
    )

    assert.match(
      csv,
      /Subcritical crest depth/,
    )

    assert.match(
      csv,
      /Supercritical alternate depth/,
    )
  },
)
