import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumDischargeTransitionLossError,
  calculateTrapezoidalMaximumDischargeTransitionLoss,
  createTrapezoidalMaximumDischargeTransitionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumDischargeTransitionLoss'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

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
  'calculates maximum discharge through the contraction with transition loss',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumDischargeTransitionLoss',
    )

    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.maximumVolumetricFlowRate,
      6.980338153825208,
      1e-7,
    )

    closeTo(
      result.maximumMassFlowRate,
      6966.377477517558,
      1e-4,
    )
  },
)

test(
  'maximum-flow upstream state remains subcritical',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      5.04,
      1e-12,
    )

    closeTo(
      result.upstreamVelocityAtMaximumFlow,
      1.384987728933573,
      1e-8,
    )

    closeTo(
      result.upstreamFroudeNumberAtMaximumFlow,
      0.4577909463353272,
      1e-8,
    )

    closeTo(
      result.upstreamSpecificEnergyAtMaximumFlow,
      1.2978005235884107,
      1e-8,
    )

    assert.ok(
      result.upstreamFroudeNumberAtMaximumFlow <
      1,
    )
  },
)

test(
  'solves the loss-adjusted minimum-energy control section',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.9412659717376437,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFlowArea,
      2.7685135730264983,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlTopWidth,
      3.8825319434752874,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.5213306598292764,
      1e-8,
    )
  },
)

test(
  'loss-adjusted control Froude number matches analytical condition',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
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
  'maximum flow closes the loss-adjusted energy equation',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.2653882916019774,
      1e-8,
    )

    closeTo(
      result.transitionLossHeadAtMaximumFlow,
      0.032412231986433365,
      1e-9,
    )

    closeTo(
      result.minimumRequiredSpecificEnergy,
      result.upstreamSpecificEnergyAtMaximumFlow,
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
  'reports the capacity penalty caused by transition loss',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.losslessMaximumVolumetricFlowRate,
      7.466532328689297,
      1e-7,
    )

    closeTo(
      result.transitionLossFlowPenalty,
      0.4861941748640888,
      1e-7,
    )

    closeTo(
      result.transitionLossCapacityRatio,
      0.9348835371681251,
      1e-8,
    )

    closeTo(
      result.transitionLossFlowReductionPercent,
      6.511646283187488,
      1e-7,
    )
  },
)

test(
  'Calculator 442 inversely recovers the specified transition-loss coefficient',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.backCalculatedMaximumTransitionLossCoefficient,
      input.transitionLossCoefficient,
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.lossCoefficientClosureResidual,
      ) <=
      1e-7,
    )

    assert.equal(
      result.forwardThresholdStatus,
      'Loss-adjusted choking threshold',
    )

    assert.ok(
      Math.abs(
        result.forwardWidthClosureResidual,
      ) <=
      1e-7,
    )
  },
)

test(
  'zero transition loss gives the lossless contraction capacity',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    closeTo(
      result.maximumVolumetricFlowRate,
      7.466532328689297,
      1e-7,
    )

    closeTo(
      result.transitionLossFlowPenalty,
      0,
      1e-7,
    )

    closeTo(
      result.transitionLossFlowReductionPercent,
      0,
      1e-7,
    )

    closeTo(
      result.transitionLossHeadAtMaximumFlow,
      0,
      1e-10,
    )
  },
)

test(
  'larger transition loss reduces maximum discharge',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalMaximumDischargeTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0.2,
      })

    assert.ok(
      largerLoss.maximumVolumetricFlowRate <
      base.maximumVolumetricFlowRate,
    )

    closeTo(
      largerLoss.maximumVolumetricFlowRate,
      6.581914192989139,
      1e-7,
    )
  },
)

test(
  'reports remaining distance to upstream critical-flow limit',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.upstreamCriticalFlowRate,
      15.247872876699883,
      1e-8,
    )

    closeTo(
      result.upstreamCriticalFlowMargin,
      8.267534722874675,
      1e-7,
    )
  },
)

test(
  'reports transition-loss dissipation power at maximum flow',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    closeTo(
      result.maximumDissipationPower,
      2214.3008028376903,
      1e-4,
    )

    assert.ok(
      result.maximumDissipationPower >
      0,
    )
  },
)

test(
  'rectangular-channel limiting case is reproduced',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss({
        upstreamBottomWidth:
          3,

        contractedBottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

        upstreamFlowDepth:
          1.5,

        transitionLossCoefficient:
          0.1,

        fluidDensity:
          998,
      })

    closeTo(
      result.maximumVolumetricFlowRate,
      6.648415099685021,
      1e-7,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      1.0741940872661297,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.9534625892455921,
      1e-9,
    )
  },
)

test(
  'density changes mass and dissipation power but not hydraulic capacity',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumDischargeTransitionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.maximumVolumetricFlowRate,
      base.maximumVolumetricFlowRate,
      1e-8,
    )

    closeTo(
      denser.lossAdjustedControlDepth,
      base.lossAdjustedControlDepth,
      1e-8,
    )

    closeTo(
      denser.maximumMassFlowRate /
      base.maximumMassFlowRate,
      2,
      1e-12,
    )

    closeTo(
      denser.maximumDissipationPower /
      base.maximumDissipationPower,
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
        calculateTrapezoidalMaximumDischargeTransitionLoss({
          ...input,

          transitionLossCoefficient:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeTransitionLossError &&
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
        calculateTrapezoidalMaximumDischargeTransitionLoss({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeTransitionLossError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports maximum-discharge transition-loss analysis as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeTransitionLoss(
        input,
      )

    const csv =
      createTrapezoidalMaximumDischargeTransitionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Maximum volumetric flow rate/,
    )

    assert.match(
      csv,
      /Transition-loss flow penalty/,
    )

    assert.match(
      csv,
      /Back-calculated maximum transition-loss coefficient/,
    )

    assert.match(
      csv,
      /Maximum dissipation power/,
    )
  },
)
