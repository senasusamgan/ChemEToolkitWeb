import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError,
  calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss,
  createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/engine.ts'

import {
  calculateTrapezoidalMinimumUpstreamDepthContractionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/engine.ts'

import {
  calculateTrapezoidalMaximumBedRiseContractionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts'

import {
  calculateTrapezoidalMinimumWidthBedRiseTransitionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/engine.ts'

import {
  calculateTrapezoidalMaximumTransitionLossCoefficientBedRise,
} from '../../src/features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

  volumetricFlowRate:
    5,

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
  'calculates minimum subcritical upstream depth for contraction bed rise and loss',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss',
    )

    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      1.1180123871915222,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamSpecificEnergy,
      1.1781464863355167,
      1e-8,
    )

    closeTo(
      result.throatRequiredSpecificEnergy,
      1.0781464863355166,
      1e-8,
    )
  },
)

test(
  'reports bed-rise depth penalty relative to Calculator 444',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.zeroBedRiseMinimumSubcriticalUpstreamDepth,
      0.9981019252229779,
      1e-8,
    )

    closeTo(
      result.bedRiseDepthPenalty,
      0.11991046196854382,
      1e-8,
    )

    assert.ok(
      result.bedRiseDepthPenaltyPercent >
      0,
    )
  },
)

test(
  'required upstream approach remains subcritical',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.requiredUpstreamFlowArea,
      4.603988859488252,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamVelocity,
      1.0860147912164508,
      1e-8,
    )

    closeTo(
      result.requiredUpstreamFroudeNumber,
      0.3698359433851617,
      1e-8,
    )

    assert.ok(
      result.requiredUpstreamFroudeNumber <
      1,
    )
  },
)

test(
  'reports alternate supercritical upstream energy root',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.alternateSupercriticalUpstreamDepth,
      0.3730313141316465,
      1e-8,
    )

    closeTo(
      result.alternateUpstreamVelocity,
      3.9737847710949525,
      1e-8,
    )

    closeTo(
      result.alternateUpstreamFroudeNumber,
      2.189518850425715,
      1e-8,
    )

    assert.ok(
      result.alternateUpstreamFroudeNumber >
      1,
    )
  },
)

test(
  'reports inherited loss-adjusted throat control state',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7751817116295474,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.3242083727076124,
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

    closeTo(
      result.transitionLossHeadAtThreshold,
      0.027542252245997198,
      1e-9,
    )
  },
)

test(
  'bed rise and transition loss close the full energy equation',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.0506042340895194,
      1e-8,
    )

    closeTo(
      result.throatRequiredSpecificEnergy +
      input.specifiedBedRise,
      result.requiredUpstreamSpecificEnergy,
      1e-10,
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

    assert.ok(
      Math.abs(
        result.totalEnergyClosureResidual,
      ) <=
      1e-10,
    )
  },
)

test(
  'Calculator 445 forward closure recovers specified bed rise',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
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
          result.minimumSubcriticalUpstreamDepth,

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
  'Calculator 446 closure recovers specified contracted width',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    const inverse =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        upstreamFlowDepth:
          result.minimumSubcriticalUpstreamDepth,

        specifiedBedRise:
          input.specifiedBedRise,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      inverse.minimumContractedBottomWidth,
      input.contractedBottomWidth,
      1e-6,
    )
  },
)

test(
  'Calculator 448 closure recovers specified transition-loss coefficient',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    const inverse =
      calculateTrapezoidalMaximumTransitionLossCoefficientBedRise({
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

        specifiedBedRise:
          input.specifiedBedRise,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      inverse.maximumAllowableTransitionLossCoefficient,
      input.transitionLossCoefficient,
      1e-6,
    )
  },
)

test(
  'zero bed rise recovers Calculator 444 minimum upstream depth',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0,
      })

    const calculator444 =
      calculateTrapezoidalMinimumUpstreamDepthContractionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        contractedBottomWidth:
          input.contractedBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          input.volumetricFlowRate,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      calculator444.minimumSubcriticalUpstreamDepth,
      1e-9,
    )

    closeTo(
      result.bedRiseDepthPenalty,
      0,
      1e-9,
    )
  },
)

test(
  'larger bed rise requires deeper upstream flow',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    const largerRise =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0.2,
      })

    assert.ok(
      largerRise.minimumSubcriticalUpstreamDepth >
      base.minimumSubcriticalUpstreamDepth,
    )

    closeTo(
      largerRise.minimumSubcriticalUpstreamDepth,
      1.2311757819702782,
      1e-8,
    )
  },
)

test(
  'zero transition loss lowers the required upstream depth',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      1.0846751950326325,
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
  'reports upstream critical reference and water-surface change',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
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
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.8751817116295474,
      1e-8,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.24283067556197435,
      1e-8,
    )
  },
)

test(
  'reports combined hydraulic power terms',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
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
      1e-5,
    )

    closeTo(
      result.bedRisePotentialPower,
      4893.51835,
      1e-5,
    )

    closeTo(
      result.combinedBedRiseAndLossPower,
      6241.303517661158,
      1e-5,
    )
  },
)

test(
  'rectangular-channel limiting case is reproduced',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
        upstreamBottomWidth:
          3,

        contractedBottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

        volumetricFlowRate:
          4,

        specifiedBedRise:
          0.1,

        transitionLossCoefficient:
          0.1,

        fluidDensity:
          998,
      })

    closeTo(
      result.minimumSubcriticalUpstreamDepth,
      1.1836371599334607,
      1e-8,
    )

    closeTo(
      result.alternateSupercriticalUpstreamDepth,
      0.3109618847501672,
      1e-8,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.7655566505244702,
      1e-8,
    )
  },
)

test(
  'density changes power but not hydraulic depth requirement',
  () => {
    const base =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
        ...input,

        fluidDensity:
          input.fluidDensity *
          2,
      })

    closeTo(
      denser.minimumSubcriticalUpstreamDepth,
      base.minimumSubcriticalUpstreamDepth,
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
      denser.combinedBedRiseAndLossPower /
      base.combinedBedRiseAndLossPower,
      2,
      1e-12,
    )
  },
)

test(
  'rejects negative bed rise',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
          ...input,

          specifiedBedRise:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError &&
        error.code ===
          'INVALID_BED_RISE',
    )
  },
)

test(
  'rejects contracted width equal to upstream width',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports combined minimum upstream-depth design as CSV',
  () => {
    const result =
      calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
        input,
      )

    const csv =
      createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Minimum subcritical upstream depth/,
    )

    assert.match(
      csv,
      /Bed-rise depth penalty/,
    )

    assert.match(
      csv,
      /Transition-loss head at threshold/,
    )

    assert.match(
      csv,
      /Combined bed-rise and loss power/,
    )
  },
)
