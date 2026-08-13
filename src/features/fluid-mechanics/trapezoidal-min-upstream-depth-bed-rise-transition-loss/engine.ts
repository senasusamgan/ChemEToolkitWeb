import {
  calculateTrapezoidalMinimumUpstreamDepthContractionLoss,
} from '../trapezoidal-min-upstream-depth-contraction-loss/engine.ts'

import {
  calculateTrapezoidalChannelAlternateDepth,
} from '../trapezoidal-channel-alternate-depth/engine.ts'

import type {
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput,
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MINIMUM_UPSTREAM_DEPTH_BED_RISE_TRANSITION_LOSS_ENGINE_VERSION =
  'trapezoidal-minimum-upstream-depth-bed-rise-transition-loss-v1'

export type TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_BED_RISE'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'NO_DISTINCT_SUBCRITICAL_APPROACH'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError
  extends Error {
  readonly code:
    TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossErrorCode

  constructor(
    code:
      TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

function normalizeNonNegative(
  value: number,
  tolerance = 1e-9,
): number {
  if (
    value < 0 &&
    Math.abs(
      value,
    ) <= tolerance
  ) {
    return 0
  }

  return value
}

export function calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
  input:
    TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput,
): TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.contractedBottomWidth,
    ) ||
    input.contractedBottomWidth <= 0 ||
    input.contractedBottomWidth >=
      input.upstreamBottomWidth
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_CONTRACTED_WIDTH',
      'Contracted bottom width must be positive and smaller than the upstream bottom width.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical < 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.specifiedBedRise,
    ) ||
    input.specifiedBedRise < 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_BED_RISE',
      'Specified bed rise must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient < 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_LOSS_COEFFICIENT',
      'Transition-loss coefficient KL must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <= 0
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  /*
   * Calculator 444 determines the loss-adjusted
   * contraction control state for Q, b2, z and KL.
   * That throat state is independent of upstream
   * depth. Bed rise simply adds Δz to the upstream
   * specific-energy requirement.
   */
  const zeroBedRise =
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

  const throatRequiredSpecificEnergy =
    zeroBedRise.requiredUpstreamSpecificEnergy

  const requiredUpstreamSpecificEnergy =
    throatRequiredSpecificEnergy +
    input.specifiedBedRise

  const energySeparationTolerance =
    Math.max(
      1e-10,
      zeroBedRise.upstreamCriticalSpecificEnergy *
      1e-9,
    )

  if (
    requiredUpstreamSpecificEnergy <=
    zeroBedRise.upstreamCriticalSpecificEnergy +
      energySeparationTolerance
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'NO_DISTINCT_SUBCRITICAL_APPROACH',
      'The combined bed-rise and contraction energy does not produce a distinct subcritical upstream-depth root.',
    )
  }

  const alternate =
    calculateTrapezoidalChannelAlternateDepth({
      bottomWidth:
        input.upstreamBottomWidth,

      sideSlopeHorizontalPerVertical:
        input.sideSlopeHorizontalPerVertical,

      volumetricFlowRate:
        input.volumetricFlowRate,

      specificEnergy:
        requiredUpstreamSpecificEnergy,

      fluidDensity:
        input.fluidDensity,
    })

  const minimumSubcriticalUpstreamDepth =
    alternate.deepDepth

  const zeroBedRiseMinimumSubcriticalUpstreamDepth =
    zeroBedRise.minimumSubcriticalUpstreamDepth

  const rawBedRiseDepthPenalty =
    minimumSubcriticalUpstreamDepth -
    zeroBedRiseMinimumSubcriticalUpstreamDepth

  const bedRiseDepthPenalty =
    normalizeNonNegative(
      rawBedRiseDepthPenalty,
    )

  const bedRiseDepthPenaltyPercent =
    (
      bedRiseDepthPenalty /
      zeroBedRiseMinimumSubcriticalUpstreamDepth
    ) *
    100

  const alternateSupercriticalUpstreamDepth =
    alternate.shallowDepth

  const upstreamCriticalDepth =
    zeroBedRise.upstreamCriticalDepth

  const upstreamCriticalSpecificEnergy =
    zeroBedRise.upstreamCriticalSpecificEnergy

  const depthAboveUpstreamCritical =
    minimumSubcriticalUpstreamDepth -
    upstreamCriticalDepth

  const upstreamDepthToCriticalDepthRatio =
    minimumSubcriticalUpstreamDepth /
    upstreamCriticalDepth

  const specifiedBedRiseFractionOfRequiredEnergy =
    input.specifiedBedRise /
    requiredUpstreamSpecificEnergy

  const requiredUpstreamFlowArea =
    alternate.deepFlowArea

  const requiredUpstreamTopWidth =
    alternate.deepTopWidth

  const requiredUpstreamHydraulicDepth =
    alternate.deepHydraulicDepth

  const requiredUpstreamVelocity =
    alternate.deepVelocity

  const requiredUpstreamVelocityHead =
    requiredUpstreamVelocity *
    requiredUpstreamVelocity /
    (
      2 *
      GRAVITATIONAL_ACCELERATION
    )

  const requiredUpstreamFroudeNumber =
    alternate.deepFroudeNumber

  const alternateUpstreamFlowArea =
    alternate.shallowFlowArea

  const alternateUpstreamVelocity =
    alternate.shallowVelocity

  const alternateUpstreamFroudeNumber =
    alternate.shallowFroudeNumber

  const lossAdjustedControlDepth =
    zeroBedRise.lossAdjustedControlDepth

  const lossAdjustedControlFlowArea =
    zeroBedRise.lossAdjustedControlFlowArea

  const lossAdjustedControlTopWidth =
    zeroBedRise.lossAdjustedControlTopWidth

  const lossAdjustedControlHydraulicDepth =
    zeroBedRise.lossAdjustedControlHydraulicDepth

  const lossAdjustedControlVelocity =
    zeroBedRise.lossAdjustedControlVelocity

  const lossAdjustedControlVelocityHead =
    zeroBedRise.lossAdjustedControlVelocityHead

  const lossAdjustedControlFroudeNumber =
    zeroBedRise.lossAdjustedControlFroudeNumber

  const theoreticalControlFroudeNumber =
    zeroBedRise.theoreticalControlFroudeNumber

  const controlSpecificEnergyWithoutLoss =
    zeroBedRise.controlSpecificEnergyWithoutLoss

  const transitionLossHeadAtThreshold =
    zeroBedRise.transitionLossHeadAtThreshold

  const crestBedElevationRelativeToUpstream =
    input.specifiedBedRise

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    input.specifiedBedRise +
    lossAdjustedControlDepth

  const waterSurfaceElevationChangeAtThreshold =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    minimumSubcriticalUpstreamDepth

  const subcriticalEnergyResidual =
    alternate.deepRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const alternateEnergyResidual =
    alternate.shallowRecoveredSpecificEnergy -
    requiredUpstreamSpecificEnergy

  const totalEnergyClosureResidual =
    requiredUpstreamSpecificEnergy -
    (
      input.specifiedBedRise +
      throatRequiredSpecificEnergy
    )

  const controlConditionResidual =
    zeroBedRise.controlConditionResidual

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const contractedWidthReduction =
    input.upstreamBottomWidth -
    input.contractedBottomWidth

  const massFlowRate =
    input.fluidDensity *
    input.volumetricFlowRate

  const transitionLossDissipationPower =
    zeroBedRise.transitionLossDissipationPower

  const bedRisePotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    input.specifiedBedRise

  const combinedBedRiseAndLossPower =
    transitionLossDissipationPower +
    bedRisePotentialPower

  const positiveValues = [
    minimumSubcriticalUpstreamDepth,

    zeroBedRiseMinimumSubcriticalUpstreamDepth,

    alternateSupercriticalUpstreamDepth,

    upstreamCriticalDepth,

    upstreamCriticalSpecificEnergy,

    depthAboveUpstreamCritical,

    upstreamDepthToCriticalDepthRatio,

    requiredUpstreamSpecificEnergy,

    throatRequiredSpecificEnergy,

    requiredUpstreamFlowArea,

    requiredUpstreamTopWidth,

    requiredUpstreamHydraulicDepth,

    requiredUpstreamVelocity,

    requiredUpstreamVelocityHead,

    requiredUpstreamFroudeNumber,

    alternateUpstreamFlowArea,

    alternateUpstreamVelocity,

    alternateUpstreamFroudeNumber,

    lossAdjustedControlDepth,

    lossAdjustedControlFlowArea,

    lossAdjustedControlTopWidth,

    lossAdjustedControlHydraulicDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlVelocityHead,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    contractionRatio,

    contractedWidthReduction,

    massFlowRate,
  ]

  const nonNegativeValues = [
    bedRiseDepthPenalty,

    bedRiseDepthPenaltyPercent,

    specifiedBedRiseFractionOfRequiredEnergy,

    transitionLossHeadAtThreshold,

    crestBedElevationRelativeToUpstream,

    transitionLossDissipationPower,

    bedRisePotentialPower,

    combinedBedRiseAndLossPower,
  ]

  const energyTolerance =
    Math.max(
      1e-9,
      requiredUpstreamSpecificEnergy *
      1e-8,
    )

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <= 0,
    ) ||
    !nonNegativeValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    nonNegativeValues.some(
      value =>
        value < 0,
    ) ||
    minimumSubcriticalUpstreamDepth <=
      upstreamCriticalDepth ||
    alternateSupercriticalUpstreamDepth >=
      upstreamCriticalDepth ||
    requiredUpstreamFroudeNumber >=
      1 ||
    alternateUpstreamFroudeNumber <=
      1 ||
    contractionRatio >=
      1 ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtThreshold,
    ) ||
    !Number.isFinite(
      subcriticalEnergyResidual,
    ) ||
    Math.abs(
      subcriticalEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      alternateEnergyResidual,
    ) ||
    Math.abs(
      alternateEnergyResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      totalEnergyClosureResidual,
    ) ||
    Math.abs(
      totalEnergyClosureResidual,
    ) >
      energyTolerance ||
    !Number.isFinite(
      controlConditionResidual,
    ) ||
    Math.abs(
      controlConditionResidual,
    ) >
      1e-8 ||
    Math.abs(
      lossAdjustedControlFroudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-8
  ) {
    throw new TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError(
      'NUMERICAL_FAILURE',
      'The minimum upstream-depth solution failed its energy, alternate-depth or loss-adjusted control-state checks.',
    )
  }

  return {
    minimumSubcriticalUpstreamDepth,

    zeroBedRiseMinimumSubcriticalUpstreamDepth,

    bedRiseDepthPenalty,

    bedRiseDepthPenaltyPercent,

    alternateSupercriticalUpstreamDepth,

    upstreamCriticalDepth,

    upstreamCriticalSpecificEnergy,

    depthAboveUpstreamCritical,

    upstreamDepthToCriticalDepthRatio,

    requiredUpstreamSpecificEnergy,

    throatRequiredSpecificEnergy,

    specifiedBedRiseFractionOfRequiredEnergy,

    requiredUpstreamFlowArea,

    requiredUpstreamTopWidth,

    requiredUpstreamHydraulicDepth,

    requiredUpstreamVelocity,

    requiredUpstreamVelocityHead,

    requiredUpstreamFroudeNumber,

    alternateUpstreamFlowArea,

    alternateUpstreamVelocity,

    alternateUpstreamFroudeNumber,

    lossAdjustedControlDepth,

    lossAdjustedControlFlowArea,

    lossAdjustedControlTopWidth,

    lossAdjustedControlHydraulicDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlVelocityHead,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    transitionLossHeadAtThreshold,

    crestBedElevationRelativeToUpstream,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtThreshold,

    subcriticalEnergyResidual,

    alternateEnergyResidual,

    totalEnergyClosureResidual,

    controlConditionResidual,

    contractionRatio,

    contractedWidthReduction,

    massFlowRate,

    transitionLossDissipationPower,

    bedRisePotentialPower,

    combinedBedRiseAndLossPower,

    modelName:
      'Minimum Upstream Depth for a Trapezoidal Contraction with Bed Rise and Transition Loss',

    limitationDescription:
      'Inverse one-dimensional choking analysis for a specified trapezoidal contraction with positive bed rise and lumped transition loss hL = KL·Vthroat²/(2g). The calculator determines the minimum deep/subcritical upstream specific-energy root that can supply the raised loss-adjusted control section.',
  }
}

