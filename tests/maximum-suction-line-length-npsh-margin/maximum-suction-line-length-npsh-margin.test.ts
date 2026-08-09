import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MaximumSuctionLineLengthNpshMarginError,
  calculateMaximumSuctionLineLengthNpshMargin,
  createMaximumSuctionLineLengthNpshMarginCsv,
} from '../../src/features/fluid-mechanics/maximum-suction-line-length-npsh-margin/engine.ts'

import {
  calculateNpshAvailableCavitationMargin,
} from '../../src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts'

const CALCULATOR_ID =
  'maximumSuctionLineLengthNpshMargin'

const baseInput = {
  suctionPipeDiameter: 0.10,
  volumetricFlowRate: 0.01,

  fluidDensity: 998,
  dynamicViscosity: 0.001,

  absoluteRoughness: 0.000045,
  suctionMinorLossCoefficient: 3,

  liquidSurfaceAbsolutePressure: 101325,
  vaporPressure: 3167,

  staticLiquidLevelAbovePump: 2,

  requiredNpsh: 3,
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
  'recovers a known five-meter Calculator 405 suction line',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'maximumSuctionLineLengthNpshMargin',
    )

    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const result =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin,
      })

    closeTo(
      result.maximumSuctionPipeLength,
      5,
      1e-9,
    )

    closeTo(
      result.npshMargin,
      reference.npshMargin,
      1e-9,
    )
  },
)

test(
  'reuses Calculator 405 at solved maximum suction length',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const result =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin - 0.5,
      })

    const direct =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          result.maximumSuctionPipeLength,
      })

    closeTo(
      result.availableNpsh,
      direct.availableNpsh,
      1e-10,
    )

    closeTo(
      result.npshMargin,
      direct.npshMargin,
      1e-10,
    )

    closeTo(
      result.suctionLineHeadLoss,
      direct.suctionLineHeadLoss,
      1e-10,
    )
  },
)

test(
  'lower required margin permits a longer suction line',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const strict =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin,
      })

    const relaxed =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin - 0.5,
      })

    assert.ok(
      relaxed.maximumSuctionPipeLength >
      strict.maximumSuctionPipeLength,
    )
  },
)

test(
  'higher required margin shortens allowable suction line',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const result =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin + 0.05,
      })

    assert.ok(
      result.maximumSuctionPipeLength <
      5,
    )

    assert.ok(
      result.maximumSuctionPipeLength >
      0,
    )
  },
)

test(
  'larger suction diameter permits a longer line',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const original =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin,
      })

    const largerDiameter =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        suctionPipeDiameter:
          0.12,

        targetNpshMargin:
          reference.npshMargin,
      })

    assert.ok(
      largerDiameter.maximumSuctionPipeLength >
      original.maximumSuctionPipeLength,
    )
  },
)

test(
  'higher suction flow reduces allowable line length',
  () => {
    const higherFlowReference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        volumetricFlowRate:
          0.015,

        suctionPipeLength:
          5,
      })

    const commonTargetMargin =
      higherFlowReference.npshMargin -
      0.1

    const original =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        targetNpshMargin:
          commonTargetMargin,
      })

    const higherFlow =
      calculateMaximumSuctionLineLengthNpshMargin({
        ...baseInput,

        volumetricFlowRate:
          0.015,

        targetNpshMargin:
          commonTargetMargin,
      })

    assert.ok(
      higherFlow.maximumSuctionPipeLength <
      original.maximumSuctionPipeLength,
    )

    assert.ok(
      higherFlow.maximumSuctionPipeLength >
      0,
    )
  },
)

test(
  'rejects an NPSH margin that leaves no positive line length',
  () => {
    const oneMeter =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          1,
      })

    const twoMeter =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          2,
      })

    const zeroLengthMargin =
      oneMeter.npshMargin +
      (
        oneMeter.npshMargin -
        twoMeter.npshMargin
      )

    assert.throws(
      () =>
        calculateMaximumSuctionLineLengthNpshMargin({
          ...baseInput,

          targetNpshMargin:
            zeroLengthMargin + 0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumSuctionLineLengthNpshMarginError &&
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
        calculateMaximumSuctionLineLengthNpshMargin({
          ...baseInput,

          targetNpshMargin:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumSuctionLineLengthNpshMarginError &&
        error.code ===
          'INVALID_TARGET_NPSH_MARGIN',
    )
  },
)

test(
  'exports maximum suction-line length as CSV',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        suctionPipeLength:
          5,
      })

    const input = {
      ...baseInput,

      targetNpshMargin:
        reference.npshMargin,
    }

    const result =
      calculateMaximumSuctionLineLengthNpshMargin(
        input,
      )

    const csv =
      createMaximumSuctionLineLengthNpshMarginCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum suction-line length/,
    )

    assert.match(
      csv,
      /Target NPSH margin/,
    )

    assert.match(
      csv,
      /Distributed head loss per unit length/,
    )
  },
)
