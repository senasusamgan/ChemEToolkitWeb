import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalContractionTransitionLossError,
  calculateTrapezoidalContractionTransitionLoss,
  createTrapezoidalContractionTransitionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-contraction-transition-loss/engine.ts'

import {
  calculateTrapezoidalContractionThroatAnalysis,
} from '../../src/features/fluid-mechanics/trapezoidal-contraction-throat-analysis/engine.ts'

const CALCULATOR_ID =
  'trapezoidalContractionTransitionLoss'

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
  'analyzes an unchoked trapezoidal contraction with transition loss',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalContractionTransitionLoss',
    )

    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    assert.equal(
      result.throatStatus,
      'Unchoked with transition loss — two depth roots available',
    )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.availableSpecificEnergyMargin,
      0.1720332372339597,
      1e-8,
    )
  },
)

test(
  'solves the loss-adjusted minimum-energy control state',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7751817116295476,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.3242083727076115,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.9534625892455922,
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
  'solves the physical subcritical throat root including transition loss',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    closeTo(
      result.subcriticalThroatDepth!,
      1.1410228297711078,
      1e-8,
    )

    closeTo(
      result.subcriticalThroatVelocity!,
      1.395097554469526,
      1e-8,
    )

    closeTo(
      result.subcriticalThroatFroudeNumber!,
      0.48695314279132984,
      1e-8,
    )

    closeTo(
      result.subcriticalTransitionLossHead!,
      0.009923353981669849,
      1e-10,
    )
  },
)

test(
  'solves the alternate supercritical throat root including transition loss',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    closeTo(
      result.supercriticalAlternateDepth!,
      0.5560304119049011,
      1e-8,
    )

    closeTo(
      result.supercriticalAlternateVelocity!,
      3.518077818984113,
      1e-8,
    )

    closeTo(
      result.supercriticalAlternateFroudeNumber!,
      1.6624050934573888,
      1e-8,
    )

    closeTo(
      result.supercriticalTransitionLossHead!,
      0.06310448287859775,
      1e-9,
    )
  },
)

test(
  'both loss-adjusted depth roots close the upstream energy equation',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    assert.ok(
      Math.abs(
        result.subcriticalEnergyResidual!,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.alternateEnergyResidual!,
      ) <=
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChange!,
      -0.05897717022889215,
      1e-8,
    )
  },
)

test(
  'transition loss widens the minimum safe contraction throat',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    closeTo(
      result.losslessMinimumContractedBottomWidth,
      1.215361679294872,
      5e-8,
    )

    closeTo(
      result.lossAdjustedMinimumContractedBottomWidth,
      1.3198285614992558,
      5e-8,
    )

    closeTo(
      result.lossPenaltyWidth,
      0.10446688220438372,
      5e-8,
    )

    closeTo(
      result.remainingWidthMargin,
      0.6801714385007442,
      5e-8,
    )
  },
)

test(
  'zero transition-loss coefficient recovers Calculator 440',
  () => {
    const zeroLoss =
      calculateTrapezoidalContractionTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    const lossless =
      calculateTrapezoidalContractionThroatAnalysis({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        contractedBottomWidth:
          input.contractedBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        upstreamFlowDepth:
          input.upstreamFlowDepth,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      zeroLoss.lossAdjustedMinimumContractedBottomWidth,
      lossless.minimumContractedBottomWidth,
      1e-7,
    )

    closeTo(
      zeroLoss.subcriticalThroatDepth!,
      lossless.subcriticalThroatDepth!,
      1e-7,
    )

    closeTo(
      zeroLoss.supercriticalAlternateDepth!,
      lossless.supercriticalAlternateDepth!,
      1e-7,
    )

    closeTo(
      zeroLoss.lossAdjustedControlFroudeNumber,
      1,
      1e-9,
    )
  },
)

test(
  'larger transition-loss coefficient requires a wider minimum throat',
  () => {
    const base =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalContractionTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0.2,
      })

    assert.ok(
      largerLoss.lossAdjustedMinimumContractedBottomWidth >
      base.lossAdjustedMinimumContractedBottomWidth,
    )

    closeTo(
      largerLoss.lossAdjustedMinimumContractedBottomWidth,
      1.4194957706196107,
      1e-7,
    )
  },
)

test(
  'width below the loss-adjusted limit is reported as choked',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss({
        ...input,

        contractedBottomWidth:
          1,
      })

    assert.equal(
      result.throatStatus,
      'Choked with transition loss — upstream adjustment required',
    )

    assert.equal(
      result.subcriticalThroatDepth,
      null,
    )

    assert.equal(
      result.supercriticalAlternateDepth,
      null,
    )

    closeTo(
      result.additionalSpecificEnergyRequired,
      0.10001089970456989,
      1e-8,
    )
  },
)

test(
  'width equal to loss-adjusted limit reaches the threshold',
  () => {
    const base =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    const threshold =
      calculateTrapezoidalContractionTransitionLoss({
        ...input,

        contractedBottomWidth:
          base.lossAdjustedMinimumContractedBottomWidth,
      })

    assert.equal(
      threshold.throatStatus,
      'Loss-adjusted choking threshold',
    )

    closeTo(
      threshold.subcriticalThroatDepth!,
      threshold.lossAdjustedControlDepth,
      1e-7,
    )

    closeTo(
      threshold.subcriticalThroatFroudeNumber!,
      threshold.theoreticalControlFroudeNumber,
      1e-7,
    )
  },
)

test(
  'density changes mass flow but not loss-adjusted hydraulics',
  () => {
    const base =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalContractionTransitionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.subcriticalThroatDepth!,
      base.subcriticalThroatDepth!,
      1e-8,
    )

    closeTo(
      denser.lossAdjustedMinimumContractedBottomWidth,
      base.lossAdjustedMinimumContractedBottomWidth,
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
  'rejects negative transition-loss coefficient',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalContractionTransitionLoss({
          ...input,

          transitionLossCoefficient:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalContractionTransitionLossError &&
        error.code ===
          'INVALID_LOSS_COEFFICIENT',
    )
  },
)

test(
  'exports transition-loss contraction analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalContractionTransitionLoss(
        input,
      )

    const csv =
      createTrapezoidalContractionTransitionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Loss-adjusted minimum contracted width/,
    )

    assert.match(
      csv,
      /Loss penalty width/,
    )

    assert.match(
      csv,
      /Subcritical transition-loss head/,
    )

    assert.match(
      csv,
      /Control-condition residual/,
    )
  },
)