export function createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv(
  input:
    TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput,
  result:
    TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult,
): string {
  const rows = [
    [
      'Minimum Upstream Depth for a Trapezoidal Contraction with Bed Rise and Transition Loss',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Upstream bottom width',
      input.upstreamBottomWidth,
      'm',
    ],
    [
      'Contracted bottom width',
      input.contractedBottomWidth,
      'm',
    ],
    [
      'Side slope z',
      input.sideSlopeHorizontalPerVertical,
      'H:V',
    ],
    [
      'Volumetric flow rate',
      input.volumetricFlowRate,
      'm3/s',
    ],
    [
      'Specified bed rise',
      input.specifiedBedRise,
      'm',
    ],
    [
      'Transition-loss coefficient',
      input.transitionLossCoefficient,
      '-',
    ],
    [
      'Fluid density',
      input.fluidDensity,
      'kg/m3',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Minimum subcritical upstream depth',
      result.minimumSubcriticalUpstreamDepth,
      'm',
    ],
    [
      'Zero-bed-rise minimum upstream depth',
      result.zeroBedRiseMinimumSubcriticalUpstreamDepth,
      'm',
    ],
    [
      'Bed-rise depth penalty',
      result.bedRiseDepthPenalty,
      'm',
    ],
    [
      'Bed-rise depth penalty',
      result.bedRiseDepthPenaltyPercent,
      '%',
    ],
    [
      'Alternate supercritical upstream depth',
      result.alternateSupercriticalUpstreamDepth,
      'm',
    ],
    [
      'Upstream critical depth',
      result.upstreamCriticalDepth,
      'm',
    ],
    [
      'Required upstream specific energy',
      result.requiredUpstreamSpecificEnergy,
      'm',
    ],
    [
      'Throat required specific energy',
      result.throatRequiredSpecificEnergy,
      'm',
    ],
    [
      'Required upstream velocity',
      result.requiredUpstreamVelocity,
      'm/s',
    ],
    [
      'Required upstream Froude number',
      result.requiredUpstreamFroudeNumber,
      '-',
    ],
    [
      'Loss-adjusted control depth',
      result.lossAdjustedControlDepth,
      'm',
    ],
    [
      'Loss-adjusted control Froude number',
      result.lossAdjustedControlFroudeNumber,
      '-',
    ],
    [
      'Transition-loss head at threshold',
      result.transitionLossHeadAtThreshold,
      'm',
    ],
    [
      'Crest water-surface elevation',
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      'm',
    ],
    [
      'Water-surface elevation change',
      result.waterSurfaceElevationChangeAtThreshold,
      'm',
    ],
    [
      'Subcritical energy residual',
      result.subcriticalEnergyResidual,
      'm',
    ],
    [
      'Alternate energy residual',
      result.alternateEnergyResidual,
      'm',
    ],
    [
      'Total energy closure residual',
      result.totalEnergyClosureResidual,
      'm',
    ],
    [
      'Transition-loss dissipation power',
      result.transitionLossDissipationPower,
      'W',
    ],
    [
      'Bed-rise potential power',
      result.bedRisePotentialPower,
      'W',
    ],
    [
      'Combined bed-rise and loss power',
      result.combinedBedRiseAndLossPower,
      'W',
    ],
  ]

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
