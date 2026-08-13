import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMinimumWidthBedRiseTransitionLossError,
  calculateTrapezoidalMinimumWidthBedRiseTransitionLoss,
  createTrapezoidalMinimumWidthBedRiseTransitionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/engine.ts'

import {
  calculateTrapezoidalMaximumBedRiseContractionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMinimumWidthBedRiseTransitionLoss'

const input = {
  upstreamBottomWidth:
    3,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

  upstreamFlowDepth:
    1.2,

  specifiedBedRise:
    0.1,

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
  'calculates minimum contracted width for specified bed rise and transition loss',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMinimumWidthBedRiseTransitionLoss',
    )

    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.minimumContractedBottomWidth,
      1.6909441904114226,
      1e-7,
    )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.availableThroatSpecificEnergy,
      1.1501797235694762,
      1e-10,
    )
  },
)

test(
  'reports contraction geometry at the choking limit',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.maximumAllowableWidthReduction,
      1.3090558095885774,
      1e-7,
    )

    closeTo(
      result.maximumContractionPercent,
      43.63519365295258,
      1e-7,
    )

    closeTo(
      result.contractionRatioAtLimit,
      0.5636480634704742,
      1e-8,
    )
  },
)

test(
  'transition loss widens the required throat relative to lossless design',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.losslessMinimumContractedBottomWidth,
      1.5732763480713534,
      1e-7,
    )

    closeTo(
      result.transitionLossWidthPenalty,
      0.11766784234006922,
      1e-7,
    )

    assert.ok(
      result.minimumContractedBottomWidth >
      result.losslessMinimumContractedBottomWidth,
    )
  },
)

test(
  'solves the loss-adjusted minimum-energy throat control state',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.836069336180103,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFlowArea,
      2.112758521695518,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.3665742907464082,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-9,
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
  'specified bed rise closes the complete energy equation',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.1216242338068088,
      1e-8,
    )

    closeTo(
      result.transitionLossHeadAtThreshold,
      0.028555489762670562,
      1e-9,
    )

    closeTo(
      result.minimumRequiredThroatEnergy,
      1.1501797235694793,
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'Calculator 445 forward model recovers the specified maximum bed rise',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    const forward =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        contractedBottomWidth:
          result.minimumContractedBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        upstreamFlowDepth:
          input.upstreamFlowDepth,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      forward.maximumAllowableBedRise,
      input.specifiedBedRise,
      1e-7,
    )

    closeTo(
      forward.signedBedElevationAllowance,
      input.specifiedBedRise,
      1e-7,
    )
  },
)

test(
  'zero bed rise recovers Calculator 441 minimum-width requirement',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0,
      })

    closeTo(
      result.minimumContractedBottomWidth,
      1.3198285614992558,
      1e-7,
    )

    closeTo(
      result.availableThroatSpecificEnergy,
      result.upstreamSpecificEnergy,
      1e-12,
    )
  },
)

test(
  'larger bed rise requires a wider contracted section',
  () => {
    const base =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    const largerRise =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0.2,
      })

    assert.ok(
      largerRise.minimumContractedBottomWidth >
      base.minimumContractedBottomWidth,
    )

    closeTo(
      largerRise.minimumContractedBottomWidth,
      2.1315940105372837,
      1e-7,
    )
  },
)

test(
  'larger transition loss requires a wider contracted section',
  () => {
    const base =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0.2,
      })

    assert.ok(
      largerLoss.minimumContractedBottomWidth >
      base.minimumContractedBottomWidth,
    )

    closeTo(
      largerLoss.minimumContractedBottomWidth,
      1.8032536654593954,
      1e-7,
    )
  },
)

test(
  'reports threshold water-surface and power terms',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.936069336180103,
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.26393066381989694,
      1e-8,
    )

    closeTo(
      result.transitionLossDissipationPower,
      1397.368131468655,
      1e-5,
    )

    closeTo(
      result.bedRisePotentialPower,
      4893.51835,
      1e-5,
    )
  },
)

test(
  'rectangular-channel limiting case is reproduced',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        upstreamBottomWidth:
          3,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          4,

        upstreamFlowDepth:
          1.5,

        specifiedBedRise:
          0.1,

        transitionLossCoefficient:
          0.1,

        fluidDensity:
          998,
      })

    closeTo(
      result.minimumContractedBottomWidth,
      1.4238367224395332,
      1e-7,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.9601900566381025,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-9,
    )
  },
)

test(
  'density changes power but not minimum hydraulic width',
  () => {
    const base =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.minimumContractedBottomWidth,
      base.minimumContractedBottomWidth,
      1e-9,
    )

    closeTo(
      denser.lossAdjustedControlDepth,
      base.lossAdjustedControlDepth,
      1e-9,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.transitionLossDissipationPower /
      base.transitionLossDissipationPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects a bed rise that is infeasible even without contraction',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
          ...input,

          specifiedBedRise:
            0.4,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumWidthBedRiseTransitionLossError &&
        error.code ===
          'NO_FEASIBLE_CONTRACTED_WIDTH',
    )
  },
)

test(
  'rejects negative bed rise',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
          ...input,

          specifiedBedRise:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumWidthBedRiseTransitionLossError &&
        error.code ===
          'INVALID_BED_RISE',
    )
  },
)

test(
  'exports minimum-width bed-rise design as CSV',
  () => {
    const result =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss(
        input,
      )

    const csv =
      createTrapezoidalMinimumWidthBedRiseTransitionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Minimum contracted bottom width/,
    )

    assert.match(
      csv,
      /Transition-loss width penalty/,
    )

    assert.match(
      csv,
      /Specified bed rise/,
    )

    assert.match(
      csv,
      /Bed-rise potential power/,
    )
  },
)
