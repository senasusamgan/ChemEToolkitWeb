import {
  calculateTrapezoidalContractionTransitionLoss,
} from '../trapezoidal-contraction-transition-loss/engine.ts'

import type {
  TrapezoidalMaximumBedRiseContractionLossInput,
  TrapezoidalMaximumBedRiseContractionLossResult,
} from './types.ts'

export const TRAPEZOIDAL_MAXIMUM_BED_RISE_CONTRACTION_LOSS_ENGINE_VERSION =
  'trapezoidal-maximum-bed-rise-contraction-loss-v1'

export type TrapezoidalMaximumBedRiseContractionLossErrorCode =
  | 'INVALID_UPSTREAM_WIDTH'
  | 'INVALID_CONTRACTED_WIDTH'
  | 'INVALID_SIDE_SLOPE'
  | 'INVALID_FLOW_RATE'
  | 'INVALID_UPSTREAM_DEPTH'
  | 'INVALID_LOSS_COEFFICIENT'
  | 'INVALID_DENSITY'
  | 'UPSTREAM_NOT_SUBCRITICAL'
  | 'NUMERICAL_FAILURE'

export class TrapezoidalMaximumBedRiseContractionLossError
  extends Error {
  readonly code:
    TrapezoidalMaximumBedRiseContractionLossErrorCode

  constructor(
    code:
      TrapezoidalMaximumBedRiseContractionLossErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'TrapezoidalMaximumBedRiseContractionLossError'

    this.code =
      code
  }
}

const GRAVITATIONAL_ACCELERATION =
  9.80665

