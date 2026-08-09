import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MinimumSuctionPipeDiameterNpshMarginError,
  calculateMinimumSuctionPipeDiameterNpshMargin,
  createMinimumSuctionPipeDiameterNpshMarginCsv,
} from '../../src/features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/engine.ts'

import {
  calculateNpshAvailableCavitationMargin,
} from '../../src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts'

const CALCULATOR_ID =
  'minimumSuctionPipeDiameterNpshMargin'

const input = {
  volumetricFlowRate: 0.01,
  suctionPipeLength: 5,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,
  suctionMinorLossCoefficient: 3,

  liquidSurfaceAbsolutePressure: 101325,
  vaporPressure: 3167,

  staticLiquidLevelAbovePump: 2,

  requiredNpsh: 3,

  targetNpshMargin: 8.8,
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
  'solves minimum suction-pipe diameter for required NPSH margin',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'minimumSuctionPipeDiameterNpshMargin',
    )

    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin(
        input,
      )

    closeTo(
      result.requiredSuctionPipeDiameter,
      0.1087866439167021,
      1e-10,
    )

    closeTo(
      result.requiredSuctionPipeDiameterMillimeters,
      108.7866439167021,
      1e-7,
    )

    closeTo(
      result.npshMargin,
      8.8,
      1e-10,
    )

    closeTo(
      result.availableNpsh,
      11.8,
      1e-10,
    )

    assert.equal(
      result.iterationCount,
      100,
    )
  },
)

test(
  'reuses Calculator 405 at solved suction diameter',
  () => {
    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin(
        input,
      )

    const direct =
      calculateNpshAvailableCavitationMargin({
        ...input,

        suctionPipeDiameter:
          result.requiredSuctionPipeDiameter,
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
  'returns expected hydraulic state at solved diameter',
  () => {
    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin(
        input,
      )

    closeTo(
      result.velocity,
      1.0758679269233808,
      1e-10,
    )

    closeTo(
      result.reynoldsNumber,
      116805.98094547908,
      1e-6,
    )

    closeTo(
      result.frictionFactor,
      0.019297025556864023,
      1e-12,
    )

    closeTo(
      result.suctionLineHeadLoss,
      0.22938918171217443,
      1e-10,
    )
  },
)

test(
  'higher required NPSH margin requires a larger suction pipe',
  () => {
    const lowerTarget =
      calculateMinimumSuctionPipeDiameterNpshMargin({
        ...input,

        targetNpshMargin:
          8.5,
      })

    const higherTarget =
      calculateMinimumSuctionPipeDiameterNpshMargin({
        ...input,

        targetNpshMargin:
          8.8,
      })

    closeTo(
      lowerTarget.requiredSuctionPipeDiameter,
      0.08933222868414278,
      1e-10,
    )

    assert.ok(
      higherTarget.requiredSuctionPipeDiameter >
      lowerTarget.requiredSuctionPipeDiameter,
    )
  },
)

test(
  'higher flow rate requires larger suction diameter',
  () => {
    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin({
        ...input,

        volumetricFlowRate:
          0.015,
      })

    closeTo(
      result.requiredSuctionPipeDiameter,
      0.13160682090310322,
      1e-10,
    )

    assert.ok(
      result.requiredSuctionPipeDiameter >
      0.1087866439167021,
    )
  },
)

test(
  'longer suction line requires larger diameter',
  () => {
    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin({
        ...input,

        suctionPipeLength:
          10,
      })

    closeTo(
      result.requiredSuctionPipeDiameter,
      0.11404567442899687,
      1e-10,
    )
  },
)

test(
  'rejects unreachable NPSH target margin',
  () => {
    assert.throws(
      () =>
        calculateMinimumSuctionPipeDiameterNpshMargin({
          ...input,

          targetNpshMargin:
            9.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MinimumSuctionPipeDiameterNpshMarginError &&
        error.code ===
          'TARGET_NOT_ACHIEVABLE',
    )
  },
)

test(
  'rejects negative target margin',
  () => {
    assert.throws(
      () =>
        calculateMinimumSuctionPipeDiameterNpshMargin({
          ...input,

          targetNpshMargin:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MinimumSuctionPipeDiameterNpshMarginError &&
        error.code ===
          'INVALID_TARGET_NPSH_MARGIN',
    )
  },
)

test(
  'exports inverse NPSH design as CSV',
  () => {
    const result =
      calculateMinimumSuctionPipeDiameterNpshMargin(
        input,
      )

    const csv =
      createMinimumSuctionPipeDiameterNpshMarginCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Required suction-pipe diameter/,
    )

    assert.match(
      csv,
      /Target NPSH margin/,
    )

    assert.match(
      csv,
      /Suction-line head loss/,
    )
  },
)
