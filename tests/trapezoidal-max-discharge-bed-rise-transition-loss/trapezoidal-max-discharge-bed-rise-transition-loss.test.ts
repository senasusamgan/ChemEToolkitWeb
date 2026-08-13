import assert from 'node:assert/strict'
import test from 'node:test'

import {
  TrapezoidalMaximumDischargeBedRiseTransitionLossError,
  calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss,
  createTrapezoidalMaximumDischargeBedRiseTransitionLossCsv,
} from '../../src/features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/engine.ts'

import {
  calculateTrapezoidalMaximumBedRiseContractionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/engine.ts'

import {
  calculateTrapezoidalMinimumWidthBedRiseTransitionLoss,
} from '../../src/features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/engine.ts'

const CALCULATOR_ID =
  'trapezoidalMaximumDischargeBedRiseTransitionLoss'

const input = {
  upstreamBottomWidth:
    3,

  contractedBottomWidth:
    2,

  sideSlopeHorizontalPerVertical:
    1,

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
  tolerance = 1e-7,
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
  'calculates maximum discharge with contraction bed rise and transition loss',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'trapezoidalMaximumDischargeBedRiseTransitionLoss',
    )

    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.maximumVolumetricFlowRate,
      5.756043689859775,
      1e-6,
    )

    closeTo(
      result.maximumMassFlowRate,
      5744.531602480055,
      1e-3,
    )
  },
)

test(
  'reports a subcritical upstream state at maximum discharge',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.upstreamFlowArea,
      5.04,
      1e-12,
    )

    closeTo(
      result.upstreamVelocityAtMaximumFlow,
      1.1420721606864632,
      1e-6,
    )

    closeTo(
      result.upstreamFroudeNumberAtMaximumFlow,
      0.3774981426199798,
      1e-6,
    )

    closeTo(
      result.upstreamSpecificEnergyAtMaximumFlow,
      1.2665022622513828,
      1e-6,
    )

    assert.ok(
      result.upstreamFroudeNumberAtMaximumFlow <
      1,
    )
  },
)

test(
  'solves the loss-adjusted throat control state',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.lossAdjustedControlDepth,
      0.8417917212921233,
      1e-6,
    )

    closeTo(
      result.lossAdjustedControlFlowArea,
      2.3921967446202026,
      1e-6,
    )

    closeTo(
      result.lossAdjustedControlVelocity,
      2.406174869522964,
      1e-6,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.controlConditionResidual,
      ) <=
      1e-8,
    )
  },
)

test(
  'bed rise and transition loss close the threshold energy equation',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.availableThroatSpecificEnergyAtMaximumFlow,
      1.1665022622513828,
      1e-6,
    )

    closeTo(
      result.controlSpecificEnergyWithoutLoss,
      1.136983122164177,
      1e-6,
    )

    closeTo(
      result.transitionLossHeadAtMaximumFlow,
      0.029519140087205378,
      1e-7,
    )

    closeTo(
      result.minimumRequiredThroatEnergy,
      result.availableThroatSpecificEnergyAtMaximumFlow,
      1e-7,
    )

    assert.ok(
      Math.abs(
        result.energyClosureResidual,
      ) <=
      1e-7,
    )
  },
)

test(
  'reports transition-loss capacity penalty',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.losslessMaximumVolumetricFlowRate,
      6.11729226040085,
      1e-6,
    )

    closeTo(
      result.transitionLossFlowPenalty,
      0.3612485705410755,
      1e-6,
    )

    closeTo(
      result.transitionLossFlowReductionPercent,
      5.905367197829515,
      1e-5,
    )
  },
)

test(
  'reports bed-rise capacity penalty',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.zeroBedRiseMaximumVolumetricFlowRate,
      6.980338153825208,
      1e-6,
    )

    closeTo(
      result.bedRiseFlowPenalty,
      1.2242944639654336,
      1e-6,
    )

    closeTo(
      result.bedRiseFlowReductionPercent,
      17.5391855951065,
      1e-5,
    )
  },
)

test(
  'Calculator 445 recovers the specified bed-rise threshold',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const inverse =
      calculateTrapezoidalMaximumBedRiseContractionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        contractedBottomWidth:
          input.contractedBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          result.maximumVolumetricFlowRate,

        upstreamFlowDepth:
          input.upstreamFlowDepth,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })

    closeTo(
      inverse.signedBedElevationAllowance,
      input.specifiedBedRise,
      1e-6,
    )

    closeTo(
      inverse.maximumAllowableBedRise,
      input.specifiedBedRise,
      1e-6,
    )
  },
)

