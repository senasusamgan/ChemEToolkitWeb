import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumTransitionLossCoefficientBedRiseError,
  calculateTrapezoidalMaximumTransitionLossCoefficientBedRise,
  createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/engine.ts'

import {
  calculateTrapezoidalMaximumBedRiseContractionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumTransitionLossCoefficientBedRise'

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

  specifiedBedRise:
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
  'calculates maximum allowable transition-loss coefficient with specified bed rise',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumTransitionLossCoefficientBedRise',
    )

    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.maximumAllowableTransitionLossCoefficient,
      0.3859078151021236,
      1e-8,
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
  'reports lossless throat capacity reserve',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.losslessMaximumVolumetricFlowRate,
      5.886229300456541,
      1e-8,
    )

    closeTo(
      result.losslessFlowCapacityMargin,
      0.8862293004565407,
      1e-8,
    )

    closeTo(
      result.losslessCapacityRatio,
      1.177245860091308,
      1e-9,
    )
  },
)

test(
  'solves the loss-adjusted choking control state',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.8294653363748439,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFlowArea,
      2.346943416997121,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlTopWidth,
      3.6589306727496878,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.130430569305086,
      1e-8,
    )
  },
)

test(
  'loss-adjusted Froude matches analytical control relation',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.8494402349586,
      1e-9,
    )

    closeTo(
      result.theoreticalControlFroudeNumber,
      1 /
      Math.sqrt(
        1 +
        result.maximumAllowableTransitionLossCoefficient,
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
  'transition-loss head and bed rise close the complete energy equation',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.0608763896208346,
      1e-8,
    )

    closeTo(
      result.maximumAllowableTransitionLossHead,
      0.0893033339486415,
      1e-9,
    )

    closeTo(
      result.minimumRequiredThroatEnergy,
      result.availableThroatSpecificEnergy,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.throatEnergyClosureResidual,
      ) <=
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.totalEnergyClosureResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'reports crest water surface at the allowable loss threshold',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.9294653363748439,
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.2705346636251561,
      1e-8,
    )
  },
)

test(
  'Calculator 445 forward model recovers the specified bed rise at KL max',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    const forward =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
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

        transitionLossCoefficient:
          result.maximumAllowableTransitionLossCoefficient,

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
  'zero bed rise recovers Calculator 442 maximum transition-loss limit',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
        ...input,

        specifiedBedRise:
          0,
      })

    closeTo(
      result.maximumAllowableTransitionLossCoefficient,
      0.871739510354083,
      1e-8,
    )

    closeTo(
      result.losslessMaximumVolumetricFlowRate,
      6.840576566259022,
      1e-8,
    )
  },
)

test(
  'larger bed rise reduces allowable transition loss',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    const largerRise =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
        ...input,

        specifiedBedRise:
          0.2,
      })

    assert.ok(
      largerRise.maximumAllowableTransitionLossCoefficient <
      base.maximumAllowableTransitionLossCoefficient,
    )

    closeTo(
      largerRise.maximumAllowableTransitionLossCoefficient,
      0.0019282742994932711,
      1e-8,
    )
  },
)

test(
  'wider contraction permits a larger transition-loss coefficient',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    const wider =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
        ...input,

        contractedBottomWidth:
          2.5,
      })

    assert.ok(
      wider.maximumAllowableTransitionLossCoefficient >
      base.maximumAllowableTransitionLossCoefficient,
    )

    closeTo(
      wider.maximumAllowableTransitionLossCoefficient,
      0.9198522513705851,
      1e-8,
    )
  },
)

test(
  'reports hydraulic power budgets at the allowable loss threshold',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    closeTo(
      result.massFlowRate,
      4990,
      1e-10,
    )

    closeTo(
      result.maximumTransitionLossDissipationPower,
      4370.07503393855,
      1e-5,
    )

    closeTo(
      result.bedRisePotentialPower,
      4893.51835,
      1e-5,
    )

    closeTo(
      result.combinedBedRiseAndLossPower,
      9263.59338393855,
      1e-5,
    )
  },
)

test(
  'rectangular-channel limiting case is reproduced',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
        upstreamBottomWidth:
          3,

        contractedBottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          4,

        upstreamFlowDepth:
          1.5,

        specifiedBedRise:
          0.1,

        fluidDensity:
          998,
      })

    closeTo(
      result.maximumAllowableTransitionLossCoefficient,
      1.1703626003077106,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.9601900566381019,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.6787875240200782,
      1e-9,
    )
  },
)

test(
  'density changes power but not allowable transition-loss coefficient',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.maximumAllowableTransitionLossCoefficient,
      base.maximumAllowableTransitionLossCoefficient,
      1e-10,
    )

    closeTo(
      denser.lossAdjustedControlDepth,
      base.lossAdjustedControlDepth,
      1e-10,
    )

    closeTo(
      denser.massFlowRate /
      base.massFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.maximumTransitionLossDissipationPower /
      base.maximumTransitionLossDissipationPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects a raised contraction already choked in the lossless limit',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
          ...input,

          specifiedBedRise:
            0.3,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumTransitionLossCoefficientBedRiseError &&
        error.code ===
          'LOSSLESS_RAISED_CONTRACTION_ALREADY_CHOKED',
    )
  },
)

test(
  'rejects negative bed rise',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
          ...input,

          specifiedBedRise:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumTransitionLossCoefficientBedRiseError &&
        error.code ===
          'INVALID_BED_RISE',
    )
  },
)

test(
  'exports maximum transition-loss bed-rise analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
        input,
      )

    const csv =
      createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum allowable transition-loss coefficient/,
    )

    assert.match(
      csv,
      /Specified bed rise/,
    )

    assert.match(
      csv,
      /Available throat specific energy/,
    )

    assert.match(
      csv,
      /Combined bed-rise and loss power/,
    )
  },
)
