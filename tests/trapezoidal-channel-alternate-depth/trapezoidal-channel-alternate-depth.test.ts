import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalChannelAlternateDepthError,
  calculateTrapezoidalChannelAlternateDepth,
  createTrapezoidalChannelAlternateDepthCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-channel-alternate-depth/engine.ts'

const CALCULATOR_ID =
  'trapezoidalChannelAlternateDepth'

const input = {
  bottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  specificEnergy:
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
  'solves both trapezoidal alternate depths',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalChannelAlternateDepth',
    )

    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.7537303008605118,
      1e-9,
    )

    closeTo(
      result.minimumSpecificEnergy,
      1.0496095998521915,
      1e-9,
    )

    closeTo(
      result.shallowDepth,
      0.47424636969314016,
      1e-8,
    )

    closeTo(
      result.deepDepth,
      1.3358048814300463,
      1e-8,
    )
  },
)

test(
  'both alternate depths recover the same specific energy',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowRecoveredSpecificEnergy,
      input.specificEnergy,
      1e-9,
    )

    closeTo(
      result.deepRecoveredSpecificEnergy,
      input.specificEnergy,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.shallowEnergyResidual,
      ) <=
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.deepEnergyResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'shallow root is supercritical and deep root is subcritical',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowFroudeNumber,
      2.1569459510893267,
      1e-7,
    )

    closeTo(
      result.deepFroudeNumber,
      0.3668828796567548,
      1e-7,
    )

    assert.ok(
      result.shallowFroudeNumber >
      1,
    )

    assert.ok(
      result.deepFroudeNumber <
      1,
    )
  },
)

test(
  'calculates trapezoidal alternate-depth geometry',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowFlowArea,
      1.1734023585534028,
      1e-8,
    )

    closeTo(
      result.deepFlowArea,
      4.455984444112432,
      1e-8,
    )

    closeTo(
      result.shallowVelocity,
      4.261112962278442,
      1e-7,
    )

    closeTo(
      result.deepVelocity,
      1.1220865024801334,
      1e-7,
    )
  },
)

test(
  'reports alternate-depth ratio',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.alternateDepthRatio,
      2.8166897351146307,
      1e-7,
    )
  },
)

test(
  'higher specific energy separates alternate depths further',
  () => {
    const base =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    const higher =
      calculateTrapezoidalChannelAlternateDepth({
        ...input,

        specificEnergy:
          1.8,
      })

    assert.ok(
      higher.shallowDepth <
      base.shallowDepth,
    )

    assert.ok(
      higher.deepDepth >
      base.deepDepth,
    )

    assert.ok(
      higher.alternateDepthRatio >
      base.alternateDepthRatio,
    )
  },
)

test(
  'rectangular limit remains valid at zero side slope',
  () => {
    const width =
      2

    const flow =
      4

    const energy =
      1.5

    const result =
      calculateTrapezoidalChannelAlternateDepth({
        bottomWidth:
          width,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          flow,

        specificEnergy:
          energy,

        fluidDensity:
          998,
      })

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

    closeTo(
      result.criticalDepth,
      criticalDepth,
      1e-9,
    )

    assert.ok(
      result.shallowDepth <
      criticalDepth,
    )

    assert.ok(
      result.deepDepth >
      criticalDepth,
    )
  },
)

test(
  'alternate energy states have different momentum functions',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowMomentumFunction,
      2.4330267957830145,
      1e-7,
    )

    closeTo(
      result.deepMomentumFunction,
      3.1510050505627047,
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.momentumFunctionDifference,
      ) >
      0,
    )
  },
)

test(
  'density changes mass flow but not alternate depths',
  () => {
    const base =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    const denser =
      calculateTrapezoidalChannelAlternateDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.shallowDepth,
      base.shallowDepth,
      1e-9,
    )

    closeTo(
      denser.deepDepth,
      base.deepDepth,
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
  'rejects specific energy at or below critical minimum',
  () => {
    const reference =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    assert.throws(
      () =>
        calculateTrapezoidalChannelAlternateDepth({
          ...input,

          specificEnergy:
            reference.minimumSpecificEnergy,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelAlternateDepthError &&
        error.code ===
          'INSUFFICIENT_SPECIFIC_ENERGY',
    )
  },
)

test(
  'rejects negative side slope',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalChannelAlternateDepth({
          ...input,

          sideSlopeHorizontalPerVertical:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalChannelAlternateDepthError &&
        error.code ===
          'INVALID_SIDE_SLOPE',
    )
  },
)

test(
  'exports trapezoidal alternate-depth results as CSV',
  () => {
    const result =
      calculateTrapezoidalChannelAlternateDepth(
        input,
      )

    const csv =
      createTrapezoidalChannelAlternateDepthCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Shallow alternate depth/,
    )

    assert.match(
      csv,
      /Deep alternate depth/,
    )

    assert.match(
      csv,
      /Momentum function difference/,
    )
  },
)
