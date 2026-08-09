import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MaximumSuctionFlowRateNpshMarginError,
  calculateMaximumSuctionFlowRateNpshMargin,
  createMaximumSuctionFlowRateNpshMarginCsv,
} from '../../src/features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/engine.ts'

import {
  calculateNpshAvailableCavitationMargin,
} from '../../src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts'

const CALCULATOR_ID =
  'maximumSuctionFlowRateNpshMargin'

const baseInput = {
  suctionPipeDiameter: 0.10,
  suctionPipeLength: 5,

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
  'solves maximum suction flow rate for required NPSH margin',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'maximumSuctionFlowRateNpshMargin',
    )

    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const result =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin,
      })

    closeTo(
      result.maximumVolumetricFlowRate,
      0.01,
      1e-9,
    )

    closeTo(
      result.npshMargin,
      reference.npshMargin,
      1e-9,
    )

    assert.equal(
      result.iterationCount,
      100,
    )
  },
)

test(
  'reuses Calculator 405 at solved maximum flow',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const result =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin - 0.5,
      })

    const direct =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,

        volumetricFlowRate:
          result.maximumVolumetricFlowRate,
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
  'higher required margin reduces maximum flow',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const lowerMargin =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin - 1,
      })

    const higherMargin =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin,
      })

    assert.ok(
      lowerMargin.maximumVolumetricFlowRate >
      higherMargin.maximumVolumetricFlowRate,
    )
  },
)

test(
  'larger suction diameter permits more flow',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const original =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin,
      })

    const largerPipe =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        suctionPipeDiameter: 0.12,
        targetNpshMargin:
          reference.npshMargin,
      })

    assert.ok(
      largerPipe.maximumVolumetricFlowRate >
      original.maximumVolumetricFlowRate,
    )
  },
)

test(
  'longer suction line reduces maximum flow',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const original =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        targetNpshMargin:
          reference.npshMargin,
      })

    const longerPipe =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,
        suctionPipeLength: 10,
        targetNpshMargin:
          reference.npshMargin,
      })

    assert.ok(
      longerPipe.maximumVolumetricFlowRate <
      original.maximumVolumetricFlowRate,
    )
  },
)

test(
  'rejects impossible target margin',
  () => {
    const nearZero =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate:
          1e-12,
      })

    assert.throws(
      () =>
        calculateMaximumSuctionFlowRateNpshMargin({
          ...baseInput,

          targetNpshMargin:
            nearZero.npshMargin + 1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumSuctionFlowRateNpshMarginError &&
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
        calculateMaximumSuctionFlowRateNpshMargin({
          ...baseInput,

          targetNpshMargin:
            -1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          MaximumSuctionFlowRateNpshMarginError &&
        error.code ===
          'INVALID_TARGET_NPSH_MARGIN',
    )
  },
)

test(
  'exports maximum suction-flow result as CSV',
  () => {
    const reference =
      calculateNpshAvailableCavitationMargin({
        ...baseInput,
        volumetricFlowRate: 0.01,
      })

    const result =
      calculateMaximumSuctionFlowRateNpshMargin({
        ...baseInput,

        targetNpshMargin:
          reference.npshMargin,
      })

    const csv =
      createMaximumSuctionFlowRateNpshMarginCsv(
        {
          ...baseInput,

          targetNpshMargin:
            reference.npshMargin,
        },
        result,
      )

    assert.match(
      csv,
      /Maximum volumetric flow rate/,
    )

    assert.match(
      csv,
      /Target NPSH margin/,
    )

    assert.match(
      csv,
      /Zero-flow NPSH margin/,
    )
  },
)
