import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMinimumUpstreamDepthContractionLossError,
  calculateTrapezoidalMinimumUpstreamDepthContractionLoss,
  createTrapezoidalMinimumUpstreamDepthContractionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/engine.ts'

import {
  calculateTrapezoidalContractionTransitionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-contraction-transition-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMinimumUpstreamDepthContractionLoss'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

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
  'calculates minimum subcritical upstream depth at the loss-adjusted choking threshold',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMinimumUpstreamDepthContractionLoss',
    )

    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      0.9981019252229779,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamSpecificEnergy,
      1.0781464863355166,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7751817116295474,
      1e-8,
    )
  },
)

test(
  'required upstream state is subcritical',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.requiredUpstreamFlowArea,
      3.9905132288027487,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamVelocity,
      1.2529716638729504,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamFroudeNumber,
      0.4476994997658342,
      1e-8,
    )

    assert.ok(
      result.requiredUpstreamFroudeNumber <
      1,
    )
  },
)

test(
  'reports alternate supercritical upstream specific-energy root',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.alternateSupercriticalUpstreamDepth,
      0.40393937323269424,
      1e-8,
    )

    closeTo(
      result.alternateUpstreamVelocity,
      3.6364029440395615,
      1e-8,
    )

    closeTo(
      result.alternateUpstreamFroudeNumber,
      1.9324319818969677,
      1e-8,
    )

    assert.ok(
      result.alternateUpstreamFroudeNumber >
      1,
    )
  },
)

test(
  'loss-adjusted throat control state satisfies analytical Froude condition',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.3242083727076124,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      0.9534625892455924,
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
  'transition-loss head closes the required upstream energy',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.0506042340895194,
      1e-8,
    )

    closeTo(
      result.transitionLossHeadAtThreshold,
      Number('0.027542252245997196'),
      1e-9,
    )

    closeTo(
      result.controlSpecificEnergyWithoutLoss +
      result.transitionLossHeadAtThreshold,
      result.requiredUpstreamSpecificEnergy,
      1e-9,
    )
  },
)

test(
  'both upstream alternate-depth branches close to required specific energy',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    assert.ok(
      Math.abs(
        result.subcriticalEnergyResidual,
      ) <=
      1e-8,
    )

    assert.ok(
      Math.abs(
        result.alternateEnergyResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'Calculator 441 forward model closes at the specified contraction threshold',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    const forward =
      calculateTrapezoidalContractionTransitionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        contractedBottomWidth:
          input.contractedBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        upstreamFlowDepth:
          result.minimumSubcriticalUpstreamDepth,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })

    assert.equal(
      forward.throatStatus,
      'Loss-adjusted choking threshold',
    )

    closeTo(
      forward.lossAdjustedMinimumContractedBottomWidth,
      input.contractedBottomWidth,
      1e-7,
    )

    assert.ok(
      Math.abs(
        forward.availableSpecificEnergyMargin,
      ) <=
      1e-8,
    )
  },
)

test(
  'zero transition loss recovers lossless contraction depth requirement',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      0.9618280574900642,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7537303008605118,
      1e-8,
    )

    closeTo(
      result.transitionLossHeadAtThreshold,
      0,
      1e-12,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1,
      1e-9,
    )
  },
)

test(
  'larger transition loss requires a deeper upstream approach',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
        ...input,

        transitionLossCoefficient:
          0.2,
      })

    assert.ok(
      largerLoss.minimumSubcriticalUpstreamDepth >
      base.minimumSubcriticalUpstreamDepth,
    )

    closeTo(
      largerLoss.minimumSubcriticalUpstreamDepth,
      1.0309943338190246,
      1e-8,
    )
  },
)

test(
  'reports upstream critical reference and threshold water-surface change',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.upstreamCriticalDepth,
      0.6114073321581261,
      1e-8,
    )

    closeTo(
      result.upstreamCriticalSpecificEnergy,
      0.8728491781559563,
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.2229202135934305,
      1e-8,
    )

    assert.ok(
      result.depthAboveUpstreamCritical >
      0,
    )
  },
)

test(
  'rectangular-channel limit is reproduced',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
        upstreamBottomWidth:
          3,

        contractedBottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          4,

        transitionLossCoefficient:
          0.1,

        fluidDensity:
          998,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      1.0690200117459843,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7655566505244702,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamSpecificEnergy,
      1.1483349757867052,
      1e-8,
    )
  },
)

test(
  'density changes mass and dissipation power but not hydraulic depths',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.minimumSubcriticalUpstreamDepth,
      base.minimumSubcriticalUpstreamDepth,
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
  'reports transition-loss dissipation power',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    closeTo(
      result.massFlowRate,
      4990,
      1e-10,
    )

    closeTo(
      result.transitionLossDissipationPower,
      1347.78516766116,
      1e-6,
    )
  },
)

test(
  'rejects negative transition-loss coefficient',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
          ...input,

          transitionLossCoefficient:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthContractionLossError &&
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
        calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthContractionLossError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports minimum upstream-depth contraction-loss design as CSV',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss(
        input,
      )

    const csv =
      createTrapezoidalMinimumUpstreamDepthContractionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Minimum subcritical upstream depth/,
    )

    assert.match(
      csv,
      /Alternate supercritical upstream depth/,
    )

    assert.match(
      csv,
      /Transition-loss head at threshold/,
    )

    assert.match(
      csv,
      /Transition-loss dissipation power/,
    )
  },
)