export function calculateTrapezoidalMaximumBedRiseContractionLoss(
  input:
    TrapezoidalMaximumBedRiseContractionLossInput,
): TrapezoidalMaximumBedRiseContractionLossResult {
  if (
    !Number.isFinite(
      input.upstreamBottomWidth,
    ) ||
    input.upstreamBottomWidth <=
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_UPSTREAM_WIDTH',
      'Upstream bottom width must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.contractedBottomWidth,
    ) ||
    input.contractedBottomWidth <=
      0 ||
    input.contractedBottomWidth >=
      input.upstreamBottomWidth
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_CONTRACTED_WIDTH',
      'Contracted bottom width must be positive and smaller than the upstream bottom width.',
    )
  }

  if (
    !Number.isFinite(
      input.sideSlopeHorizontalPerVertical,
    ) ||
    input.sideSlopeHorizontalPerVertical <
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_SIDE_SLOPE',
      'Side slope z must be a finite non-negative horizontal-to-vertical ratio.',
    )
  }

  if (
    !Number.isFinite(
      input.volumetricFlowRate,
    ) ||
    input.volumetricFlowRate <=
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_FLOW_RATE',
      'Volumetric flow rate must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.upstreamFlowDepth,
    ) ||
    input.upstreamFlowDepth <=
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_UPSTREAM_DEPTH',
      'Upstream flow depth must be a positive finite value.',
    )
  }

  if (
    !Number.isFinite(
      input.transitionLossCoefficient,
    ) ||
    input.transitionLossCoefficient <
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_LOSS_COEFFICIENT',
      'Transition-loss coefficient KL must be a finite non-negative value.',
    )
  }

  if (
    !Number.isFinite(
      input.fluidDensity,
    ) ||
    input.fluidDensity <=
      0
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'INVALID_DENSITY',
      'Fluid density must be a positive finite value.',
    )
  }

  let forward

  try {
    forward =
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
          input.upstreamFlowDepth,

        transitionLossCoefficient:
          input.transitionLossCoefficient,

        fluidDensity:
          input.fluidDensity,
      })
  } catch (error) {
    if (
      error &&
      typeof error ===
        'object' &&
      'code' in error &&
      error.code ===
        'UPSTREAM_NOT_SUBCRITICAL'
    ) {
      throw new TrapezoidalMaximumBedRiseContractionLossError(
        'UPSTREAM_NOT_SUBCRITICAL',
        'The maximum bed-rise model requires a clearly subcritical upstream approach flow.',
      )
    }

    throw error
  }

  const signedBedElevationAllowance =
    forward.availableSpecificEnergyMargin

  const thresholdTolerance =
    Math.max(
      1e-10,
      forward.upstreamSpecificEnergy *
      1e-9,
    )

  const maximumAllowableBedRise =
    signedBedElevationAllowance >
    0
      ? signedBedElevationAllowance
      : 0

  const requiredBedLowering =
    signedBedElevationAllowance <
    0
      ? -signedBedElevationAllowance
      : 0

  let bedRiseStatus =
    ''

  if (
    signedBedElevationAllowance >
    thresholdTolerance
  ) {
    bedRiseStatus =
      'Positive bed-rise allowance before choking'
  } else if (
    signedBedElevationAllowance <
    -thresholdTolerance
  ) {
    bedRiseStatus =
      'Already choked — bed lowering required'
  } else {
    bedRiseStatus =
      'At loss-adjusted choking threshold'
  }

  const upstreamSpecificEnergy =
    forward.upstreamSpecificEnergy

  const upstreamFroudeNumber =
    forward.upstreamFroudeNumber

  const minimumRequiredThroatEnergy =
    forward.minimumRequiredUpstreamSpecificEnergy

  const specificEnergyReserve =
    signedBedElevationAllowance

  const lossAdjustedControlDepth =
    forward.lossAdjustedControlDepth

  const lossAdjustedControlVelocity =
    forward.lossAdjustedControlVelocity

  const lossAdjustedControlFroudeNumber =
    forward.lossAdjustedControlFroudeNumber

  const theoreticalControlFroudeNumber =
    forward.theoreticalControlFroudeNumber

  const controlSpecificEnergyWithoutLoss =
    forward.controlSpecificEnergyWithoutLoss

  const transitionLossHeadAtThreshold =
    forward.controlTransitionLossHead

  const crestBedElevationRelativeToUpstream =
    signedBedElevationAllowance

  const crestWaterSurfaceElevationRelativeToUpstreamBed =
    crestBedElevationRelativeToUpstream +
    lossAdjustedControlDepth

  const waterSurfaceElevationChangeAtThreshold =
    crestWaterSurfaceElevationRelativeToUpstreamBed -
    input.upstreamFlowDepth

  const exactThresholdEnergyResidual =
    upstreamSpecificEnergy -
    (
      crestBedElevationRelativeToUpstream +
      minimumRequiredThroatEnergy
    )

  const controlConditionResidual =
    forward.controlConditionResidual

  const contractionRatio =
    input.contractedBottomWidth /
    input.upstreamBottomWidth

  const contractedWidthReduction =
    input.upstreamBottomWidth -
    input.contractedBottomWidth

  const lossAdjustedMinimumContractedBottomWidth =
    forward.lossAdjustedMinimumContractedBottomWidth

  const widthSafetyMarginAtCurrentBed =
    input.contractedBottomWidth -
    lossAdjustedMinimumContractedBottomWidth

  const massFlowRate =
    forward.massFlowRate

  const transitionLossDissipationPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    transitionLossHeadAtThreshold

  const maximumBedRisePotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    maximumAllowableBedRise

  const requiredBedLoweringPotentialPower =
    input.fluidDensity *
    GRAVITATIONAL_ACCELERATION *
    input.volumetricFlowRate *
    requiredBedLowering

  const positiveValues = [
    upstreamSpecificEnergy,

    upstreamFroudeNumber,

    minimumRequiredThroatEnergy,

    lossAdjustedControlDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    contractionRatio,

    contractedWidthReduction,

    massFlowRate,
  ]

  const nonNegativeValues = [
    maximumAllowableBedRise,

    requiredBedLowering,

    transitionLossHeadAtThreshold,

    transitionLossDissipationPower,

    maximumBedRisePotentialPower,

    requiredBedLoweringPotentialPower,

    lossAdjustedMinimumContractedBottomWidth,
  ]

  if (
    !positiveValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    positiveValues.some(
      value =>
        value <=
        0,
    ) ||
    !nonNegativeValues.every(
      value =>
        Number.isFinite(value),
    ) ||
    nonNegativeValues.some(
      value =>
        value <
        0,
    ) ||
    upstreamFroudeNumber >=
      1 ||
    contractionRatio >=
      1 ||
    !Number.isFinite(
      signedBedElevationAllowance,
    ) ||
    !Number.isFinite(
      waterSurfaceElevationChangeAtThreshold,
    ) ||
    !Number.isFinite(
      widthSafetyMarginAtCurrentBed,
    ) ||
    !Number.isFinite(
      exactThresholdEnergyResidual,
    ) ||
    Math.abs(
      exactThresholdEnergyResidual,
    ) >
      1e-9 ||
    !Number.isFinite(
      controlConditionResidual,
    ) ||
    Math.abs(
      controlConditionResidual,
    ) >
      1e-9 ||
    Math.abs(
      lossAdjustedControlFroudeNumber -
      theoreticalControlFroudeNumber
    ) >
      1e-9
  ) {
    throw new TrapezoidalMaximumBedRiseContractionLossError(
      'NUMERICAL_FAILURE',
      'The maximum bed-rise solution failed its energy or loss-adjusted control-state checks.',
    )
  }

  return {
    bedRiseStatus,

    signedBedElevationAllowance,

    maximumAllowableBedRise,

    requiredBedLowering,

    upstreamSpecificEnergy,

    upstreamFroudeNumber,

    minimumRequiredThroatEnergy,

    specificEnergyReserve,

    lossAdjustedControlDepth,

    lossAdjustedControlVelocity,

    lossAdjustedControlFroudeNumber,

    theoreticalControlFroudeNumber,

    controlSpecificEnergyWithoutLoss,

    transitionLossHeadAtThreshold,

    crestBedElevationRelativeToUpstream,

    crestWaterSurfaceElevationRelativeToUpstreamBed,

    waterSurfaceElevationChangeAtThreshold,

    exactThresholdEnergyResidual,

    controlConditionResidual,

    contractionRatio,

    contractedWidthReduction,

    lossAdjustedMinimumContractedBottomWidth,

    widthSafetyMarginAtCurrentBed,

    massFlowRate,

    transitionLossDissipationPower,

    maximumBedRisePotentialPower,

    requiredBedLoweringPotentialPower,

    modelName:
      'Maximum Bed Rise Through a Trapezoidal Contraction with Transition Loss',

    limitationDescription:
      'One-dimensional choking-limit analysis combining lateral contraction, bed-elevation rise and a lumped transition loss hL = KL·Vthroat²/(2g). Positive signed allowance is the maximum crest rise before choking; a negative value indicates the bed must instead be lowered by the reported amount. Hydrostatic pressure and unchanged upstream velocity-distribution coefficient are assumed.',
  }
}

