import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumTransitionLossCoefficientError,
  calculateTrapezoidalMaximumTransitionLossCoefficient,
  createTrapezoidalMaximumTransitionLossCoefficientCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumTransitionLossCoefficient'

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
  'calculates maximum allowable transition-loss coefficient before choking',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumTransitionLossCoefficient',
    )

    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.upstreamSpecificEnergy,
      1.2501797235694763,
      1e-10,
    )

    closeTo(
      result.maximumAllowableTransitionLossCoefficient,
      0.8717395103540819,
      1e-8,
    )

    closeTo(
      result.losslessMaximumFlowRate,
      6.8405765662590206,
      1e-8,
    )
  },
)

test(
  'reports the loss-adjusted threshold control geometry',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.9051238314378105,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFlowArea,
      2.6294968131122833,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlTopWidth,
      3.810247662875621,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlHydraulicDepth,
      0.6901117842633314,
      1e-8,
    )
  },
)

test(
  'control Froude number matches the loss-adjusted analytical condition',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.lossAdjustedControlVelocity,
      1.901504491303026,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.7309325393216677,
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
  'allowable transition loss closes the upstream energy exactly at threshold',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.0894742125794634,
      1e-8,
    )

    closeTo(
      result.maximumAllowableTransitionLossHead,
      0.16070551099001282,
      1e-8,
    )

    closeTo(
      result.minimumRequiredUpstreamSpecificEnergy,
      result.upstreamSpecificEnergy,
      1e-9,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-9,
    )
  },
)

test(
  'reports lossless capacity margin and capacity ratio',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.losslessFlowCapacityMargin,
      1.8405765662590206,
      1e-8,
    )

    closeTo(
      result.losslessCapacityRatio,
      1.368115313251804,
      1e-8,
    )

    closeTo(
      result.transitionLossHeadFractionOfUpstreamEnergy,
      0.12854592660579328,
      1e-9,
    )
  },
)

test(
  'Calculator 441 forward model closes to the specified contraction width',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    assert.equal(
      result.forwardThresholdStatus,
      'Loss-adjusted choking threshold',
    )

    closeTo(
      result.forwardLossAdjustedMinimumWidth,
      input.contractedBottomWidth,
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.forwardWidthClosureResidual,
      ) <=
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.forwardAvailableEnergyMargin,
      ) <=
      1e-8,
    )
  },
)

test(
  'wider contracted section can tolerate a larger transition-loss coefficient',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    const wider =
      calculateTrapezoidalMaximumTransitionLossCoefficient({
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
      1.5726804890118302,
      1e-8,
    )
  },
)

test(
  'narrower but still lossless-feasible contraction has less allowable loss',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    const narrower =
      calculateTrapezoidalMaximumTransitionLossCoefficient({
        ...input,

        contractedBottomWidth:
          1.5,
      })

    assert.ok(
      narrower.maximumAllowableTransitionLossCoefficient <
      base.maximumAllowableTransitionLossCoefficient,
    )

    closeTo(
      narrower.maximumAllowableTransitionLossCoefficient,
      0.28405058911366443,
      1e-8,
    )
  },
)

test(
  'rectangular-channel limit is reproduced',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient({
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

        fluidDensity:
          998,
      })

    closeTo(
      result.upstreamSpecificEnergy,
      1.5402850849571528,
      1e-10,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      1.0268567233047685,
      1e-8,
    )

    closeTo(
      result.maximumAllowableTransitionLossCoefficient,
      1.6545458878848383,
      1e-8,
    )
  },
)

test(
  'reports allowable hydraulic dissipation power',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    closeTo(
      result.maximumAllowableDissipationPower,
      7864.153669757543,
      1e-6,
    )

    closeTo(
      result.massFlowRate,
      4990,
      1e-10,
    )
  },
)

test(
  'density changes mass and power but not allowable KL',
  () => {
    const base =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumTransitionLossCoefficient({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.maximumAllowableTransitionLossCoefficient,
      base.maximumAllowableTransitionLossCoefficient,
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
      denser.maximumAllowableDissipationPower /
      base.maximumAllowableDissipationPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects a contraction already choked with zero transition loss',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumTransitionLossCoefficient({
          ...input,

          contractedBottomWidth:
            1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumTransitionLossCoefficientError &&
        error.code ===
          'LOSSLESS_CONTRACTION_ALREADY_CHOKED',
    )
  },
)

test(
  'rejects contracted width equal to upstream width',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumTransitionLossCoefficient({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumTransitionLossCoefficientError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports allowable transition-loss design as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumTransitionLossCoefficient(
        input,
      )

    const csv =
      createTrapezoidalMaximumTransitionLossCoefficientCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum allowable transition-loss coefficient/,
    )

    assert.match(
      csv,
      /Maximum allowable transition-loss head/,
    )

    assert.match(
      csv,
      /Forward width closure residual/,
    )

    assert.match(
      csv,
      /Maximum allowable dissipation power/,
    )
  },
)
