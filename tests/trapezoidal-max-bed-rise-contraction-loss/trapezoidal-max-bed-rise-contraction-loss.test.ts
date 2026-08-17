import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumBedRiseContractionLossError,
  calculateTrapezoidalMaximumBedRiseContractionLoss,
  createTrapezoidalMaximumBedRiseContractionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumBedRiseContractionLoss'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
    1.2,

  transitionLossCoefficient:
    0.1,

  fluidDensity:
    998,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-8,
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
  'calculates maximum allowable bed rise before loss-adjusted choking',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumBedRiseContractionLoss',
    )

    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    assert.equal(
      result.bedRiseStatus,
      'Positive bed-rise allowance before choking',
    )

    closeTo(
      result.maximumAllowableBedRise,
      0.1720332372339597,
      1e-8,
    )

    closeTo(
      result.signedBedElevationAllowance,
      result.maximumAllowableBedRise,
      1e-12,
    )

    closeTo(
      result.requiredBedLowering,
      0,
      1e-12,
    )
  },
)

test(
  'reports upstream and loss-adjusted control energies',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.minimumRequiredThroatEnergy,
      1.0781464863355166,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7751817116295476,
      1e-8,
    )
  },
)

test(
  'loss-adjusted control Froude matches analytical condition',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-9,
    )

    closeTo(
      result.theoreticalControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-12,
    )

    assert.ok(
      Math.abs(
        result.controlConditionResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'crest rise closes the complete energy equation',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    assert.ok(
      Math.abs(
        result.exactThresholdEnergyResidual,
      ) <=
      1e-9,
    )

    closeTo(
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.9472149488635073,
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.2527850511364926,
      1e-8,
    )
  },
)

test(
  'reports transition-loss and bed-rise power terms',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    closeTo(
      result.transitionLossHeadAtThreshold,
      Number('0.027542252245997196'),
      1e-9,
    )

    closeTo(
      result.transitionLossDissipationPower,
      1347.78516766116,
      1e-5,
    )

    closeTo(
      result.maximumBedRisePotentialPower,
      8418.478032142848,
      1e-5,
    )
  },
)

test(
  'zero transition loss increases the allowable bed rise',
  () => {
    const zeroLoss =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    closeTo(
      zeroLoss.maximumAllowableBedRise,
      0.20057012371728478,
      1e-8,
    )

    closeTo(
      zeroLoss.transitionLossHeadAtThreshold,
      0,
      1e-12,
    )

    closeTo(
      zeroLoss.lossAdjustedControlFroudeNumber,
      1,
      1e-9,
    )
  },
)

test(
  'larger transition loss reduces allowable bed rise',
  () => {
    const base =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        ...input,

        transitionLossCoefficient:
          0.2,
      })

    assert.ok(
      largerLoss.maximumAllowableBedRise <
      base.maximumAllowableBedRise,
    )

    closeTo(
      largerLoss.maximumAllowableBedRise,
      0.145386062115469,
      1e-8,
    )
  },
)

test(
  'already choked contraction reports required bed lowering',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        ...input,

        contractedBottomWidth:
          1,
      })

    assert.equal(
      result.bedRiseStatus,
      'Already choked — bed lowering required',
    )

    closeTo(
      result.maximumAllowableBedRise,
      0,
      1e-12,
    )

    closeTo(
      result.requiredBedLowering,
      0.10001089970456989,
      1e-8,
    )

    assert.ok(
      result.signedBedElevationAllowance <
      0,
    )
  },
)

test(
  'density changes power but not hydraulic bed-rise allowance',
  () => {
    const base =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.maximumAllowableBedRise,
      base.maximumAllowableBedRise,
      1e-10,
    )

    closeTo(
      denser.lossAdjustedControlDepth,
      base.lossAdjustedControlDepth,
      1e-10,
    )

    closeTo(
      denser.transitionLossDissipationPower /
      base.transitionLossDissipationPower,
      2,
      1e-12,
    )

    closeTo(
      denser.maximumBedRisePotentialPower /
      base.maximumBedRisePotentialPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects negative transition-loss coefficient',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumBedRiseContractionLoss({
          ...input,

          transitionLossCoefficient:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumBedRiseContractionLossError &&
        error.code ===
          'INVALID_LOSS_COEFFICIENT',
    )
  },
)

test(
  'rejects contracted width equal to upstream width',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumBedRiseContractionLoss({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumBedRiseContractionLossError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports maximum bed-rise contraction-loss analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumBedRiseContractionLoss(
        input,
      )

    const csv =
      createTrapezoidalMaximumBedRiseContractionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum allowable bed rise/,
    )

    assert.match(
      csv,
      /Required bed lowering/,
    )

    assert.match(
      csv,
      /Transition-loss dissipation power/,
    )

    assert.match(
      csv,
      /Exact threshold energy residual/,
    )
  },
)