export function createTrapezoidalMaximumBedRiseContractionLossCsv(
  input:
    TrapezoidalMaximumBedRiseContractionLossInput,
  result:
    TrapezoidalMaximumBedRiseContractionLossResult,
): string {
  const rows = [
    [
      'Maximum Bed Rise Through a Trapezoidal Contraction with Transition Loss',
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
      'Upstream flow depth',
      input.upstreamFlowDepth,
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
      'Bed-rise status',
      result.bedRiseStatus,
      '-',
    ],
    [
      'Signed bed-elevation allowance',
      result.signedBedElevationAllowance,
      'm',
    ],
    [
      'Maximum allowable bed rise',
      result.maximumAllowableBedRise,
      'm',
    ],
    [
      'Required bed lowering',
      result.requiredBedLowering,
      'm',
    ],
    [
      'Upstream specific energy',
      result.upstreamSpecificEnergy,
      'm',
    ],
    [
      'Minimum required throat energy',
      result.minimumRequiredThroatEnergy,
      'm',
    ],
    [
      'Loss-adjusted control depth',
      result.lossAdjustedControlDepth,
      'm',
    ],
    [
      'Loss-adjusted control velocity',
      result.lossAdjustedControlVelocity,
      'm/s',
    ],
    [
      'Loss-adjusted control Froude number',
      result.lossAdjustedControlFroudeNumber,
      '-',
    ],
    [
      'Theoretical control Froude number',
      result.theoreticalControlFroudeNumber,
      '-',
    ],
    [
      'Transition-loss head at threshold',
      result.transitionLossHeadAtThreshold,
      'm',
    ],
    [
      'Crest water-surface elevation relative to upstream bed',
      result.crestWaterSurfaceElevationRelativeToUpstreamBed,
      'm',
    ],
    [
      'Water-surface elevation change at threshold',
      result.waterSurfaceElevationChangeAtThreshold,
      'm',
    ],
    [
      'Exact threshold energy residual',
      result.exactThresholdEnergyResidual,
      'm',
    ],
    [
      'Loss-adjusted minimum contracted width',
      result.lossAdjustedMinimumContractedBottomWidth,
      'm',
    ],
    [
      'Width safety margin at current bed',
      result.widthSafetyMarginAtCurrentBed,
      'm',
    ],
    [
      'Transition-loss dissipation power',
      result.transitionLossDissipationPower,
      'W',
    ],
    [
      'Maximum bed-rise potential power',
      result.maximumBedRisePotentialPower,
      'W',
    ],
    [
      'Required bed-lowering potential power',
      result.requiredBedLoweringPotentialPower,
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
