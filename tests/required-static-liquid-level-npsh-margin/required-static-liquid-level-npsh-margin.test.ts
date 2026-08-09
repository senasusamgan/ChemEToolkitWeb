import assert from 'node:assert/strict'
import test from 'node:test'

import {
  RequiredStaticLiquidLevelNpshMarginError,
  calculateRequiredStaticLiquidLevelNpshMargin,
  createRequiredStaticLiquidLevelNpshMarginCsv,
} from '../../src/features/fluid-mechanics/required-static-liquid-level-npsh-margin/engine.ts'

import {
  calculateNpshAvailableCavitationMargin,
} from '../../src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts'

const CALCULATOR_ID =
  'requiredStaticLiquidLevelNpshMargin'

const input = {
  suctionPipeDiameter: 0.10,
  volumetricFlowRate: 0.01,
  suctionPipeLength: 5,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,
  suctionMinorLossCoefficient: 3,

  liquidSurfaceAbsolutePressure: 101325,
  vaporPressure: 3167,

  requiredNpsh: 3,

  targetNpshMargin: 2,
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
  'solves required static level and maximum suction lift',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'requiredStaticLiquidLevelNpshMargin',
    )

    const result =
      calculateRequiredStaticLiquidLevelNpshMargin(
        input,
      )

    closeTo(
      result.zeroLevelNpshMargin,
      6.701803139072776,
      1e-12,
    )

    closeTo(
      result.requiredStaticLiquidLevelAbovePump,
      -4.701803139072776,
      1e-12,
    )

    closeTo(
      result.maximumSuctionLift,
      4.701803139072776,
      1e-12,
    )

    closeTo(
      result.minimumFloodedSuctionHead,
      0,
      1e-12,
    )

    closeTo(
      result.npshMargin,
      2,
      1e-12,
    )

    closeTo(
      result.availableNpsh,
      5,
      1e-12,
    )

    assert.equal(
      result.requiredSuctionConfiguration,
      'suction-lift',
    )
  },
)

test(
  'reuses Calculator 405 at solved static level',
  () => {
    const result =
      calculateRequiredStaticLiquidLevelNpshMargin(
        input,
      )

    const direct =
      calculateNpshAvailableCavitationMargin({
        suctionPipeDiameter:
          input.suctionPipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        suctionPipeLength:
          input.suctionPipeLength,

        fluidDensity:
          input.fluidDensity,

        dynamicViscosity:
          input.dynamicViscosity,

        absoluteRoughness:
          input.absoluteRoughness,

        suctionMinorLossCoefficient:
          input.suctionMinorLossCoefficient,

        liquidSurfaceAbsolutePressure:
          input.liquidSurfaceAbsolutePressure,

        vaporPressure:
          input.vaporPressure,

        staticLiquidLevelAbovePump:
          result.requiredStaticLiquidLevelAbovePump,

        requiredNpsh:
          input.requiredNpsh,
      })

    closeTo(
      result.availableNpsh,
      direct.availableNpsh,
      1e-12,
    )

    closeTo(
      result.npshMargin,
      direct.npshMargin,
      1e-12,
    )

    closeTo(
      result.suctionLineHeadLoss,
      direct.suctionLineHeadLoss,
      1e-12,
    )
  },
)

test(
  'returns flooded suction when target margin is high',
  () => {
    const result =
      calculateRequiredStaticLiquidLevelNpshMargin({
        ...input,

        targetNpshMargin:
          8.8,
      })

    closeTo(
      result.requiredStaticLiquidLevelAbovePump,
      2.0981968609272243,
      1e-12,
    )

    closeTo(
      result.minimumFloodedSuctionHead,
      2.0981968609272243,
      1e-12,
    )

    closeTo(
      result.maximumSuctionLift,
      0,
      1e-12,
    )

    assert.equal(
      result.requiredSuctionConfiguration,
      'flooded-suction',
    )
  },
)

test(
  'higher target margin reduces allowable suction lift',
  () => {
    const lowerTarget =
      calculateRequiredStaticLiquidLevelNpshMargin({
        ...input,

        targetNpshMargin:
          1,
      })

    const higherTarget =
      calculateRequiredStaticLiquidLevelNpshMargin({
        ...input,

        targetNpshMargin:
          3,
      })

    closeTo(
      lowerTarget.maximumSuctionLift,
      5.701803139072776,
      1e-12,
    )

    closeTo(
      higherTarget.maximumSuctionLift,
      3.701803139072776,
      1e-12,
    )

    assert.ok(
      higherTarget.maximumSuctionLift <
      lowerTarget.maximumSuctionLift,
    )
  },
)

test(
  'higher flow rate reduces allowable suction lift',
  () => {
    const base =
      calculateRequiredStaticLiquidLevelNpshMargin(
        input,
      )

    const higherFlow =
      calculateRequiredStaticLiquidLevelNpshMargin({
        ...input,

        volumetricFlowRate:
          0.02,
      })

    closeTo(
      higherFlow.maximumSuctionLift,
      3.7399952567982515,
      1e-12,
    )

    assert.ok(
      higherFlow.maximumSuctionLift <
      base.maximumSuctionLift,
    )
  },
)

test(
  'zero target margin returns cavitation boundary static level',
  () => {
    const result =
      calculateRequiredStaticLiquidLevelNpshMargin({
        ...input,

        targetNpshMargin:
          0,
      })

    closeTo(
      result.maximumSuctionLift,
      6.701803139072776,
      1e-12,
    )

    closeTo(
      result.npshMargin,
      0,
      1e-12,
    )
  },
)

test(
  'rejects negative target margin',
  () => {
    assert.throws(
      () =>
        calculateRequiredStaticLiquidLevelNpshMargin({
          ...input,

          targetNpshMargin:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          RequiredStaticLiquidLevelNpshMarginError &&
        error.code ===
          'INVALID_TARGET_NPSH_MARGIN',
    )
  },
)

test(
  'exports static-level design as CSV',
  () => {
    const result =
      calculateRequiredStaticLiquidLevelNpshMargin(
        input,
      )

    const csv =
      createRequiredStaticLiquidLevelNpshMarginCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required static liquid level above pump/,
    )

    assert.match(
      csv,
      /Maximum suction lift/,
    )

    assert.match(
      csv,
      /Target NPSH margin/,
    )
  },
)