test(
  'Calculator 446 recovers the specified contracted width',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const inverse =
      calculateTrapezoidalMinimumWidthBedRiseTransitionLoss({
        upstreamBottomWidth:
          input.upstreamBottomWidth,

        sideSlopeHorizontalPerVertical:
          input.sideSlopeHorizontalPerVertical,

        volumetricFlowRate:
          result.maximumVolumetricFlowRate,

        upstreamFlowDepth:
          input.upstreamFlowDepth,

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
  'zero bed rise recovers Calculator 443 maximum discharge',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0,
      })

    closeTo(
      result.maximumVolumetricFlowRate,
      6.980338153825208,
      1e-6,
    )

    closeTo(
      result.bedRiseFlowPenalty,
      0,
      1e-7,
    )

    closeTo(
      result.bedRisePotentialPower,
      0,
      1e-7,
    )
  },
)

test(
  'zero transition loss gives the lossless bed-rise capacity',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
        ...input,

        transitionLossCoefficient:
          0,
      })

    closeTo(
      result.maximumVolumetricFlowRate,
      6.11729226040085,
      1e-6,
    )

    closeTo(
      result.transitionLossFlowPenalty,
      0,
      1e-7,
    )

    closeTo(
      result.transitionLossHeadAtMaximumFlow,
      0,
      1e-9,
    )
  },
)

test(
  'larger bed rise reduces maximum discharge',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const largerRise =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
        ...input,

        specifiedBedRise:
          0.2,
      })

    assert.ok(
      largerRise.maximumVolumetricFlowRate <
      base.maximumVolumetricFlowRate,
    )

    closeTo(
      largerRise.maximumVolumetricFlowRate,
      4.729410897565961,
      1e-6,
    )
  },
)

test(
  'larger transition loss reduces maximum discharge',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const largerLoss =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
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
      5.453354628576111,
      1e-6,
    )
  },
)

test(
  'reports crest water surface and power terms',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    closeTo(
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      0.9417917212921233,
      1e-6,
    )

    closeTo(
      result.waterSurfaceElevationChangeAtThreshold,
      -0.25820827870787666,
      1e-6,
    )

    closeTo(
      result.transitionLossDissipationPower,
      1662.9492691282485,
      1e-3,
    )

    closeTo(
      result.bedRisePotentialPower,
      5633.461083946103,
      1e-3,
    )
  },
)

test(
  'rectangular-channel limiting case is reproduced',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
        upstreamBottomWidth:
          3,

        contractedBottomWidth:
          2,

        sideSlopeHorizontalPerVertical:
          0,

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
      result.maximumVolumetricFlowRate,
      5.89759397316824,
      1e-6,
    )

    closeTo(
      result.lossAdjustedControlDepth,
      0.9917158459176074,
      1e-6,
    )

    closeTo(
      result.lossAdjustedControlFroudeNumber,
      1 /
      Math.sqrt(
        1.1,
      ),
      1e-7,
    )
  },
)

test(
  'density changes mass and power but not hydraulic capacity',
  () => {
    const base =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const denser =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
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
      1e-10,
    )

    closeTo(
      denser.transitionLossDissipationPower /
      base.transitionLossDissipationPower,
      2,
      1e-10,
    )
  },
)

test(
  'rejects negative bed rise',
  () => {
    assert.throws(
      () =>
        calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
          ...input,

          specifiedBedRise:
            -0.1,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeBedRiseTransitionLossError &&
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
        calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss({
          ...input,

          contractedBottomWidth:
            input.upstreamBottomWidth,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          TrapezoidalMaximumDischargeBedRiseTransitionLossError &&
        error.code ===
          'INVALID_CONTRACTED_WIDTH',
    )
  },
)

test(
  'exports maximum-discharge combined design as CSV',
  () => {
    const result =
      calculateTrapezoidalMaximumDischargeBedRiseTransitionLoss(
        input,
      )

    const csv =
      createTrapezoidalMaximumDischargeBedRiseTransitionLossCsv(
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
      /Bed-rise flow penalty/,
    )

    assert.match(
      csv,
      /Bed-rise potential power/,
    )
  },
)
