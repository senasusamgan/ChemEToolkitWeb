import assert from 'node:assert/strict'
import test from 'node:test'

import {
  NpshAvailableCavitationMarginError,
  PipeHydraulicsCoreError,
  calculateNpshAvailableCavitationMargin,
  calculatePipeHydraulicsState,
  createNpshAvailableCavitationMarginCsv,
} from '../../src/features/fluid-mechanics/npsh-available-cavitation-margin/engine.ts'

const CALCULATOR_ID =
  'npshAvailableCavitationMargin'

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
  'calculates NPSH available and cavitation margin',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'npshAvailableCavitationMargin',
    )

    const result =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    closeTo(
      result.availableNpsh,
      11.701803139072776,
      1e-12,
    )

    closeTo(
      result.npshMargin,
      8.701803139072776,
      1e-12,
    )

    closeTo(
      result.npshRatio,
      3.900601046357592,
      1e-12,
    )

    closeTo(
      result.npshMarginPercent,
      290.0601046357592,
      1e-10,
    )

    assert.equal(
      result.cavitationStatus,
      'adequate',
    )

    assert.equal(
      result.cavitationRisk,
      false,
    )
  },
)

test(
  'returns expected suction-line hydraulic state',
  () => {
    const result =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    closeTo(
      result.velocity,
      1.2732395447351625,
      1e-12,
    )

    closeTo(
      result.reynoldsNumber,
      127069.30656456923,
      1e-8,
    )

    closeTo(
      result.frictionFactor,
      0.019265794909922473,
      1e-14,
    )

    closeTo(
      result.suctionLineHeadLoss,
      0.3275860426393982,
      1e-12,
    )

    closeTo(
      result.totalPressureDrop,
      3206.096621719555,
      1e-9,
    )
  },
)

test(
  'reuses shared pipe-hydraulics core for suction losses',
  () => {
    const result =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    const direct =
      calculatePipeHydraulicsState({
        diameter:
          input.suctionPipeDiameter,

        volumetricFlowRate:
          input.volumetricFlowRate,

        pipeLength:
          input.suctionPipeLength,

        fluidDensity:
          input.fluidDensity,

        dynamicViscosity:
          input.dynamicViscosity,

        absoluteRoughness:
          input.absoluteRoughness,

        minorLossCoefficient:
          input.suctionMinorLossCoefficient,
      })

    closeTo(
      result.suctionLineHeadLoss,
      direct.totalHeadLoss,
      1e-12,
    )

    closeTo(
      result.totalPressureDrop,
      direct.totalPressureDrop,
      1e-9,
    )

    closeTo(
      result.frictionFactor,
      direct.frictionFactor,
      1e-14,
    )
  },
)

test(
  'higher suction flow reduces available NPSH',
  () => {
    const base =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    const highFlow =
      calculateNpshAvailableCavitationMargin({
        ...input,

        volumetricFlowRate:
          0.02,
      })

    closeTo(
      highFlow.availableNpsh,
      10.739995256798252,
      1e-12,
    )

    assert.ok(
      highFlow.availableNpsh <
      base.availableNpsh,
    )

    assert.ok(
      highFlow.suctionLineHeadLoss >
      base.suctionLineHeadLoss,
    )
  },
)

test(
  'lower vessel pressure can produce insufficient NPSH',
  () => {
    const result =
      calculateNpshAvailableCavitationMargin({
        ...input,

        liquidSurfaceAbsolutePressure:
          10000,
      })

    closeTo(
      result.availableNpsh,
      2.3705823825387764,
      1e-12,
    )

    closeTo(
      result.npshMargin,
      -0.6294176174612236,
      1e-12,
    )

    assert.equal(
      result.cavitationStatus,
      'insufficient',
    )

    assert.equal(
      result.cavitationRisk,
      true,
    )
  },
)

test(
  'higher liquid level increases NPSH available one-for-one',
  () => {
    const base =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    const elevated =
      calculateNpshAvailableCavitationMargin({
        ...input,

        staticLiquidLevelAbovePump:
          5,
      })

    closeTo(
      elevated.availableNpsh -
      base.availableNpsh,
      3,
      1e-12,
    )
  },
)

test(
  'rejects vapor pressure not below surface pressure',
  () => {
    assert.throws(
      () =>
        calculateNpshAvailableCavitationMargin({
          ...input,

          vaporPressure:
            101325,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          NpshAvailableCavitationMarginError &&
        error.code ===
          'VAPOR_PRESSURE_NOT_BELOW_SURFACE',
    )
  },
)

test(
  'rejects invalid required NPSH',
  () => {
    assert.throws(
      () =>
        calculateNpshAvailableCavitationMargin({
          ...input,

          requiredNpsh:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          NpshAvailableCavitationMarginError &&
        error.code ===
          'INVALID_REQUIRED_NPSH',
    )
  },
)

test(
  'rejects invalid shared hydraulic input',
  () => {
    assert.throws(
      () =>
        calculateNpshAvailableCavitationMargin({
          ...input,

          suctionPipeDiameter:
            0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PipeHydraulicsCoreError &&
        error.code ===
          'INVALID_DIAMETER',
    )
  },
)

test(
  'exports NPSH assessment as CSV',
  () => {
    const result =
      calculateNpshAvailableCavitationMargin(
        input,
      )

    const csv =
      createNpshAvailableCavitationMarginCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /NPSH available/,
    )

    assert.match(
      csv,
      /Suction line head loss/,
    )

    assert.match(
      csv,
      /Cavitation status/,
    )
  },
)
