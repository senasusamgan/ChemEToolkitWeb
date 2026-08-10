import assert from 'node:assert/strict'
import test from 'node:test'

import {
  RectangularChannelAlternateDepthError,
  calculateRectangularChannelAlternateDepth,
  createRectangularChannelAlternateDepthCsv,
} from '../../src/features/fluid-mechanics/rectangular-channel-alternate-depth/engine.ts'

const CALCULATOR_ID =
  'rectangularChannelAlternateDepth'

const input = {
  channelWidth:
    2,

  volumetricFlowRate:
    4,

  specificEnergy:
    1.5,

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
  'solves both rectangular-channel alternate depths',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'rectangularChannelAlternateDepth',
    )

    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowDepth,
      0.43827746672419726,
      1e-9,
    )

    closeTo(
      result.deepDepth,
      1.3952354602972001,
      1e-9,
    )

    closeTo(
      result.alternateDepthRatio,
      3.1834524159445436,
      1e-8,
    )
  },
)

test(
  'calculates rectangular critical depth and minimum energy',
  () => {
    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    closeTo(
      result.criticalDepth,
      0.741617162882209,
      1e-12,
    )

    closeTo(
      result.minimumSpecificEnergy,
      1.1124257443233136,
      1e-12,
    )

    closeTo(
      result.energyAboveMinimum,
      input.specificEnergy -
      result.minimumSpecificEnergy,
      1e-14,
    )
  },
)

test(
  'alternate depths reproduce identical specific energy',
  () => {
    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    closeTo(
      result.shallowRecoveredSpecificEnergy,
      input.specificEnergy,
      1e-10,
    )

    closeTo(
      result.deepRecoveredSpecificEnergy,
      input.specificEnergy,
      1e-10,
    )

    closeTo(
      result.shallowEnergyResidual,
      0,
      1e-10,
    )

    closeTo(
      result.deepEnergyResidual,
      0,
      1e-10,
    )
  },
)

test(
  'shallow root is supercritical and deep root is subcritical',
  () => {
    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    assert.ok(
      result.shallowDepth <
      result.criticalDepth,
    )

    assert.ok(
      result.deepDepth >
      result.criticalDepth,
    )

    assert.ok(
      result.shallowFroudeNumber >
      1,
    )

    assert.ok(
      result.deepFroudeNumber <
      1,
    )

    closeTo(
      result.shallowFroudeNumber,
      2.201131271065503,
      1e-8,
    )

    closeTo(
      result.deepFroudeNumber,
      0.38752381748883113,
      1e-8,
    )
  },
)

test(
  'higher specific energy separates the alternate depths further',
  () => {
    const base =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    const higherEnergy =
      calculateRectangularChannelAlternateDepth({
        ...input,

        specificEnergy:
          2,
      })

    assert.ok(
      higherEnergy.shallowDepth <
      base.shallowDepth,
    )

    assert.ok(
      higherEnergy.deepDepth >
      base.deepDepth,
    )

    assert.ok(
      higherEnergy.alternateDepthRatio >
      base.alternateDepthRatio,
    )
  },
)

test(
  'greater channel width lowers critical depth for fixed total flow',
  () => {
    const base =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    const wider =
      calculateRectangularChannelAlternateDepth({
        ...input,

        channelWidth:
          3,
      })

    assert.ok(
      wider.criticalDepth <
      base.criticalDepth,
    )
  },
)

test(
  'density changes mass flow but not alternate depths',
  () => {
    const base =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    const denser =
      calculateRectangularChannelAlternateDepth({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.shallowDepth,
      base.shallowDepth,
      1e-10,
    )

    closeTo(
      denser.deepDepth,
      base.deepDepth,
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
  'momentum functions remain finite but differ for alternate-energy states',
  () => {
    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    assert.ok(
      Number.isFinite(
        result.shallowMomentumFunction,
      ),
    )

    assert.ok(
      Number.isFinite(
        result.deepMomentumFunction,
      ),
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
  'rejects energy below the minimum critical specific energy',
  () => {
    const unitDischarge =
      input.volumetricFlowRate /
      input.channelWidth

    const criticalDepth =
      (
        unitDischarge *
        unitDischarge /
        9.80665
      ) **
      (
        1 / 3
      )

    const minimumEnergy =
      1.5 *
      criticalDepth

    assert.throws(
      () =>
        calculateRectangularChannelAlternateDepth({
          ...input,

          specificEnergy:
            minimumEnergy *
            0.99,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          RectangularChannelAlternateDepthError &&
        error.code ===
          'INSUFFICIENT_SPECIFIC_ENERGY',
    )
  },
)

test(
  'rejects exactly critical minimum energy because alternate roots collapse',
  () => {
    const unitDischarge =
      input.volumetricFlowRate /
      input.channelWidth

    const criticalDepth =
      (
        unitDischarge *
        unitDischarge /
        9.80665
      ) **
      (
        1 / 3
      )

    const minimumEnergy =
      1.5 *
      criticalDepth

    assert.throws(
      () =>
        calculateRectangularChannelAlternateDepth({
          ...input,

          specificEnergy:
            minimumEnergy,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          RectangularChannelAlternateDepthError &&
        error.code ===
          'INSUFFICIENT_SPECIFIC_ENERGY',
    )
  },
)

test(
  'exports alternate-depth results as CSV',
  () => {
    const result =
      calculateRectangularChannelAlternateDepth(
        input,
      )

    const csv =
      createRectangularChannelAlternateDepthCsv(
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
